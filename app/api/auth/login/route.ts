import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCallbackUri, getOidcSettings } from "@/utils/oidc";

const transactionCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 5 * 60,
};

export async function GET(request: NextRequest) {
    try {
        const { clientId, metadata } = await getOidcSettings();
        const state = randomBytes(32).toString("base64url");
        const nonce = randomBytes(32).toString("base64url");
        const codeVerifier = randomBytes(32).toString("base64url");
        const codeChallenge = createHash("sha256").update(codeVerifier, "ascii").digest("base64url");
        const callbackUri = getCallbackUri(request.url);

        const authorizationUrl = new URL(metadata.authorization_endpoint);
        authorizationUrl.search = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUri,
            response_type: "code",
            scope: process.env.OIDC_SCOPE || "openid profile email api.read access_level",
            state,
            nonce,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        }).toString();

        const response = NextResponse.redirect(authorizationUrl);
        response.headers.set("Cache-Control", "no-store");
        response.headers.set("Pragma", "no-cache");
        response.cookies.set("oidc_state", state, transactionCookieOptions);
        response.cookies.set("oidc_nonce", nonce, transactionCookieOptions);
        response.cookies.set("oidc_code_verifier", codeVerifier, transactionCookieOptions);
        return response;
    } catch {
        return NextResponse.json({ error: "Could not start sign-in" }, { status: 500 });
    }
}
