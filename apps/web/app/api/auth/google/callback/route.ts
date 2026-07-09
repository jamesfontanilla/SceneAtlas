import { NextRequest, NextResponse } from "next/server";
import {
  sceneAtlasAuthCookieBaseOptions,
  sceneAtlasAuthReturnToCookieName,
  sceneAtlasGoogleStateCookieName,
  sceneAtlasGoogleVerifierCookieName,
  sceneAtlasSessionCookieName
} from "@/lib/session";

function googleCallbackUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  return process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() || `${appUrl}/api/auth/google/callback`;
}

function apiBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return base;
}

function signInRedirect(request: NextRequest, error: string) {
  const url = new URL("/sign-in", request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

async function readJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return signInRedirect(request, `Google sign-in failed: ${oauthError}.`);
  }

  if (!code || !state) {
    return signInRedirect(request, "Google sign-in could not be completed.");
  }

  const expectedState = request.cookies.get(sceneAtlasGoogleStateCookieName)?.value;
  const verifier = request.cookies.get(sceneAtlasGoogleVerifierCookieName)?.value;
  const returnTo = request.cookies.get(sceneAtlasAuthReturnToCookieName)?.value || "/search";

  if (!expectedState || expectedState !== state || !verifier) {
    return signInRedirect(request, "Google sign-in state was invalid.");
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return signInRedirect(request, "Google OAuth is not configured yet.");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: googleCallbackUrl(),
      grant_type: "authorization_code",
      code_verifier: verifier
    })
  });

  if (!tokenResponse.ok) {
    return signInRedirect(request, "Google token exchange failed.");
  }

  const tokenPayload = (await readJsonResponse(tokenResponse)) as { access_token?: string };
  if (!tokenPayload.access_token) {
    return signInRedirect(request, "Google token exchange failed.");
  }

  const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      authorization: `Bearer ${tokenPayload.access_token}`
    }
  });

  if (!userInfoResponse.ok) {
    return signInRedirect(request, "Google profile lookup failed.");
  }

  const userInfo = (await readJsonResponse(userInfoResponse)) as {
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
  };

  if (!userInfo.sub || !userInfo.email) {
    return signInRedirect(request, "Google profile lookup failed.");
  }

  const authResponse = await fetch(`${apiBaseUrl()}/auth/google`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      googleSub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name || userInfo.email,
      avatar: userInfo.picture,
      emailVerified: Boolean(userInfo.email_verified)
    })
  });

  if (!authResponse.ok) {
    const payload = await readJsonResponse(authResponse);
    const message = typeof payload.message === "string" ? payload.message : "Google sign-in failed.";
    return signInRedirect(request, message);
  }

  const payload = (await readJsonResponse(authResponse)) as { sessionToken?: string };
  if (!payload.sessionToken) {
    return signInRedirect(request, "Google sign-in failed.");
  }

  const response = NextResponse.redirect(new URL(returnTo, request.url));
  response.cookies.set(sceneAtlasSessionCookieName, payload.sessionToken, sceneAtlasAuthCookieBaseOptions);
  response.cookies.set(sceneAtlasGoogleStateCookieName, "", { ...sceneAtlasAuthCookieBaseOptions, maxAge: 0 });
  response.cookies.set(sceneAtlasGoogleVerifierCookieName, "", { ...sceneAtlasAuthCookieBaseOptions, maxAge: 0 });
  response.cookies.set(sceneAtlasAuthReturnToCookieName, "", { ...sceneAtlasAuthCookieBaseOptions, maxAge: 0 });
  return response;
}
