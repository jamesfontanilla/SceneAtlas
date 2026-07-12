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
import { getSceneAtlasSessionToken } from "./session";

type ExportFormat = "json" | "markdown";

interface ApiError extends Error {
  status?: number;
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const allowLocalFallbacks = process.env.VERCEL !== "1";

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

export interface AdminUsageBucketSnapshot {
  userId: string;
  displayName: string;
  email: string;
  dayKey: string;
  searchesUsed: number;
  analysesUsed: number;
  exportUses: number;
  reviewsUsed: number;
  collectionCreates: number;
  searchesLimit: number;
  analysesLimit: number;
  isPremium: boolean;
  adsEnabled: boolean;
}

export interface AdminMetricsSnapshot {
  users: number;
  premiumUsers: number;
  searchCacheEntries: number;
  analysisCacheEntries: number;
  failedRequests: number;
  quotaDenials: number;
  subscriptions: Array<{
    id: string;
    displayName: string;
    tier: string;
    status: string;
  }>;
  latestEvents: Array<{
    id: string;
    kind: string;
    message: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
  }>;
}

export interface AdminAnalysisQueueItem {
  id: string;
  movieId: string;
  movieTitle: string;
  spoilerEnabled: boolean;
  status: string;
  hasResult: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFailureSnapshot {
  id: string;
  kind: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AdminExportJobSnapshot {
  id: string;
  userId: string;
  movieId?: string;
  format: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  payloadSize: number;
}

export interface AdminSubscriptionSnapshot {
  id: string;
  displayName: string;
  email: string;
  tier: string;
  status: string;
  authProvider: string;
  updatedAt: string;
}

export interface FeaturedQuerySnapshot {
  query: string;
  count: number;
  lastSeenAt: string;
}

export interface SearchSuggestionSnapshot {
  suggestions: string[];
}

export interface SearchEventSnapshot {
  id: string;
  userId: string;
  query: string;
  filters: MovieSearchFilters;
  resultCount: number;
  provider: string;
  createdAt: string;
}

export interface MovieViewEventSnapshot {
  id: string;
  userId: string;
  movieId: string;
  spoilerEnabled: boolean;
  referrer?: string;
  createdAt: string;
}

export interface AnalyticsSummarySnapshot {
  total: number;
  byEventName: Record<string, number>;
  recentEvents: Array<{
    id: string;
    eventName: string;
    userId?: string;
    sessionId?: string;
    payload?: Record<string, unknown>;
    createdAt: string;
  }>;
}

export interface ChatMessageSnapshot {
  id: string;
  sessionId: string;
  role: "system" | "user" | "assistant";
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  createdAt: string;
}

export interface ChatSessionSnapshot {
  id: string;
  userId: string;
  movieId: string;
  summary?: string;
  provider: string;
  model: string;
  promptVersion: string;
  spoilerEnabled: boolean;
  archived: boolean;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessage?: ChatMessageSnapshot | null;
}

export interface ProfileSnapshot {
  account: AccountSnapshot;
  joinDate: string | null;
  lastLoginAt: string | null;
  chatSessionCount: number;
  searchCount: number;
  viewCount: number;
  analysisCount: number;
  recentActivity: Array<{
    kind: "search" | "view" | "analytics";
    title: string;
    detail: string;
    createdAt: string;
  }>;
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
  const sessionToken = await getSceneAtlasSessionToken();

  return {
    "x-sceneatlas-client": "web",
    "x-sceneatlas-session": sessionToken,
    "x-sceneatlas-user-id": "anonymous",
    "x-sceneatlas-user-name": "",
    "x-sceneatlas-user-email": "",
    "x-sceneatlas-user-avatar": "",
    "x-sceneatlas-auth-provider": sessionToken ? "session" : "anonymous"
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
    if (allowLocalFallbacks) {
      return fallback();
    }

    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  if (!allowLocalFallbacks) {
    return requestJson<T>(path, init);
  }

  try {
    return await requestJson<T>(path, init);
  } catch (error) {
    const status = hasStatus(error) ? error.status : undefined;
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(
      `SceneAtlas API request failed for ${path}${status ? ` (${status})` : ""}; using shared fallback data. ${reason}`
    );
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

export async function fetchAdminMetrics(): Promise<{
  metrics: AdminMetricsSnapshot;
  usageBuckets: AdminUsageBucketSnapshot[];
}> {
  return sceneAtlasApiRequest<{
    metrics: AdminMetricsSnapshot;
    usageBuckets: AdminUsageBucketSnapshot[];
  }>("/admin/metrics");
}

export async function fetchAdminQueue(): Promise<{
  analysisRequests: AdminAnalysisQueueItem[];
}> {
  return sceneAtlasApiRequest<{ analysisRequests: AdminAnalysisQueueItem[] }>("/admin/queue");
}

export async function fetchAdminFailures(): Promise<{
  failedRequests: AdminFailureSnapshot[];
}> {
  return sceneAtlasApiRequest<{ failedRequests: AdminFailureSnapshot[] }>("/admin/failures");
}

export async function fetchAdminExportJobs(): Promise<{
  exportJobs: AdminExportJobSnapshot[];
}> {
  return sceneAtlasApiRequest<{ exportJobs: AdminExportJobSnapshot[] }>("/admin/export-jobs");
}

export async function fetchAdminSubscriptions(): Promise<{
  subscriptions: AdminSubscriptionSnapshot[];
}> {
  return sceneAtlasApiRequest<{ subscriptions: AdminSubscriptionSnapshot[] }>("/admin/subscriptions");
}

export async function fetchFeaturedMovies(): Promise<MovieBrief[]> {
  return requestJsonOrFallback<{ featuredMovies: MovieBrief[] }>("/discover/featured", async () => ({
    featuredMovies: sceneAtlasMovies.slice(0, 4).map(movieToBrief)
  })).then((response) => response.featuredMovies);
}

export async function fetchTrendingQueries(): Promise<FeaturedQuerySnapshot[]> {
  return requestJsonOrFallback<{ queries: FeaturedQuerySnapshot[] }>("/search/trending", async () => ({
    queries: sceneAtlasMovies.slice(0, 4).map((movie) => ({
      query: movie.title,
      count: 1,
      lastSeenAt: movie.releaseDate ?? new Date().toISOString()
    }))
  })).then((response) => response.queries);
}

export async function fetchSearchSuggestions(query: string): Promise<string[]> {
  const params = new URLSearchParams();
  params.set("q", query);
  return requestJsonOrFallback<SearchSuggestionSnapshot>(`/search/suggestions?${params.toString()}`, async () => ({
    suggestions: sceneAtlasMovies
      .filter((movie) => movie.title.toLowerCase().includes(query.trim().toLowerCase()))
      .map((movie) => movie.title)
  })).then((response) => response.suggestions);
}

export async function fetchProfile(): Promise<ProfileSnapshot | null> {
  return requestJsonOrFallback<ProfileSnapshot | null>(`/profile/me`, async () => null);
}

export async function fetchProfileHistory(): Promise<{
  views: MovieViewEventSnapshot[];
  analyses: Array<{
    movieId: string;
    spoilers: boolean;
    eventName: string;
    createdAt: string;
  }>;
  recentActivity: ProfileSnapshot["recentActivity"];
}> {
  return requestJsonOrFallback<{
    views: MovieViewEventSnapshot[];
    analyses: Array<{
      movieId: string;
      spoilers: boolean;
      eventName: string;
      createdAt: string;
    }>;
    recentActivity: ProfileSnapshot["recentActivity"];
  }>("/profile/me/history", async () => ({
    views: [],
    analyses: [],
    recentActivity: []
  }));
}

export async function fetchProfileChatSessions(): Promise<{
  sessions: ChatSessionSnapshot[];
}> {
  return requestJsonOrFallback<{ sessions: ChatSessionSnapshot[] }>("/profile/me/chat-sessions", async () => ({
    sessions: []
  }));
}

export async function fetchProfileSearchHistory(): Promise<{
  searches: SearchEventSnapshot[];
}> {
  return requestJsonOrFallback<{ searches: SearchEventSnapshot[] }>("/profile/me/search-history", async () => ({
    searches: []
  }));
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummarySnapshot> {
  return requestJsonOrFallback<AnalyticsSummarySnapshot>("/analytics/summary", async () => ({
    total: 0,
    byEventName: {},
    recentEvents: []
  }));
}

export async function fetchChatSessions(movieId?: string): Promise<{
  sessions: ChatSessionSnapshot[];
}> {
  const params = movieId ? `?movieId=${encodeURIComponent(movieId)}` : "";
  return requestJsonOrFallback<{ sessions: ChatSessionSnapshot[] }>(`/chat/sessions${params}`, async () => ({
    sessions: []
  }));
}

export async function fetchChatSession(sessionId: string): Promise<{
  session: ChatSessionSnapshot;
  messages: ChatMessageSnapshot[];
} | null> {
  return requestJsonOrFallback<{ session: ChatSessionSnapshot; messages: ChatMessageSnapshot[] } | null>(
    `/chat/sessions/${encodeURIComponent(sessionId)}`,
    async () => null
  );
}

export async function createChatSession(movieId: string, spoilers = false): Promise<{
  session: ChatSessionSnapshot;
  messages: ChatMessageSnapshot[];
}> {
  return sceneAtlasApiRequest("/chat/sessions", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      movieId,
      spoilers
    })
  });
}

export async function sendChatMessage(sessionId: string, content: string): Promise<{
  session: ChatSessionSnapshot | null;
  messages: ChatMessageSnapshot[];
  reply: ChatMessageSnapshot;
  userMessage: ChatMessageSnapshot;
}> {
  return sceneAtlasApiRequest(`/chat/sessions/${encodeURIComponent(sessionId)}/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      content
    })
  });
}

export async function summarizeChatSession(sessionId: string): Promise<{
  session: ChatSessionSnapshot;
  messages: ChatMessageSnapshot[];
}> {
  return sceneAtlasApiRequest(`/chat/sessions/${encodeURIComponent(sessionId)}/summary`, {
    method: "POST"
  });
}

export async function archiveChatSession(sessionId: string): Promise<ChatSessionSnapshot> {
  return sceneAtlasApiRequest(`/chat/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE"
  });
}

export function getFeaturedMovies() {
  return sceneAtlasMovies.slice(0, 4);
}
