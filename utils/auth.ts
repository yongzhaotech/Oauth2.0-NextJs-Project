import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { mysql } from "@/utils/mysql";
import { getOidcSettings } from "@/utils/oidc";

export type Tokens = {
    access_token?: string;
    refresh_token?: string;
    refresh_token_expires_in?: number;
};

type StoredTokens = {
    access_token?: unknown;
    refresh_token?: unknown;
    refresh_token_expires_at?: unknown;
};

type TokenEndpointResponse = {
    access_token?: unknown;
    refresh_token?: unknown;
    refresh_token_expires_in?: unknown;
};

const refreshBeforeExpiryMs = 30_000;
const defaultRefreshLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const refreshesInProgress = new Map<string, Promise<string | null>>();

export const getSessionId = async () => {
    return (await cookies()).get("session_id")?.value;
};

export const saveTokens = async ({ access_token, refresh_token, refresh_token_expires_in }: Tokens) => {
    const cookieStore = await cookies();
    const previousSessionId = cookieStore.get("session_id")?.value;
    const sessionId = randomUUID();
    const refreshLifetime = typeof refresh_token_expires_in === "number" &&
        Number.isFinite(refresh_token_expires_in) && refresh_token_expires_in > 0
        ? refresh_token_expires_in * 1000
        : defaultRefreshLifetimeMs;
    const expiresAt = Date.now() + refreshLifetime;

    const columns = ["session_id", "refresh_token_expires_at"];
    const values: (string | number)[] = [sessionId, expiresAt];
    if (access_token) {
        columns.push("access_token");
        values.push(access_token);
    }
    if (refresh_token) {
        columns.push("refresh_token");
        values.push(refresh_token);
    }

    const saved = await mysql.executeStmt(
        `insert into auth_tokens (${columns.join(", ")}) values (${columns.map(() => "?").join(", ")})`,
        values
    );
    if (saved.error) {
        throw new Error("Could not save authentication tokens");
    }
    if (previousSessionId && previousSessionId !== sessionId) {
        await mysql.executeStmt("delete from auth_tokens where session_id = ?", [previousSessionId]);
    }

    cookieStore.set("session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
};

const getStoredTokens = async (sessionId: string): Promise<StoredTokens | undefined> => {
    const result = await mysql.executeQuery("select", "auth_tokens", { session_id: sessionId });
    if (result.error) {
        throw new Error("Could not read authentication tokens");
    }
    return result.data?.[0] as StoredTokens | undefined;
};

const isAccessTokenNearExpiry = (token: unknown): boolean => {
    if (typeof token !== "string") return true;
    try {
        const payloadPart = token.split(".")[1];
        if (!payloadPart) return true;
        const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as { exp?: unknown };
        return typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now() + refreshBeforeExpiryMs;
    } catch {
        return true;
    }
};

const clearSessionTokens = async (sessionId: string, refreshToken: string) => {
    await mysql.executeStmt(
        "delete from auth_tokens where session_id = ? and refresh_token = ?",
        [sessionId, refreshToken]
    );
};

const refreshTokens = async (sessionId: string, stored: StoredTokens): Promise<string | null> => {
    if (typeof stored.refresh_token !== "string" || !stored.refresh_token) return null;

    const { clientId, metadata } = await getOidcSettings();
    let response: Response;
    try {
        response = await fetch(metadata.token_endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                client_id: clientId,
                refresh_token: stored.refresh_token,
            }),
            cache: "no-store",
        });
    } catch {
        return null;
    }

    if (!response.ok) {
        if (response.status === 400 || response.status === 401) {
            // Another concurrent request may already have rotated this one-time token.
            const latest = await getStoredTokens(sessionId);
            if (
                latest &&
                latest.refresh_token !== stored.refresh_token &&
                !isAccessTokenNearExpiry(latest.access_token)
            ) {
                return latest.access_token as string;
            }
            await clearSessionTokens(sessionId, stored.refresh_token);
        }
        return null;
    }

    const tokenSet = await response.json() as TokenEndpointResponse;
    if (typeof tokenSet.access_token !== "string" || typeof tokenSet.refresh_token !== "string") {
        return null;
    }

    const refreshLifetimeSeconds = Number(tokenSet.refresh_token_expires_in);
    const refreshExpiresAt = Number.isFinite(refreshLifetimeSeconds) && refreshLifetimeSeconds > 0
        ? Date.now() + refreshLifetimeSeconds * 1000
        : Date.now() + defaultRefreshLifetimeMs;
    const saved = await mysql.executeStmt(
        "update auth_tokens set access_token = ?, refresh_token = ?, refresh_token_expires_at = ? where session_id = ? and refresh_token = ?",
        [tokenSet.access_token, tokenSet.refresh_token, refreshExpiresAt, sessionId, stored.refresh_token]
    );
    if (saved.error) {
        throw new Error("Could not save refreshed authentication tokens");
    }
    if (saved.affectedRows !== 1) {
        const latest = await getStoredTokens(sessionId);
        return typeof latest?.access_token === "string" && !isAccessTokenNearExpiry(latest.access_token)
            ? latest.access_token
            : null;
    }

    return tokenSet.access_token;
};

export const getAccessToken = async (): Promise<string | null> => {
    const sessionId = await getSessionId();
    if (!sessionId) return null;

    const stored = await getStoredTokens(sessionId);
    if (!stored) return null;
    if (!isAccessTokenNearExpiry(stored.access_token)) {
        return stored.access_token as string;
    }

    const pendingRefresh = refreshesInProgress.get(sessionId);
    if (pendingRefresh) return pendingRefresh;

    const refresh = refreshTokens(sessionId, stored);
    refreshesInProgress.set(sessionId, refresh);
    try {
        return await refresh;
    } finally {
        if (refreshesInProgress.get(sessionId) === refresh) {
            refreshesInProgress.delete(sessionId);
        }
    }
};

export const getRefreshToken = async (): Promise<string | null> => {
    const sessionId = await getSessionId();
    if (!sessionId) return null;
    const stored = await getStoredTokens(sessionId);
    return typeof stored?.refresh_token === "string" ? stored.refresh_token : null;
};

type AccessTokenPayload = Record<string, unknown> & { name?: string };

const decodeAccessToken = (accessToken: string): AccessTokenPayload | null => {
    try {
        const parts = accessToken.split(".");
        if (parts.length !== 3 || !/^[A-Za-z0-9_-]+$/.test(parts[1])) return null;

        const payload: unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
        if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return null;

        const claims = payload as Record<string, unknown>;
        return {
            ...claims,
            name: typeof claims.name === "string" ? claims.name : undefined,
        };
    } catch {
        return null;
    }
};

export const getAccessTokenPayload = async (): Promise<AccessTokenPayload | null> => {
    const accessToken = await getAccessToken();
    if (!accessToken) return null;
    return decodeAccessToken(accessToken);
};
