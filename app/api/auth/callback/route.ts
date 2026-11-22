import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveTokens } from "@/utils/auth";
import { getCallbackUri, getOidcSettings, validateIdToken } from "@/utils/oidc";

const transactionCookieNames = ["oidc_state", "oidc_nonce", "oidc_code_verifier"] as const;

const finish = (request: NextRequest, destination: string, status?: number) => {
    const response = NextResponse.redirect(new URL(destination, request.url), status);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Pragma", "no-cache");
    for (const name of transactionCookieNames) {
        response.cookies.set(name, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    }
    return response;
};

export async function GET(request: NextRequest) {
    const state = request.nextUrl.searchParams.get("state");
    const code = request.nextUrl.searchParams.get("code");
    const expectedState = request.cookies.get("oidc_state")?.value;
    const nonce = request.cookies.get("oidc_nonce")?.value;
    const codeVerifier = request.cookies.get("oidc_code_verifier")?.value;

    if (!state || !expectedState || !nonce || !codeVerifier) {
        return finish(request, "/?auth_error=invalid_callback", 303);
    }
    const stateBuffer = Buffer.from(state);
    const expectedStateBuffer = Buffer.from(expectedState);
    if (stateBuffer.length !== expectedStateBuffer.length || !timingSafeEqual(stateBuffer, expectedStateBuffer)) {
        return finish(request, "/?auth_error=invalid_callback", 303);
    }
    if (request.nextUrl.searchParams.has("error") || !code || !/^[A-Za-z0-9_-]{43}$/.test(code)) {
        return finish(request, "/?auth_error=authorization_failed", 303);
    }

    try {
        const { clientId, metadata } = await getOidcSettings();
        const tokenResponse = await fetch(metadata.token_endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                client_id: clientId,
                code,
                redirect_uri: getCallbackUri(request.url),
                code_verifier: codeVerifier,
            }),
            cache: "no-store",
        });
        if (!tokenResponse.ok) {
            return finish(request, "/?auth_error=token_exchange_failed", 303);
        }

        const tokenSet = await tokenResponse.json() as {
            access_token?: unknown;
            refresh_token?: unknown;
            refresh_token_expires_in?: unknown;
            id_token?: unknown;
        };
        if (
            typeof tokenSet.access_token !== "string" ||
            typeof tokenSet.refresh_token !== "string" ||
            typeof tokenSet.id_token !== "string"
        ) {
            return finish(request, "/?auth_error=invalid_token_response", 303);
        }

        await validateIdToken(tokenSet.id_token, nonce, clientId, metadata);
        await saveTokens({
            access_token: tokenSet.access_token,
            refresh_token: tokenSet.refresh_token,
            refresh_token_expires_in: typeof tokenSet.refresh_token_expires_in === "number"
                ? tokenSet.refresh_token_expires_in
                : undefined,
        });

        return finish(request, "/", 303);
    } catch {
        return finish(request, "/?auth_error=sign_in_failed", 303);
    }
}
