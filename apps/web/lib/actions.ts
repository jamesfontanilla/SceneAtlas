"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sceneAtlasStore, SceneAtlasError } from "@sceneatlas/db";
import { SESSION_COOKIE, getSessionToken, getSessionUserId } from "./session";

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

function redirectWithError(path: string, error: unknown) {
  if (error instanceof SceneAtlasError) {
    const separator = path.includes("?") ? "&" : "?";
    redirect(`${path}${separator}error=${encodeURIComponent(error.message)}`);
  }

  throw error;
}

export async function signUpAction(formData: FormData) {
  try {
    const result = sceneAtlasStore.signUp({
      name: readString(formData, "name"),
      email: readString(formData, "email"),
      avatar: readString(formData, "avatar") || undefined,
      provider: readString(formData, "provider") || "authjs"
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, result.session.token, {
      path: "/",
      sameSite: "lax",
      httpOnly: true
    });

    redirect(redirectTo(formData, "/search"));
  } catch (error) {
    redirectWithError("/sign-up", error);
  }
}

export async function signInAction(formData: FormData) {
  try {
    const result = sceneAtlasStore.signIn({
      email: readString(formData, "email"),
      avatar: readString(formData, "avatar") || undefined,
      provider: readString(formData, "provider") || "authjs"
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, result.session.token, {
      path: "/",
      sameSite: "lax",
      httpOnly: true
    });

    redirect(redirectTo(formData, "/search"));
  } catch (error) {
    redirectWithError("/sign-in", error);
  }
}

export async function signOutAction(formData: FormData) {
  const sessionToken = await getSessionToken();
  if (sessionToken) {
    sceneAtlasStore.signOut(sessionToken);
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    expires: new Date(0)
  });
  redirect(redirectTo(formData, "/"));
}

export async function toggleWatchlistAction(formData: FormData) {
  const userId = await getSessionUserId();
  if (userId === "anonymous") {
    redirect(`/sign-in?returnTo=${encodeURIComponent(redirectTo(formData, "/watchlist"))}`);
  }

  const movieId = readString(formData, "movieId");
  const returnTo = redirectTo(formData, `/movies/${movieId}`);

  try {
    if (sceneAtlasStore.isOnWatchlist(userId, movieId)) {
      sceneAtlasStore.removeFromWatchlist(userId, movieId);
    } else {
      sceneAtlasStore.addToWatchlist(userId, movieId);
    }
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function upsertRatingAction(formData: FormData) {
  const userId = await getSessionUserId();
  if (userId === "anonymous") {
    redirect(`/sign-in?returnTo=${encodeURIComponent(redirectTo(formData, "/search"))}`);
  }

  const movieId = readString(formData, "movieId");
  const value = Number(readString(formData, "value"));
  const returnTo = redirectTo(formData, `/movies/${movieId}`);

  try {
    sceneAtlasStore.upsertRating(userId, movieId, value);
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function upsertReviewAction(formData: FormData) {
  const userId = await getSessionUserId();
  if (userId === "anonymous") {
    redirect(`/sign-in?returnTo=${encodeURIComponent(redirectTo(formData, "/search"))}`);
  }

  const movieId = readString(formData, "movieId");
  const returnTo = redirectTo(formData, `/movies/${movieId}`);

  try {
    sceneAtlasStore.upsertReview(userId, movieId, {
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
  const userId = await getSessionUserId();
  if (userId === "anonymous") {
    redirect(`/sign-in?returnTo=${encodeURIComponent(redirectTo(formData, "/collections"))}`);
  }

  try {
    sceneAtlasStore.createCollection(userId, {
      name: readString(formData, "name"),
      description: readString(formData, "description") || undefined,
      visibility: readString(formData, "visibility") === "shared" ? "shared" : "private"
    });
  } catch (error) {
    redirectWithError(redirectTo(formData, "/collections"), error);
  }

  redirect(redirectTo(formData, "/collections"));
}

export async function addMovieToCollectionAction(formData: FormData) {
  const userId = await getSessionUserId();
  if (userId === "anonymous") {
    redirect(`/sign-in?returnTo=${encodeURIComponent(redirectTo(formData, "/collections"))}`);
  }

  const collectionId = readString(formData, "collectionId");
  const movieId = readString(formData, "movieId");
  const returnTo = redirectTo(formData, "/collections");

  try {
    sceneAtlasStore.addMovieToCollection(userId, collectionId, movieId);
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function removeMovieFromCollectionAction(formData: FormData) {
  const userId = await getSessionUserId();
  if (userId === "anonymous") {
    redirect(`/sign-in?returnTo=${encodeURIComponent(redirectTo(formData, "/collections"))}`);
  }

  const collectionId = readString(formData, "collectionId");
  const movieId = readString(formData, "movieId");
  const returnTo = redirectTo(formData, "/collections");

  try {
    sceneAtlasStore.removeMovieFromCollection(userId, collectionId, movieId);
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}

export async function upgradeAction(formData: FormData) {
  const userId = await getSessionUserId();
  if (userId === "anonymous") {
    redirect(`/sign-in?returnTo=${encodeURIComponent(redirectTo(formData, "/billing"))}`);
  }

  try {
    sceneAtlasStore.promoteToPremium(userId, "web");
  } catch (error) {
    redirectWithError(redirectTo(formData, "/billing"), error);
  }

  redirect(redirectTo(formData, "/billing"));
}

export async function downgradeAction(formData: FormData) {
  const userId = await getSessionUserId();
  if (userId === "anonymous") {
    redirect(`/sign-in?returnTo=${encodeURIComponent(redirectTo(formData, "/billing"))}`);
  }

  try {
    sceneAtlasStore.demoteToFree(userId, "web");
  } catch (error) {
    redirectWithError(redirectTo(formData, "/billing"), error);
  }

  redirect(redirectTo(formData, "/billing"));
}

export async function exportNotesAction(formData: FormData) {
  const userId = await getSessionUserId();
  if (userId === "anonymous") {
    redirect(`/sign-in?returnTo=${encodeURIComponent(redirectTo(formData, "/billing"))}`);
  }

  const movieId = readString(formData, "movieId") || undefined;
  const format = readString(formData, "format") === "markdown" ? "markdown" : "json";
  const returnTo = redirectTo(formData, movieId ? `/movies/${movieId}` : "/billing");

  try {
    sceneAtlasStore.createExportJob(userId, movieId, format);
  } catch (error) {
    redirectWithError(returnTo, error);
  }

  redirect(returnTo);
}
