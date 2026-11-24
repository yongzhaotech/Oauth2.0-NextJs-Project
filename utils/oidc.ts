import "server-only";
import { createPublicKey, verify as verifySignature, type JsonWebKey } from "node:crypto";

type ProviderMetadata = {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    jwks_uri: string;
};

type JwtHeader = {
    alg?: unknown;
    kid?: unknown;
};

type IdTokenClaims = {
    iss?: unknown;
    sub?: unknown;
    aud?: unknown;
    exp?: unknown;
    iat?: unknown;
    nonce?: unknown;
};

type AccessTokenClaims = {
    iss?: unknown;
    sub?: unknown;
    aud?: unknown;
    exp?: unknown;
    iat?: unknown;
    nbf?: unknown;
    client_id?: unknown;
    scope?: unknown;
    access_level?: unknown;
};

type SigningJwk = {
    kid?: string;
    kty?: string;
    use?: string;
    alg?: string;
    n?: string;
    e?: string;
};

export const getOidcSettings = async () => {
    const authority = process.env.OIDC_AUTHORITY || process.env.NEXT_PUBLIC_OIDC_AUTHORITY;
    const clientId = process.env.OIDC_CLIENT_ID || process.env.NEXT_PUBLIC_OIDC_CLIENT_ID;
    if (!authority || !clientId) {
        throw new Error("OIDC authority and client ID must be configured");
    }

    const response = await fetch(`${authority.replace(/\/$/, "")}/.well-known/openid-configuration`, {
        cache: "no-store",
    });
    if (!response.ok) throw new Error("Could not load OIDC provider metadata");

    const metadata = await response.json() as ProviderMetadata;
    if (!metadata.issuer || !metadata.authorization_endpoint || !metadata.token_endpoint || !metadata.jwks_uri) {
        throw new Error("OIDC provider metadata is incomplete");
    }

    return { authority, clientId, metadata };
};

export const getCallbackUri = (requestUrl: string): string => {
    return process.env.OIDC_REDIRECT_URI || new URL("/api/auth/callback", requestUrl).toString();
};

const decodeJwtPart = <T>(part: string): T => {
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as T;
};

export const validateIdToken = async (
    idToken: string,
    expectedNonce: string,
    expectedClientId: string,
    metadata: ProviderMetadata
): Promise<IdTokenClaims> => {
    const parts = idToken.split(".");
    if (parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) {
        throw new Error("Malformed ID token");
    }

    const header = decodeJwtPart<JwtHeader>(parts[0]);
    const claims = decodeJwtPart<IdTokenClaims>(parts[1]);
    if (header.alg !== "RS256" || typeof header.kid !== "string") {
        throw new Error("Unsupported ID token signing algorithm");
    }

    const jwksResponse = await fetch(metadata.jwks_uri, { cache: "no-store" });
    if (!jwksResponse.ok) throw new Error("Could not load OIDC signing keys");
    const jwks = await jwksResponse.json() as { keys?: SigningJwk[] };
    const jwk = jwks.keys?.find(key => key.kid === header.kid && key.kty === "RSA" && (!key.use || key.use === "sig"));
    if (!jwk) throw new Error("ID token signing key was not found");

    const publicKey = createPublicKey({ key: jwk as JsonWebKey, format: "jwk" });
    const signature = Buffer.from(parts[2], "base64url");
    const signedContent = Buffer.from(`${parts[0]}.${parts[1]}`, "ascii");
    if (!verifySignature("RSA-SHA256", signedContent, publicKey, signature)) {
        throw new Error("ID token signature is invalid");
    }

    const audienceMatches = claims.aud === expectedClientId ||
        (Array.isArray(claims.aud) && claims.aud.includes(expectedClientId));
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (
        claims.iss !== metadata.issuer ||
        !audienceMatches ||
        typeof claims.sub !== "string" ||
        typeof claims.exp !== "number" || claims.exp <= nowSeconds ||
        (typeof claims.iat === "number" && claims.iat > nowSeconds + 60) ||
        claims.nonce !== expectedNonce
    ) {
        throw new Error("ID token claims are invalid");
    }

    return claims;
};

export const validateAccessToken = async (
    accessToken: string,
    expectedClientId: string,
    metadata: ProviderMetadata
): Promise<AccessTokenClaims> => {
    const parts = accessToken.split(".");
    if (parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) {
        throw new Error("Malformed access token");
    }

    const header = decodeJwtPart<JwtHeader>(parts[0]);
    const claims = decodeJwtPart<AccessTokenClaims>(parts[1]);
    if (header.alg !== "RS256" || typeof header.kid !== "string") {
        throw new Error("Unsupported access token signing algorithm");
    }

    const jwksResponse = await fetch(metadata.jwks_uri, { cache: "no-store" });
    if (!jwksResponse.ok) throw new Error("Could not load OIDC signing keys");
    const jwks = await jwksResponse.json() as { keys?: SigningJwk[] };
    const jwk = jwks.keys?.find(key =>
        key.kid === header.kid && key.kty === "RSA" && (!key.use || key.use === "sig") && (!key.alg || key.alg === "RS256")
    );
    if (!jwk) throw new Error("Access token signing key was not found");

    const publicKey = createPublicKey({ key: jwk as JsonWebKey, format: "jwk" });
    const signature = Buffer.from(parts[2], "base64url");
    const signedContent = Buffer.from(`${parts[0]}.${parts[1]}`, "ascii");
    if (!verifySignature("RSA-SHA256", signedContent, publicKey, signature)) {
        throw new Error("Access token signature is invalid");
    }

    const expectedAudience = process.env.OIDC_ACCESS_TOKEN_AUDIENCE || "esaleshome-api";
    const audienceMatches = claims.aud === expectedAudience ||
        (Array.isArray(claims.aud) && claims.aud.includes(expectedAudience));
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (
        claims.iss !== metadata.issuer ||
        !audienceMatches ||
        claims.client_id !== expectedClientId ||
        typeof claims.sub !== "string" ||
        typeof claims.exp !== "number" || claims.exp <= nowSeconds ||
        (typeof claims.nbf === "number" && claims.nbf > nowSeconds) ||
        (typeof claims.iat === "number" && claims.iat > nowSeconds + 60) ||
        typeof claims.scope !== "string" || !claims.scope.split(/\s+/).includes("access_level")
    ) {
        throw new Error("Access token claims are invalid");
    }

    return claims;
};
