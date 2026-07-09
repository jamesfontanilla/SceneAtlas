import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  sceneAtlasAuthCookieBaseOptions,
  sceneAtlasAuthReturnToCookieName,
  sceneAtlasGoogleStateCookieName,
  sceneAtlasGoogleVerifierCookieName
} from "@/lib/session";

function safeReturnTo(value: string | null) {
  return value?.startsWith("/") ? value : "/search";
}

function googleCallbackUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  return process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() || `${appUrl}/api/auth/google/callback`;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  if (!clientId) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("error", "Google OAuth is not configured yet.");
    return NextResponse.redirect(url);
  }

  const state = randomBytes(16).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const returnTo = safeReturnTo(new URL(request.url).searchParams.get("returnTo"));

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", googleCallbackUrl());
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(sceneAtlasGoogleStateCookieName, state, {
    ...sceneAtlasAuthCookieBaseOptions,
    maxAge: 60 * 10
  });
  response.cookies.set(sceneAtlasGoogleVerifierCookieName, verifier, {
    ...sceneAtlasAuthCookieBaseOptions,
    maxAge: 60 * 10
  });
  response.cookies.set(sceneAtlasAuthReturnToCookieName, returnTo, {
    ...sceneAtlasAuthCookieBaseOptions,
    maxAge: 60 * 10
  });

  return response;
}
