"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sceneAtlasApiRequest } from "./api";

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
  const { userId } = await auth();
  if (!userId) {
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
