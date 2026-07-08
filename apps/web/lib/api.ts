import { getSceneAtlasMovie, sceneAtlasCollections, sceneAtlasMovies, sceneAtlasReviews, searchSceneAtlasMovies } from "@sceneatlas/shared";
import type { AccountSnapshot, CollectionPreview, MovieAnalysis, MovieBrief, MovieDetail, MovieSearchFilters, ReviewPreview, UsageSnapshot } from "@sceneatlas/shared";
import { sceneAtlasStore, type ExportFormat } from "@sceneatlas/db";
import { getCurrentAccount, getSessionToken, getSessionUserId } from "./session";

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

async function getRequestHeaders() {
  const sessionToken = await getSessionToken();
  const userId = await getSessionUserId();

  return {
    "x-sceneatlas-client": "web",
    "x-sceneatlas-session": sessionToken ?? "",
    "x-sceneatlas-user-id": userId
  };
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!apiBase) {
    throw new Error("API base URL is not configured.");
  }

  const response = await fetch(`${apiBase}${path}`, {
    cache: "no-store",
    headers: {
      ...(await getRequestHeaders()),
      ...(init.headers as Record<string, string> | undefined)
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`SceneAtlas API request failed for ${path}`);
  }

  return response.json() as Promise<T>;
}

async function requestJsonOrFallback<T>(path: string, fallback: () => T | Promise<T>, init: RequestInit = {}) {
  if (!apiBase) {
    return fallback();
  }

  try {
    return await requestJson<T>(path, init);
  } catch (error) {
    console.warn(`SceneAtlas API request failed for ${path}; using local fallback.`);
    return fallback();
  }
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

export async function fetchMovies(query: string, filters: MovieSearchFilters = {}): Promise<MovieBrief[]> {
  const normalizedFilters = normalizeFilters(filters);

  if (apiBase) {
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
    return requestJsonOrFallback<MovieBrief[]>(`/movies?${params.toString()}`, async () => {
      const userId = await getSessionUserId();
      sceneAtlasStore.consumeUsage(userId, "SEARCH");
      return searchSceneAtlasMovies(query, normalizedFilters).map(movieToBrief);
    });
  }

  const userId = await getSessionUserId();
  sceneAtlasStore.consumeUsage(userId, "SEARCH");
  return searchSceneAtlasMovies(query, normalizedFilters).map(movieToBrief);
}

export async function fetchMovie(slug: string): Promise<MovieDetail | null> {
  if (apiBase) {
    return requestJsonOrFallback<MovieDetail | null>(`/movies/${encodeURIComponent(slug)}`, async () => getSceneAtlasMovie(slug));
  }

  return getSceneAtlasMovie(slug);
}

export async function fetchAnalysis(movieId: string, spoilers: boolean): Promise<MovieAnalysis> {
  if (apiBase) {
    return requestJsonOrFallback<MovieAnalysis>(
      `/analysis/${encodeURIComponent(movieId)}?spoilers=${spoilers ? "1" : "0"}`,
      async () => {
        const userId = await getSessionUserId();
        const cached = sceneAtlasStore.getCachedAnalysis(movieId, spoilers);
        if (cached) {
          return cached.result;
        }

        sceneAtlasStore.consumeUsage(userId, "ANALYSIS");
        const movie = getSceneAtlasMovie(movieId);
        if (!movie) {
          throw new Error("Movie not found.");
        }

        const analysis = spoilers
          ? movie.analysis
          : {
              ...movie.analysis,
              ending: "Enable spoilers to read the ending explanation."
            };
        sceneAtlasStore.cacheAnalysis(movieId, spoilers, analysis, "web-local");
        return analysis;
      }
    );
  }

  const userId = await getSessionUserId();
  const cached = sceneAtlasStore.getCachedAnalysis(movieId, spoilers);
  if (cached) {
    return cached.result;
  }

  sceneAtlasStore.consumeUsage(userId, "ANALYSIS");
  const movie = getSceneAtlasMovie(movieId);
  if (!movie) {
    throw new Error("Movie not found.");
  }

  const analysis = spoilers
    ? movie.analysis
    : {
        ...movie.analysis,
        ending: "Enable spoilers to read the ending explanation."
      };
  sceneAtlasStore.cacheAnalysis(movieId, spoilers, analysis, "web-local");
  return analysis;
}

export async function fetchUsage(): Promise<UsageSnapshot> {
  if (apiBase) {
    return requestJsonOrFallback<UsageSnapshot>(`/usage/summary`, async () => {
      const account = await getCurrentAccount();
      if (account) {
        return account.usage;
      }

      return sceneAtlasStore.getUsageSnapshot(await getSessionUserId());
    });
  }

  const account = await getCurrentAccount();
  if (account) {
    return account.usage;
  }

  return sceneAtlasStore.getUsageSnapshot(await getSessionUserId());
}

export async function fetchAccount(): Promise<AccountSnapshot | null> {
  if (apiBase) {
    return requestJsonOrFallback<AccountSnapshot | null>(`/auth/me`, async () => getCurrentAccount());
  }

  return getCurrentAccount();
}

export async function fetchCollections(): Promise<CollectionPreview[]> {
  if (apiBase) {
    return requestJsonOrFallback<CollectionPreview[]>(`/collections`, async () => {
      const account = await getCurrentAccount();
      return account ? sceneAtlasStore.listCollections(account.id) : sceneAtlasCollections;
    });
  }

  const account = await getCurrentAccount();
  return account ? sceneAtlasStore.listCollections(account.id) : sceneAtlasCollections;
}

export async function fetchWatchlist(): Promise<MovieBrief[]> {
  const fallback = async () => {
    const account = await getCurrentAccount();
    return account ? sceneAtlasStore.listWatchlist(account.id) : sceneAtlasMovies.slice(0, 3).map(movieToBrief);
  };

  if (apiBase) {
    return requestJsonOrFallback<MovieBrief[]>(`/watchlist`, fallback);
  }

  return fallback();
}

export async function fetchReviews(movieId?: string): Promise<ReviewPreview[]> {
  if (apiBase) {
    const params = movieId ? `?movieId=${encodeURIComponent(movieId)}` : "";
    return requestJsonOrFallback<ReviewPreview[]>(`/reviews${params}`, async () => {
      const account = await getCurrentAccount();
      if (!account) {
        return sceneAtlasReviews;
      }

      return sceneAtlasStore.listReviews(movieId);
    });
  }

  const account = await getCurrentAccount();
  if (!account) {
    return sceneAtlasReviews;
  }

  return sceneAtlasStore.listReviews(movieId);
}

export async function fetchRatingSummary(movieId: string): Promise<{ movieId: string; averageRating: number | null; ratingCount: number; userRating: number | null }> {
  const account = await getCurrentAccount();
  if (apiBase) {
    return requestJsonOrFallback<{ movieId: string; averageRating: number | null; ratingCount: number; userRating: number | null }>(
      `/ratings/${encodeURIComponent(movieId)}`,
      async () => {
        const state = sceneAtlasStore.readState();
        const ratings = state.ratings.filter((item) => item.movieId === movieId);
        const averageRating = sceneAtlasStore.getAverageRating(movieId);
        const userRating = account ? sceneAtlasStore.getUserRating(account.id, movieId)?.value ?? null : null;
        return {
          movieId,
          averageRating,
          ratingCount: ratings.length,
          userRating
        };
      }
    );
  }

  const state = sceneAtlasStore.readState();
  const ratings = state.ratings.filter((item) => item.movieId === movieId);
  const averageRating = sceneAtlasStore.getAverageRating(movieId);
  const userRating = account ? sceneAtlasStore.getUserRating(account.id, movieId)?.value ?? null : null;
  return {
    movieId,
    averageRating,
    ratingCount: ratings.length,
    userRating
  };
}

export async function fetchLatestExport(movieId?: string): Promise<ExportJobSnapshot | null> {
  if (apiBase) {
    const params = movieId ? `?movieId=${encodeURIComponent(movieId)}` : "";
    return requestJsonOrFallback<ExportJobSnapshot | null>(`/exports/latest${params}`, async () => {
      const account = await getCurrentAccount();
      return account ? sceneAtlasStore.getLatestExport(account.id, movieId) : null;
    });
  }

  const account = await getCurrentAccount();
  return account ? sceneAtlasStore.getLatestExport(account.id, movieId) : null;
}

export function getFeaturedMovies() {
  return sceneAtlasMovies.slice(0, 4);
}
