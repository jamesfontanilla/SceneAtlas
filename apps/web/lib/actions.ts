"use server";

import { redirect } from "next/navigation";
import { sceneAtlasApiRequest } from "./api";
import {
  clearSceneAtlasSessionToken,
  getSceneAtlasSessionToken,
  setSceneAtlasSessionToken
} from "./session";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "1" || value === "true" || value === "on";
}

function redirectTo(formData: FormData, fallback: string) {
  return readString(formData, "returnTo") || fallback;
}

function buildRedirectUrl(path: string, params: Record<string, string | undefined> = {}) {
  const url = new URL(path, "http://localhost");
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return `${url.pathname}${url.search}`;
}

function redirectWithError(path: string, error: unknown, extraParams: Record<string, string | undefined> = {}) {
  const message = error instanceof Error ? error.message : String(error);
  redirect(buildRedirectUrl(path, { ...extraParams, error: message }));
}

async function requireSignedIn(returnTo: string) {
  const sessionToken = await getSceneAtlasSessionToken();
  if (!sessionToken) {
    redirect(buildRedirectUrl("/sign-in", { returnTo }));
  }
}

async function jsonRequest<T>(path: string, method: "POST" | "PUT", body?: unknown) {
  return sceneAtlasApiRequest<T>(path, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

export async function signOutAction(formData: FormData) {
  const returnTo = redirectTo(formData, "/");
  const sessionToken = await getSceneAtlasSessionToken();

  try {
    if (sessionToken) {
      await sceneAtlasApiRequest("/auth/sign-out", { method: "POST" });
    }
  } catch (error) {
    console.warn("SceneAtlas sign-out request failed.", error);
  }

  await clearSceneAtlasSessionToken();
  redirect(returnTo);
}

export async function startSignUpAction(formData: FormData) {
  const name = readString(formData, "name");
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const confirmPassword = readString(formData, "confirmPassword");
  const avatar = readString(formData, "avatar") || undefined;
  const returnTo = redirectTo(formData, "/search");
  const verifyPath = buildRedirectUrl("/verify-email", {
    email,
    returnTo
  });

  if (!name || !email || !password) {
    redirectWithError("/sign-up", new Error("Name, email, and password are required."), { returnTo });
  }

  if (password !== confirmPassword) {
    redirectWithError("/sign-up", new Error("Passwords do not match."), { returnTo, email });
  }

  try {
    await sceneAtlasApiRequest("/auth/sign-up", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        avatar
      })
    });
  } catch (error) {
    redirectWithError("/sign-up", error, { returnTo, email });
  }

  redirect(verifyPath);
}

export async function resendVerificationAction(formData: FormData) {
  const email = readString(formData, "email");
  const returnTo = redirectTo(formData, "/search");

  if (!email) {
    redirectWithError("/verify-email", new Error("Email is required."), { returnTo });
  }

  try {
    await sceneAtlasApiRequest("/auth/resend-verification", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email })
    });
  } catch (error) {
    redirectWithError("/verify-email", error, { email, returnTo });
  }

  redirect(buildRedirectUrl("/verify-email", { email, returnTo, message: "We sent a fresh verification code." }));
}

export async function verifyEmailAction(formData: FormData) {
  const email = readString(formData, "email");
  const code = readString(formData, "code");
  const returnTo = redirectTo(formData, "/search");

  if (!email || !code) {
    redirectWithError("/verify-email", new Error("Email and verification code are required."), { email, returnTo });
  }

  try {
    const result = await sceneAtlasApiRequest<{ sessionToken: string }>("/auth/verify-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, code })
    });
    await setSceneAtlasSessionToken(result.sessionToken);
  } catch (error) {
    redirectWithError("/verify-email", error, { email, returnTo });
  }

  redirect(returnTo);
}

export async function signInAction(formData: FormData) {
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const returnTo = redirectTo(formData, "/search");

  if (!email || !password) {
    redirectWithError("/sign-in", new Error("Email and password are required."), { returnTo, email });
  }

  try {
    const result = await sceneAtlasApiRequest<{ sessionToken: string }>("/auth/sign-in", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    await setSceneAtlasSessionToken(result.sessionToken);
  } catch (error) {
    redirectWithError("/sign-in", error, { returnTo, email });
  }

  redirect(returnTo);
}

export async function forgotPasswordAction(formData: FormData) {
  const email = readString(formData, "email");
  const returnTo = redirectTo(formData, "/search");

  if (!email) {
    redirectWithError("/forgot-password", new Error("Email is required."), { returnTo });
  }

  try {
    await sceneAtlasApiRequest("/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email })
    });
  } catch (error) {
    redirectWithError("/forgot-password", error, { returnTo, email });
  }

  redirect(buildRedirectUrl("/sign-in", { message: "If that email exists, we sent a reset link." }));
}

export async function resetPasswordAction(formData: FormData) {
  const token = readString(formData, "token");
  const password = readString(formData, "password");
  const confirmPassword = readString(formData, "confirmPassword");
  const returnTo = redirectTo(formData, "/search");
  const email = readString(formData, "email");

  if (!token || !password) {
    redirectWithError("/reset-password", new Error("Reset token and new password are required."), { email, returnTo });
  }

  if (password !== confirmPassword) {
    redirectWithError("/reset-password", new Error("Passwords do not match."), { email, returnTo, token });
  }

  try {
    const result = await sceneAtlasApiRequest<{ sessionToken: string }>("/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    await setSceneAtlasSessionToken(result.sessionToken);
  } catch (error) {
    redirectWithError("/reset-password", error, { email, returnTo, token });
  }

  redirect(returnTo);
}

export async function toggleWatchlistAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/watchlist"));

  const movieId = readString(formData, "movieId");
  if (!movieId) {
    redirectWithError(redirectTo(formData, "/watchlist"), new Error("Movie id is required."));
  }

  const action = readString(formData, "watchlistAction");
  const returnTo = redirectTo(formData, `/movies/${movieId}`);

  try {
    if (action === "remove") {
      await sceneAtlasApiRequest(`/watchlist/${encodeURIComponent(movieId)}`, { method: "DELETE" });
    } else {
      await sceneAtlasApiRequest(`/watchlist/${encodeURIComponent(movieId)}`, { method: "POST" });
    }
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function upsertRatingAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/search"));

  const movieId = readString(formData, "movieId");
  if (!movieId) {
    redirectWithError(redirectTo(formData, "/search"), new Error("Movie id is required."));
  }

  const value = Number(readString(formData, "value"));
  const returnTo = redirectTo(formData, `/movies/${movieId}`);
  if (!Number.isFinite(value) || value < 1 || value > 5) {
    redirectWithError(returnTo, new Error("Rating must be between 1 and 5."));
  }

  try {
    await jsonRequest(`/ratings/${encodeURIComponent(movieId)}`, "PUT", { value });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function upsertReviewAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/search"));

  const movieId = readString(formData, "movieId");
  if (!movieId) {
    redirectWithError(redirectTo(formData, "/search"), new Error("Movie id is required."));
  }

  const returnTo = redirectTo(formData, `/movies/${movieId}`);

  try {
    await jsonRequest(`/reviews/${encodeURIComponent(movieId)}`, "POST", {
      title: readString(formData, "title"),
      body: readString(formData, "body"),
      spoilerTag: readBoolean(formData, "spoilerTag")
    });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function createCollectionAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/collections"));

  const returnTo = redirectTo(formData, "/collections");
  const name = readString(formData, "name");
  if (!name) {
    redirectWithError(returnTo, new Error("Collection name is required."));
  }

  try {
    await jsonRequest("/collections", "POST", {
      name,
      description: readString(formData, "description") || undefined,
      visibility: readString(formData, "visibility") === "shared" ? "shared" : "private"
    });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function addMovieToCollectionAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/collections"));

  const collectionId = readString(formData, "collectionId");
  const movieId = readString(formData, "movieId");
  const returnTo = redirectTo(formData, "/collections");

  if (!collectionId || !movieId) {
    redirectWithError(returnTo, new Error("Collection and movie ids are required."));
  }

  try {
    await sceneAtlasApiRequest(`/collections/${encodeURIComponent(collectionId)}/movies/${encodeURIComponent(movieId)}`, {
      method: "POST"
    });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function removeMovieFromCollectionAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/collections"));

  const collectionId = readString(formData, "collectionId");
  const movieId = readString(formData, "movieId");
  const returnTo = redirectTo(formData, "/collections");

  if (!collectionId || !movieId) {
    redirectWithError(returnTo, new Error("Collection and movie ids are required."));
  }

  try {
    await sceneAtlasApiRequest(`/collections/${encodeURIComponent(collectionId)}/movies/${encodeURIComponent(movieId)}`, {
      method: "DELETE"
    });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function upgradeAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/billing"));

  const returnTo = redirectTo(formData, "/billing");

  try {
    await sceneAtlasApiRequest("/subscriptions/upgrade", { method: "POST" });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function downgradeAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/billing"));

  const returnTo = redirectTo(formData, "/billing");

  try {
    await sceneAtlasApiRequest("/subscriptions/downgrade", { method: "POST" });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function exportNotesAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/billing"));

  const movieId = readString(formData, "movieId") || undefined;
  const format = readString(formData, "format") === "markdown" ? "markdown" : "json";
  const returnTo = redirectTo(formData, movieId ? `/movies/${movieId}` : "/billing");

  try {
    await jsonRequest("/exports", "POST", {
      movieId,
      format
    });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function updateProfileAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/profile"));

  const returnTo = redirectTo(formData, "/profile");

  try {
    await sceneAtlasApiRequest("/profile/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        displayName: readString(formData, "displayName") || undefined,
        avatar: readString(formData, "avatar") || undefined
      })
    });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function startChatSessionAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/search"));

  const movieId = readString(formData, "movieId");
  const returnTo = redirectTo(formData, movieId ? `/movies/${movieId}/chat` : "/search");
  if (!movieId) {
    redirectWithError(returnTo, new Error("Movie id is required."));
  }

  try {
    const result = await sceneAtlasApiRequest<{ session: { id: string } } & Record<string, unknown>>("/chat/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        movieId,
        spoilers: readBoolean(formData, "spoilers")
      })
    });
    redirect(`/movies/${movieId}/chat?sessionId=${encodeURIComponent(result.session.id)}`);
  } catch (error) {
    redirectWithError(returnTo, error);
  }
}

export async function sendChatMessageAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/search"));

  const sessionId = readString(formData, "sessionId");
  const movieId = readString(formData, "movieId");
  const content = readString(formData, "content");
  const returnTo = redirectTo(formData, movieId ? `/movies/${movieId}/chat` : "/search");

  if (!sessionId || !movieId || !content) {
    redirectWithError(returnTo, new Error("Session, movie, and message content are required."));
  }

  try {
    await sceneAtlasApiRequest(`/chat/sessions/${encodeURIComponent(sessionId)}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content })
    });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(`/movies/${movieId}/chat?sessionId=${encodeURIComponent(sessionId)}`);
}

export async function archiveChatSessionAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/profile/chats"));

  const sessionId = readString(formData, "sessionId");
  const movieId = readString(formData, "movieId");
  const returnTo = redirectTo(formData, movieId ? `/movies/${movieId}/chat` : "/profile/chats");

  if (!sessionId) {
    redirectWithError(returnTo, new Error("Session id is required."));
  }

  try {
    await sceneAtlasApiRequest(`/chat/sessions/${encodeURIComponent(sessionId)}`, {
      method: "DELETE"
    });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function featureMovieAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/admin"));

  const movieId = readString(formData, "movieId");
  const returnTo = redirectTo(formData, "/admin");

  if (!movieId) {
    redirectWithError(returnTo, new Error("Movie id is required."));
  }

  try {
    await sceneAtlasApiRequest(`/admin/feature/${encodeURIComponent(movieId)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ featured: true })
    });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function invalidateCacheAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/admin"));

  const movieId = readString(formData, "movieId") || undefined;
  const returnTo = redirectTo(formData, "/admin");

  try {
    await sceneAtlasApiRequest("/admin/cache/invalidate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ movieId })
    });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function rebuildAnalysisAction(formData: FormData) {
  await requireSignedIn(redirectTo(formData, "/admin"));

  const movieId = readString(formData, "movieId");
  const returnTo = redirectTo(formData, movieId ? `/movies/${movieId}` : "/admin");
  if (!movieId) {
    redirectWithError(returnTo, new Error("Movie id is required."));
  }

  try {
    await sceneAtlasApiRequest(`/admin/analysis/${encodeURIComponent(movieId)}/rebuild?spoilers=${readBoolean(formData, "spoilers") ? "1" : "0"}`, {
      method: "POST"
    });
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}
