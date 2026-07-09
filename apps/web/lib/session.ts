import { cookies } from "next/headers";

export const sceneAtlasSessionCookieName = "sceneatlas_session";
export const sceneAtlasGoogleStateCookieName = "sceneatlas_google_oauth_state";
export const sceneAtlasGoogleVerifierCookieName = "sceneatlas_google_oauth_verifier";
export const sceneAtlasAuthReturnToCookieName = "sceneatlas_auth_return_to";

export const sceneAtlasAuthCookieBaseOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30
};

export async function getSceneAtlasSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(sceneAtlasSessionCookieName)?.value ?? "";
}

export async function setSceneAtlasSessionToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(sceneAtlasSessionCookieName, token, sceneAtlasAuthCookieBaseOptions);
}

export async function clearSceneAtlasSessionToken() {
  const cookieStore = await cookies();
  cookieStore.delete(sceneAtlasSessionCookieName);
}

export async function setSceneAtlasAuthCookie(name: string, value: string, maxAgeSeconds = 60 * 10) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    ...sceneAtlasAuthCookieBaseOptions,
    maxAge: maxAgeSeconds
  });
}

export async function clearSceneAtlasAuthCookie(name: string) {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}
