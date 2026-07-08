import {
  getSceneAtlasMovie,
  sceneAtlasCollections,
  sceneAtlasMovies,
  sceneAtlasReviews,
  sceneAtlasUsage,
  searchSceneAtlasMovies
} from "@sceneatlas/shared";
import type {
  AccountSnapshot,
  CollectionPreview,
  MovieAnalysis,
  MovieBrief,
  MovieDetail,
  MovieSearchFilters,
  ReviewPreview,
  UsageSnapshot
} from "@sceneatlas/shared";
import { auth, currentUser } from "@clerk/nextjs/server";

type ExportFormat = "json" | "markdown";

interface ApiError extends Error {
  status?: number;
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export interface ExportJobSnapshot {
  id: string;
  userId: string;
  movieId?: string;
  format: ExportFormat;
  payload: Record<string, unknown>;
  status: "queued" | "ready" | "failed";
  createdAt: string;
  updatedAt: string;
}

function movieToBrief(movie: MovieDetail): MovieBrief {
  return {
    slug: movie.slug,
    title: movie.title,
    year: movie.year,
    releaseDate: movie.releaseDate,
    runtimeMinutes: movie.runtimeMinutes,
    rating: movie.rating,
    genres: movie.genres,
    tagline: movie.tagline,
    overview: movie.overview,
    posterPalette: movie.posterPalette,
    backdropUrl: movie.backdropUrl,
    language: movie.language,
    wikidataId: movie.wikidataId,
    commonsCategory: movie.commonsCategory
  };
}

function normalizeFilters(filters: MovieSearchFilters = {}) {
  return {
    genre: filters.genre?.trim() || undefined,
    year: typeof filters.year === "number" && Number.isFinite(filters.year) ? filters.year : undefined,
    language: filters.language?.trim() || undefined
  };
}

function redactAnalysis(movie: MovieAnalysis, spoilers: boolean): MovieAnalysis {
  if (spoilers) {
    return movie;
  }

  return {
    ...movie,
    ending: "Enable spoilers to read the ending explanation."
  };
}

function fallbackAnalysis(movieId: string, spoilers: boolean): MovieAnalysis {
  const movie = getSceneAtlasMovie(movieId);
  if (!movie) {
    throw new Error("Movie not found.");
  }

  return redactAnalysis(movie.analysis, spoilers);
}

function createApiError(message: string, status?: number) {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
}

function hasStatus(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "status" in error;
}

function buildApiUrl(path: string) {
  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return `${apiBase}${path}`;
}

async function getRequestHeaders() {
  const { userId, sessionId } = await auth();
  const user = userId ? await currentUser() : null;
  const primaryEmail = user?.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? "";
  const displayName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username?.trim() ||
    primaryEmail ||
    "";

  return {
    "x-sceneatlas-client": "web",
    "x-sceneatlas-session": sessionId ?? "",
    "x-sceneatlas-user-id": userId ?? "anonymous",
    "x-sceneatlas-user-name": displayName,
    "x-sceneatlas-user-email": primaryEmail,
    "x-sceneatlas-user-avatar": user?.imageUrl ?? "",
    "x-sceneatlas-auth-provider": userId ? "clerk" : "anonymous"
  };
}

function mergeHeaders(initHeaders: HeadersInit | undefined, requestHeaders: Record<string, string>) {
  const headers = new Headers(initHeaders);
  for (const [key, value] of Object.entries(requestHeaders)) {
    headers.set(key, value);
  }

  return headers;
}

async function readErrorMessage(response: Response, path: string) {
  const text = await response.text();
  if (!text) {
    return `SceneAtlas API request failed for ${path}.`;
  }

  try {
    const parsed = JSON.parse(text) as { message?: unknown };
    if (typeof parsed.message === "string") {
      return parsed.message;
    }

    if (Array.isArray(parsed.message)) {
      return parsed.message.map(String).join(", ");
    }
  } catch {
    return text;
  }

  return text;
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = mergeHeaders(init.headers, await getRequestHeaders());
  const response = await fetch(buildApiUrl(path), {
    ...init,
    cache: "no-store",
    headers
  });

  if (!response.ok) {
    throw createApiError(await readErrorMessage(response, path), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export async function sceneAtlasApiRequest<T>(path: string, init: RequestInit = {}) {
  return requestJson<T>(path, init);
}

async function requestJsonOrFallback<T>(path: string, fallback: () => T | Promise<T>, init: RequestInit = {}) {
  if (!apiBase) {
    return fallback();
  }

  try {
    return await requestJson<T>(path, init);
  } catch (error) {
    if (error instanceof SyntaxError || hasStatus(error)) {
      throw error;
    }

    console.warn(`SceneAtlas API request failed for ${path}; using shared fallback data.`);
    return fallback();
  }
}

export async function fetchMovies(query: string, filters: MovieSearchFilters = {}): Promise<MovieBrief[]> {
  const normalizedFilters = normalizeFilters(filters);
  const params = new URLSearchParams();
  params.set("query", query);

  if (normalizedFilters.year) {
    params.set("year", String(normalizedFilters.year));
  }

  if (normalizedFilters.genre) {
    params.set("genre", normalizedFilters.genre);
  }

  if (normalizedFilters.language) {
    params.set("language", normalizedFilters.language);
  }

  return requestJsonOrFallback<MovieBrief[]>(`/movies?${params.toString()}`, async () =>
    searchSceneAtlasMovies(query, normalizedFilters).map(movieToBrief)
  );
}

export async function fetchMovie(slug: string): Promise<MovieDetail | null> {
  return requestJsonOrFallback<MovieDetail | null>(`/movies/${encodeURIComponent(slug)}`, async () => getSceneAtlasMovie(slug));
}

export async function fetchAnalysis(movieId: string, spoilers: boolean): Promise<MovieAnalysis> {
  return requestJsonOrFallback<MovieAnalysis>(
    `/analysis/${encodeURIComponent(movieId)}?spoilers=${spoilers ? "1" : "0"}`,
    async () => fallbackAnalysis(movieId, spoilers)
  );
}

export async function fetchUsage(): Promise<UsageSnapshot> {
  return requestJsonOrFallback<UsageSnapshot>(`/usage/summary`, async () => sceneAtlasUsage);
}

export async function fetchAccount(): Promise<AccountSnapshot | null> {
  return requestJsonOrFallback<AccountSnapshot | null>(`/auth/me`, async () => null);
}

export async function fetchCollections(): Promise<CollectionPreview[]> {
  return requestJsonOrFallback<CollectionPreview[]>(`/collections`, async () => sceneAtlasCollections);
}

export async function fetchWatchlist(): Promise<MovieBrief[]> {
  return requestJsonOrFallback<MovieBrief[]>(`/watchlist`, async () => sceneAtlasMovies.slice(0, 3).map(movieToBrief));
}

export async function fetchReviews(movieId?: string): Promise<ReviewPreview[]> {
  const params = movieId ? `?movieId=${encodeURIComponent(movieId)}` : "";
  return requestJsonOrFallback<ReviewPreview[]>(`/reviews${params}`, async () => sceneAtlasReviews);
}

export async function fetchRatingSummary(movieId: string): Promise<{
  movieId: string;
  averageRating: number | null;
  ratingCount: number;
  userRating: number | null;
}> {
  return requestJsonOrFallback(
    `/ratings/${encodeURIComponent(movieId)}`,
    async () => {
      const movie = getSceneAtlasMovie(movieId);
      return {
        movieId,
        averageRating: movie?.rating ?? null,
        ratingCount: 0,
        userRating: null
      };
    }
  );
}

export async function fetchLatestExport(movieId?: string): Promise<ExportJobSnapshot | null> {
  const params = movieId ? `?movieId=${encodeURIComponent(movieId)}` : "";
  return requestJsonOrFallback<ExportJobSnapshot | null>(`/exports/latest${params}`, async () => null);
}

export function getFeaturedMovies() {
  return sceneAtlasMovies.slice(0, 4);
}
