import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import {
  getSceneAtlasMovie,
  sceneAtlasMovies,
  searchSceneAtlasMovies,
  sceneAtlasUsage,
  type AccountSnapshot,
  type CollectionPreview,
  type MovieAnalysis,
  type MovieBrief,
  type MovieDetail,
  type MovieSearchFilters,
  type ReviewPreview,
  type UsageSnapshot
} from "@sceneatlas/shared";

export const FREE_SEARCH_LIMIT = sceneAtlasUsage.searchesRemaining;
export const FREE_ANALYSIS_LIMIT = sceneAtlasUsage.analysesRemaining;
export const FREE_CHAT_LIMIT = sceneAtlasUsage.chatMessagesLimit ?? 10;
export const FREE_COLLECTION_LIMIT = 2;

export type SubscriptionTier = "FREE" | "PREMIUM";
export type SubscriptionStatus = "NONE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";
export type CollectionVisibility = "private" | "shared";
export type ExportFormat = "json" | "markdown";
export type UsageKind = "SEARCH" | "ANALYSIS" | "CHAT" | "EXPORT" | "REVIEW" | "COLLECTION_CREATE";

export interface SceneAtlasUserRecord {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  authProvider: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface SceneAtlasSessionRecord {
  token: string;
  userId: string;
  createdAt: string;
  lastSeenAt: string;
}

export interface UsageBucketRecord {
  userId: string;
  dayKey: string;
  searchesUsed: number;
  analysesUsed: number;
  chatMessagesUsed: number;
  exportUses: number;
  reviewsUsed: number;
  collectionCreates: number;
  searchesLimit: number;
  analysesLimit: number;
  chatMessagesLimit: number;
  isPremium: boolean;
  adsEnabled: boolean;
}

export interface SearchCacheRecord {
  key: string;
  query: string;
  filters: MovieSearchFilters;
  results: MovieBrief[];
  cachedAt: string;
}

export interface MovieCacheRecord {
  movieId: string;
  movie: MovieDetail;
  source: string;
  cachedAt: string;
}

export interface AnalysisCacheRecord {
  key: string;
  movieId: string;
  spoilerEnabled: boolean;
  result: MovieAnalysis;
  source: string;
  cachedAt: string;
}

export interface WatchlistItemRecord {
  userId: string;
  movieId: string;
  createdAt: string;
}

export interface CollectionRecord {
  id: string;
  userId: string;
  name: string;
  description?: string;
  visibility: CollectionVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItemRecord {
  id: string;
  collectionId: string;
  movieId: string;
  createdAt: string;
}

export interface RatingRecord {
  id: string;
  userId: string;
  movieId: string;
  value: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRecord {
  id: string;
  userId: string;
  movieId: string;
  title: string;
  body: string;
  spoilerTag: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExportJobRecord {
  id: string;
  userId: string;
  movieId?: string;
  format: ExportFormat;
  payload: Record<string, unknown>;
  status: "queued" | "ready" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface SearchEventRecord {
  id: string;
  userId: string;
  query: string;
  filters: MovieSearchFilters;
  resultCount: number;
  provider: string;
  createdAt: string;
}

export interface MovieViewEventRecord {
  id: string;
  userId: string;
  movieId: string;
  spoilerEnabled: boolean;
  referrer?: string;
  createdAt: string;
}

export interface AnalyticsEventRecord {
  id: string;
  eventName: string;
  userId?: string;
  sessionId?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface AdminAuditLogRecord {
  id: string;
  actor: string;
  action: string;
  target?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ChatSessionRecord {
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
}

export interface ChatMessageRecord {
  id: string;
  sessionId: string;
  role: "system" | "user" | "assistant";
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  createdAt: string;
}

export interface PromptVersionRecord {
  id: string;
  provider: string;
  model: string;
  versionKey: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEventRecord {
  id: string;
  kind:
    | "search_limit"
    | "analysis_limit"
    | "chat_limit"
    | "movie_provider_failure"
    | "analysis_provider_failure"
    | "chat_provider_failure"
    | "subscription_change"
    | "auth"
    | "export"
    | "collection"
    | "review"
    | "rating";
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface SceneAtlasState {
  version: 1;
  users: SceneAtlasUserRecord[];
  sessions: SceneAtlasSessionRecord[];
  usageBuckets: UsageBucketRecord[];
  searchCache: SearchCacheRecord[];
  movieCache: MovieCacheRecord[];
  analysisCache: AnalysisCacheRecord[];
  searchEvents: SearchEventRecord[];
  movieViewEvents: MovieViewEventRecord[];
  analyticsEvents: AnalyticsEventRecord[];
  adminAuditLogs: AdminAuditLogRecord[];
  chatSessions: ChatSessionRecord[];
  chatMessages: ChatMessageRecord[];
  promptVersions: PromptVersionRecord[];
  featuredMovieIds: string[];
  watchlistItems: WatchlistItemRecord[];
  collections: CollectionRecord[];
  collectionItems: CollectionItemRecord[];
  ratings: RatingRecord[];
  reviews: ReviewRecord[];
  exportJobs: ExportJobRecord[];
  auditEvents: AuditEventRecord[];
}

export interface SignUpInput {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: string;
}

export interface SignInInput {
  email: string;
  avatar?: string;
  provider?: string;
}

export interface AccountSummary extends AccountSnapshot {
  sessionToken: string;
  collections: CollectionPreview[];
  reviews: ReviewPreview[];
}

export class SceneAtlasError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NOT_FOUND"
      | "QUOTA_EXCEEDED"
      | "FORBIDDEN"
      | "CONFLICT"
      | "VALIDATION"
      | "STATE_ERROR"
  ) {
    super(message);
    this.name = "SceneAtlasError";
  }
}

const stateFilePath = process.env.SCENEATLAS_STATE_PATH ?? join(tmpdir(), "sceneatlas-state.json");

function nowIso() {
  return new Date().toISOString();
}

function currentDayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createInitialState(): SceneAtlasState {
  return {
    version: 1,
    users: [],
    sessions: [],
    usageBuckets: [],
    searchCache: [],
    movieCache: [],
    analysisCache: [],
    searchEvents: [],
    movieViewEvents: [],
    analyticsEvents: [],
    adminAuditLogs: [],
    chatSessions: [],
    chatMessages: [],
    promptVersions: [],
    featuredMovieIds: [],
    watchlistItems: [],
    collections: [],
    collectionItems: [],
    ratings: [],
    reviews: [],
    exportJobs: [],
    auditEvents: []
  };
}

function coerceState(raw: Partial<SceneAtlasState> | null | undefined): SceneAtlasState {
  const base = createInitialState();
  if (!raw || raw.version !== 1) {
    return base;
  }

  return {
    ...base,
    ...raw,
    users: raw.users ?? base.users,
    sessions: raw.sessions ?? base.sessions,
    usageBuckets: raw.usageBuckets ?? base.usageBuckets,
    searchCache: raw.searchCache ?? base.searchCache,
    movieCache: raw.movieCache ?? base.movieCache,
    analysisCache: raw.analysisCache ?? base.analysisCache,
    searchEvents: raw.searchEvents ?? base.searchEvents,
    movieViewEvents: raw.movieViewEvents ?? base.movieViewEvents,
    analyticsEvents: raw.analyticsEvents ?? base.analyticsEvents,
    adminAuditLogs: raw.adminAuditLogs ?? base.adminAuditLogs,
    chatSessions: raw.chatSessions ?? base.chatSessions,
    chatMessages: raw.chatMessages ?? base.chatMessages,
    promptVersions: raw.promptVersions ?? base.promptVersions,
    featuredMovieIds: raw.featuredMovieIds ?? base.featuredMovieIds,
    watchlistItems: raw.watchlistItems ?? base.watchlistItems,
    collections: raw.collections ?? base.collections,
    collectionItems: raw.collectionItems ?? base.collectionItems,
    ratings: raw.ratings ?? base.ratings,
    reviews: raw.reviews ?? base.reviews,
    exportJobs: raw.exportJobs ?? base.exportJobs,
    auditEvents: raw.auditEvents ?? base.auditEvents
  };
}

function ensureStateDirectory() {
  mkdirSync(dirname(stateFilePath), { recursive: true });
}

function readState() {
  try {
    if (!existsSync(stateFilePath)) {
      return createInitialState();
    }

    const parsed = JSON.parse(readFileSync(stateFilePath, "utf8")) as Partial<SceneAtlasState>;
    return coerceState(parsed);
  } catch {
    return createInitialState();
  }
}

function writeState(state: SceneAtlasState) {
  ensureStateDirectory();
  const tempPath = `${stateFilePath}.${randomUUID()}.tmp`;
  writeFileSync(tempPath, JSON.stringify(state, null, 2), "utf8");
  renameSync(tempPath, stateFilePath);
}

function mutateState<T>(mutator: (state: SceneAtlasState) => T) {
  const state = readState();
  const value = mutator(state);
  writeState(state);
  return value;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function defaultDisplayName(email: string) {
  const localPart = normalizeEmail(email).split("@")[0] || "Movie Fan";
  return localPart
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function userToSnapshot(user: SceneAtlasUserRecord, usage: UsageBucketRecord, state: SceneAtlasState): AccountSnapshot {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionTier: user.subscriptionTier,
    authProvider: user.authProvider,
    watchlistCount: state.watchlistItems.filter((item) => item.userId === user.id).length,
    collectionCount: state.collections.filter((collection) => collection.userId === user.id).length,
    ratingCount: state.ratings.filter((rating) => rating.userId === user.id).length,
    reviewCount: state.reviews.filter((review) => review.userId === user.id).length,
    usage: usageToSnapshot(usage)
  };
}

function usageToSnapshot(bucket: UsageBucketRecord): UsageSnapshot {
  return {
    searchesRemaining: bucket.isPremium ? Number.MAX_SAFE_INTEGER : Math.max(bucket.searchesLimit - bucket.searchesUsed, 0),
    analysesRemaining: bucket.isPremium ? Number.MAX_SAFE_INTEGER : Math.max(bucket.analysesLimit - bucket.analysesUsed, 0),
    chatMessagesRemaining: bucket.isPremium ? Number.MAX_SAFE_INTEGER : Math.max(bucket.chatMessagesLimit - bucket.chatMessagesUsed, 0),
    isPremium: bucket.isPremium,
    adsEnabled: bucket.adsEnabled,
    searchesUsed: bucket.searchesUsed,
    analysesUsed: bucket.analysesUsed,
    chatMessagesUsed: bucket.chatMessagesUsed,
    searchesLimit: bucket.searchesLimit,
    analysesLimit: bucket.analysesLimit,
    chatMessagesLimit: bucket.chatMessagesLimit,
    dayKey: bucket.dayKey
  };
}

function currentBucket(state: SceneAtlasState, userId: string) {
  const today = currentDayKey();
  let bucket = state.usageBuckets.find((item) => item.userId === userId);
  let changed = false;
  const user = state.users.find((item) => item.id === userId);
  const isPremium = user?.subscriptionTier === "PREMIUM";

  if (!bucket) {
    bucket = {
      userId,
      dayKey: today,
      searchesUsed: 0,
      analysesUsed: 0,
      chatMessagesUsed: 0,
      exportUses: 0,
      reviewsUsed: 0,
      collectionCreates: 0,
      searchesLimit: FREE_SEARCH_LIMIT,
      analysesLimit: FREE_ANALYSIS_LIMIT,
      chatMessagesLimit: FREE_CHAT_LIMIT,
      isPremium,
      adsEnabled: !isPremium
    };
    state.usageBuckets.push(bucket);
    changed = true;
  } else {
    if (typeof bucket.chatMessagesUsed !== "number") {
      bucket.chatMessagesUsed = 0;
      changed = true;
    }

    if (typeof bucket.chatMessagesLimit !== "number") {
      bucket.chatMessagesLimit = FREE_CHAT_LIMIT;
      changed = true;
    }
  }

  if (bucket && bucket.dayKey !== today) {
    bucket.dayKey = today;
    bucket.searchesUsed = 0;
    bucket.analysesUsed = 0;
    bucket.chatMessagesUsed = 0;
    bucket.exportUses = 0;
    bucket.reviewsUsed = 0;
    bucket.collectionCreates = 0;
    bucket.searchesLimit = FREE_SEARCH_LIMIT;
    bucket.analysesLimit = FREE_ANALYSIS_LIMIT;
    bucket.chatMessagesLimit = FREE_CHAT_LIMIT;
    bucket.isPremium = isPremium;
    bucket.adsEnabled = !isPremium;
    changed = true;
  } else if (bucket.isPremium !== isPremium) {
    bucket.isPremium = isPremium;
    bucket.chatMessagesLimit = FREE_CHAT_LIMIT;
    bucket.adsEnabled = !isPremium;
    changed = true;
  }

  return { bucket, changed };
}

function resolveUser(state: SceneAtlasState, userId: string) {
  return state.users.find((item) => item.id === userId) ?? null;
}

function rekeyUser(state: SceneAtlasState, fromUserId: string, toUserId: string) {
  if (fromUserId === toUserId) {
    return resolveUser(state, fromUserId);
  }

  const user = resolveUser(state, fromUserId);
  if (!user) {
    return null;
  }

  const conflictingUser = resolveUser(state, toUserId);
  if (conflictingUser && conflictingUser.id !== fromUserId) {
    return conflictingUser;
  }

  const now = nowIso();
  user.id = toUserId;
  user.updatedAt = now;

  for (const bucket of state.usageBuckets) {
    if (bucket.userId === fromUserId) {
      bucket.userId = toUserId;
    }
  }

  for (const session of state.sessions) {
    if (session.userId === fromUserId) {
      session.userId = toUserId;
    }
  }

  for (const item of state.watchlistItems) {
    if (item.userId === fromUserId) {
      item.userId = toUserId;
    }
  }

  for (const collection of state.collections) {
    if (collection.userId === fromUserId) {
      collection.userId = toUserId;
    }
  }

  for (const rating of state.ratings) {
    if (rating.userId === fromUserId) {
      rating.userId = toUserId;
    }
  }

  for (const review of state.reviews) {
    if (review.userId === fromUserId) {
      review.userId = toUserId;
    }
  }

  for (const event of state.searchEvents) {
    if (event.userId === fromUserId) {
      event.userId = toUserId;
    }
  }

  for (const event of state.movieViewEvents) {
    if (event.userId === fromUserId) {
      event.userId = toUserId;
    }
  }

  for (const event of state.analyticsEvents) {
    if (event.userId === fromUserId) {
      event.userId = toUserId;
    }
  }

  for (const session of state.chatSessions) {
    if (session.userId === fromUserId) {
      session.userId = toUserId;
    }
  }

  for (const exportJob of state.exportJobs) {
    if (exportJob.userId === fromUserId) {
      exportJob.userId = toUserId;
    }
  }

  for (const event of state.auditEvents) {
    if (event.metadata && typeof event.metadata === "object" && !Array.isArray(event.metadata) && event.metadata.userId === fromUserId) {
      event.metadata = { ...event.metadata, userId: toUserId };
    }
  }

  for (const log of state.adminAuditLogs) {
    if (log.actor === fromUserId) {
      log.actor = toUserId;
    }
    if (log.metadata && typeof log.metadata === "object" && !Array.isArray(log.metadata) && log.metadata.userId === fromUserId) {
      log.metadata = { ...log.metadata, userId: toUserId };
    }
  }

  return user;
}

function ensureMovie(movieId: string): MovieDetail | null {
  const cached = sceneAtlasStore.getMovieCache(movieId);
  if (cached) {
    return cached.movie;
  }

  const seed = getSceneAtlasMovie(movieId);
  return seed;
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

function matchesMovieFilters(movie: MovieDetail, filters: MovieSearchFilters = {}) {
  if (filters.genre && !movie.genres.includes(filters.genre)) {
    return false;
  }

  if (typeof filters.year === "number" && movie.year !== filters.year) {
    return false;
  }

  if (filters.language && (movie.language ?? "").toLowerCase() !== filters.language.trim().toLowerCase()) {
    return false;
  }

  return true;
}

function collectionPreviewFromRecord(collection: CollectionRecord, state: SceneAtlasState): CollectionPreview {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description ?? "",
    movieCount: state.collectionItems.filter((item) => item.collectionId === collection.id).length,
    visibility: collection.visibility
  };
}

function reviewPreviewFromRecord(review: ReviewRecord, user: SceneAtlasUserRecord | undefined, rating = 5): ReviewPreview {
  return {
    id: review.id,
    author: user?.displayName ?? "SceneAtlas user",
    rating: Math.max(1, Math.min(5, rating)),
    title: review.title,
    body: review.body,
    createdAt: review.createdAt,
    spoilerTag: review.spoilerTag
  };
}

export const sceneAtlasStore = {
  stateFilePath,

  readState(): SceneAtlasState {
    return readState();
  },

  getDefaultMovieCatalog(): MovieDetail[] {
    return sceneAtlasMovies;
  },

  getMovie(movieId: string): MovieDetail | null {
    return ensureMovie(movieId);
  },

  getMovieBrief(movieId: string): MovieBrief | null {
    const movie = ensureMovie(movieId);
    return movie ? movieToBrief(movie) : null;
  },

  cacheMovie(movie: MovieDetail, source = "provider") {
    mutateState((state) => {
      const existingIndex = state.movieCache.findIndex((item) => item.movieId === movie.slug);
      const record: MovieCacheRecord = {
        movieId: movie.slug,
        movie,
        source,
        cachedAt: nowIso()
      };

      if (existingIndex >= 0) {
        state.movieCache[existingIndex] = record;
      } else {
        state.movieCache.push(record);
      }

      return record;
    });
    return movie;
  },

  getMovieCache(movieId: string) {
    const state = readState();
    return state.movieCache.find((item) => item.movieId === movieId) ?? null;
  },

  cacheSearch(key: string, query: string, filters: MovieSearchFilters, results: MovieBrief[]) {
    mutateState((state) => {
      const record: SearchCacheRecord = {
        key,
        query,
        filters,
        results,
        cachedAt: nowIso()
      };

      const index = state.searchCache.findIndex((item) => item.key === key);
      if (index >= 0) {
        state.searchCache[index] = record;
      } else {
        state.searchCache.push(record);
      }

      return record;
    });
    return results;
  },

  getSearchCache(key: string) {
    const state = readState();
    return state.searchCache.find((item) => item.key === key) ?? null;
  },

  searchMovies(query: string, filters: MovieSearchFilters = {}) {
    const cacheKey = JSON.stringify({
      provider: "catalog",
      query: query.trim().toLowerCase(),
      filters
    });
    const cached = sceneAtlasStore.getSearchCache(cacheKey);
    if (cached) {
      return cached.results;
    }

    const results = searchSceneAtlasMovies(query, filters).map(movieToBrief);
    sceneAtlasStore.cacheSearch(cacheKey, query, filters, results);
    return results;
  },

  recordSearchEvent(
    userId: string,
    input: { query: string; filters: MovieSearchFilters; resultCount: number; provider: string }
  ) {
    return mutateState((state) => {
      const record: SearchEventRecord = {
        id: randomUUID(),
        userId,
        query: input.query,
        filters: input.filters,
        resultCount: input.resultCount,
        provider: input.provider,
        createdAt: nowIso()
      };
      state.searchEvents.push(record);
      state.analyticsEvents.push({
        id: randomUUID(),
        eventName: "search_submission",
        userId,
        payload: {
          query: input.query,
          resultCount: input.resultCount,
          provider: input.provider,
          filters: input.filters
        },
        createdAt: record.createdAt
      });
      return record;
    });
  },

  recordMovieViewEvent(
    userId: string,
    movieId: string,
    spoilerEnabled: boolean,
    referrer?: string
  ) {
    return mutateState((state) => {
      const record: MovieViewEventRecord = {
        id: randomUUID(),
        userId,
        movieId,
        spoilerEnabled,
        referrer,
        createdAt: nowIso()
      };
      state.movieViewEvents.push(record);
      state.analyticsEvents.push({
        id: randomUUID(),
        eventName: "movie_view",
        userId,
        payload: {
          movieId,
          spoilerEnabled,
          referrer
        },
        createdAt: record.createdAt
      });
      return record;
    });
  },

  recordAnalyticsEvent(
    eventName: string,
    input: { userId?: string; sessionId?: string; payload?: Record<string, unknown> } = {}
  ) {
    return mutateState((state) => {
      const record: AnalyticsEventRecord = {
        id: randomUUID(),
        eventName,
        userId: input.userId,
        sessionId: input.sessionId,
        payload: input.payload,
        createdAt: nowIso()
      };
      state.analyticsEvents.push(record);
      return record;
    });
  },

  listSearchEvents(userId?: string, limit = 25) {
    const state = readState();
    const items = userId ? state.searchEvents.filter((event) => event.userId === userId) : state.searchEvents;
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  },

  listMovieViewEvents(userId?: string, limit = 25) {
    const state = readState();
    const items = userId ? state.movieViewEvents.filter((event) => event.userId === userId) : state.movieViewEvents;
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  },

  listAnalyticsEvents(limit = 50, eventNames?: string[]) {
    const state = readState();
    const filtered = eventNames?.length ? state.analyticsEvents.filter((event) => eventNames.includes(event.eventName)) : state.analyticsEvents;
    return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  },

  getAnalyticsSummary() {
    const state = readState();
    const counts = new Map<string, number>();
    for (const event of state.analyticsEvents) {
      counts.set(event.eventName, (counts.get(event.eventName) ?? 0) + 1);
    }

    return {
      total: state.analyticsEvents.length,
      byEventName: Object.fromEntries(counts.entries()),
      recentEvents: [...state.analyticsEvents].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12)
    };
  },

  recordAdminAudit(actor: string, action: string, target?: string, metadata?: Record<string, unknown>) {
    return mutateState((state) => {
      const record: AdminAuditLogRecord = {
        id: randomUUID(),
        actor,
        action,
        target,
        metadata,
        createdAt: nowIso()
      };
      state.adminAuditLogs.push(record);
      return record;
    });
  },

  listAdminAuditLogs(limit = 50) {
    const state = readState();
    return [...state.adminAuditLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  },

  getPromptVersion(provider: string, model: string) {
    return mutateState((state) => {
      const existing = state.promptVersions.find((item) => item.provider === provider && item.model === model && item.active);
      if (existing) {
        return existing;
      }

      const now = nowIso();
      const record: PromptVersionRecord = {
        id: randomUUID(),
        provider,
        model,
        versionKey: `${provider}:${model}:v1`,
        active: true,
        createdAt: now,
        updatedAt: now
      };
      state.promptVersions.push(record);
      return record;
    });
  },

  activatePromptVersion(provider: string, model: string, versionKey: string) {
    return mutateState((state) => {
      const now = nowIso();
      for (const version of state.promptVersions) {
        if (version.provider === provider && version.model === model) {
          version.active = version.versionKey === versionKey;
          version.updatedAt = now;
        }
      }

      let record = state.promptVersions.find(
        (item) => item.provider === provider && item.model === model && item.versionKey === versionKey
      );
      if (!record) {
        record = {
          id: randomUUID(),
          provider,
          model,
          versionKey,
          active: true,
          createdAt: now,
          updatedAt: now
        };
        state.promptVersions.push(record);
      }

      record.active = true;
      record.updatedAt = now;
      return record;
    });
  },

  listChatSessions(userId?: string, movieId?: string, limit = 25) {
    const state = readState();
    const sessions = state.chatSessions.filter((session) => {
      if (userId && session.userId !== userId) {
        return false;
      }

      if (movieId && session.movieId !== movieId) {
        return false;
      }

      return true;
    });

    return [...sessions]
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
      .slice(0, limit)
      .map((session) => {
        const messages = state.chatMessages.filter((message) => message.sessionId === session.id);
        return {
          ...session,
          messageCount: messages.length,
          lastMessage: messages[messages.length - 1] ?? null
        };
      });
  },

  getChatSession(sessionId: string) {
    const state = readState();
    return state.chatSessions.find((session) => session.id === sessionId) ?? null;
  },

  getChatMessages(sessionId: string) {
    const state = readState();
    return [...state.chatMessages]
      .filter((message) => message.sessionId === sessionId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  createChatSession(
    userId: string,
    movieId: string,
    input: {
      spoilerEnabled: boolean;
      provider: string;
      model: string;
      promptVersion?: string;
      summary?: string;
      archived?: boolean;
    }
  ) {
    return mutateState((state) => {
      const now = nowIso();
      const existing = state.chatSessions.find(
        (session) => session.userId === userId && session.movieId === movieId && session.spoilerEnabled === input.spoilerEnabled && !session.archived
      );
      if (existing) {
        existing.provider = input.provider;
        existing.model = input.model;
        existing.promptVersion = input.promptVersion ?? existing.promptVersion;
        existing.summary = input.summary ?? existing.summary;
        existing.archived = input.archived ?? existing.archived;
        existing.updatedAt = now;
        return existing;
      }

      const session: ChatSessionRecord = {
        id: randomUUID(),
        userId,
        movieId,
        summary: input.summary,
        provider: input.provider,
        model: input.model,
        promptVersion: input.promptVersion ?? `${input.provider}:${input.model}:v1`,
        spoilerEnabled: input.spoilerEnabled,
        archived: input.archived ?? false,
        lastMessageAt: now,
        createdAt: now,
        updatedAt: now
      };
      state.chatSessions.push(session);
      state.analyticsEvents.push({
        id: randomUUID(),
        eventName: "chat_start",
        userId,
        payload: {
          movieId,
          spoilerEnabled: input.spoilerEnabled,
          provider: input.provider,
          model: input.model
        },
        createdAt: now
      });
      return session;
    });
  },

  appendChatMessage(
    sessionId: string,
    input: {
      role: "system" | "user" | "assistant";
      content: string;
      inputTokens?: number;
      outputTokens?: number;
    }
  ) {
    return mutateState((state) => {
      const session = state.chatSessions.find((item) => item.id === sessionId);
      if (!session) {
        throw new SceneAtlasError("Chat session not found.", "NOT_FOUND");
      }

      const now = nowIso();
      const message: ChatMessageRecord = {
        id: randomUUID(),
        sessionId,
        role: input.role,
        content: input.content,
        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
        createdAt: now
      };
      state.chatMessages.push(message);
      session.lastMessageAt = now;
      session.updatedAt = now;
      session.archived = false;
      return message;
    });
  },

  updateChatSessionSummary(sessionId: string, summary: string) {
    return mutateState((state) => {
      const session = state.chatSessions.find((item) => item.id === sessionId);
      if (!session) {
        throw new SceneAtlasError("Chat session not found.", "NOT_FOUND");
      }

      session.summary = summary;
      session.updatedAt = nowIso();
      return session;
    });
  },

  archiveChatSession(sessionId: string) {
    return mutateState((state) => {
      const session = state.chatSessions.find((item) => item.id === sessionId);
      if (!session) {
        throw new SceneAtlasError("Chat session not found.", "NOT_FOUND");
      }

      session.archived = true;
      session.updatedAt = nowIso();
      return session;
    });
  },

  getFeaturedMovies(limit = 4) {
    const catalog = sceneAtlasMovies.map(movieToBrief);
    const bySlug = new Map(catalog.map((movie) => [movie.slug, movie]));
    const state = readState();
    const scores = new Map<string, number>();

    for (const movie of catalog) {
      scores.set(movie.slug, 0);
    }

    state.featuredMovieIds.forEach((slug, index) => {
      scores.set(slug, (scores.get(slug) ?? 0) + 1_000 - index * 5);
    });

    for (const item of state.movieViewEvents) {
      scores.set(item.movieId, (scores.get(item.movieId) ?? 0) + 5);
    }

    for (const item of state.watchlistItems) {
      scores.set(item.movieId, (scores.get(item.movieId) ?? 0) + 3);
    }

    for (const item of state.ratings) {
      scores.set(item.movieId, (scores.get(item.movieId) ?? 0) + item.value);
    }

    for (const item of state.reviews) {
      scores.set(item.movieId, (scores.get(item.movieId) ?? 0) + 2);
    }

    return [...catalog]
      .sort((left, right) => {
        const scoreDelta = (scores.get(right.slug) ?? 0) - (scores.get(left.slug) ?? 0);
        if (scoreDelta !== 0) {
          return scoreDelta;
        }

        return right.rating - left.rating;
      })
      .slice(0, limit)
      .map((movie) => bySlug.get(movie.slug) ?? movie);
  },

  featureMovie(movieId: string, featured = true, actor = "admin") {
    return mutateState((state) => {
      const movie = ensureMovie(movieId);
      if (!movie) {
        throw new SceneAtlasError("Movie not found.", "NOT_FOUND");
      }

      state.featuredMovieIds = state.featuredMovieIds.filter((slug) => slug !== movieId);
      if (featured) {
        state.featuredMovieIds.unshift(movieId);
      }

      const now = nowIso();
      state.adminAuditLogs.push({
        id: randomUUID(),
        actor,
        action: featured ? "feature_movie" : "unfeature_movie",
        target: movieId,
        metadata: {
          movieId,
          title: movie.title
        },
        createdAt: now
      });
      state.analyticsEvents.push({
        id: randomUUID(),
        eventName: featured ? "feature_title" : "unfeature_title",
        userId: actor,
        payload: {
          movieId,
          title: movie.title
        },
        createdAt: now
      });
      return movieToBrief(movie);
    });
  },

  getTrendingQueries(limit = 8) {
    const state = readState();
    const counts = new Map<string, { query: string; count: number; lastSeenAt: string }>();

    for (const event of state.searchEvents) {
      const key = event.query.trim().toLowerCase();
      const entry = counts.get(key) ?? { query: event.query.trim(), count: 0, lastSeenAt: event.createdAt };
      entry.count += 1;
      if (event.createdAt > entry.lastSeenAt) {
        entry.lastSeenAt = event.createdAt;
        entry.query = event.query.trim();
      }
      counts.set(key, entry);
    }

    if (!counts.size) {
      for (const movie of sceneAtlasMovies.slice(0, limit)) {
        counts.set(movie.slug, {
          query: movie.title,
          count: 1,
          lastSeenAt: movie.releaseDate ?? new Date().toISOString()
        });
      }
    }

    return [...counts.values()].sort((a, b) => b.count - a.count || b.lastSeenAt.localeCompare(a.lastSeenAt)).slice(0, limit);
  },

  getSearchSuggestions(query: string, limit = 6) {
    const normalized = query.trim().toLowerCase();
    const suggestions = new Map<string, string>();

    for (const trending of sceneAtlasStore.getTrendingQueries(limit)) {
      if (!normalized || trending.query.toLowerCase().includes(normalized)) {
        suggestions.set(trending.query, trending.query);
      }
    }

    for (const movie of sceneAtlasMovies) {
      const tokens = [movie.title, movie.tagline, movie.genres.join(" "), movie.cast.join(" ")];
      if (!normalized || tokens.join(" ").toLowerCase().includes(normalized)) {
        suggestions.set(movie.title, movie.title);
      }
    }

    return [...suggestions.values()].slice(0, limit);
  },

  getSearchHistory(userId: string, limit = 20) {
    return sceneAtlasStore.listSearchEvents(userId, limit);
  },

  getMovieHistory(userId: string, limit = 20) {
    return sceneAtlasStore.listMovieViewEvents(userId, limit);
  },

  getRecentActivity(userId: string, limit = 12) {
    const activity = [
      ...sceneAtlasStore.listSearchEvents(userId, limit).map((event) => ({
        kind: "search" as const,
        title: event.query,
        detail: `${event.resultCount} results`,
        createdAt: event.createdAt
      })),
      ...sceneAtlasStore.listMovieViewEvents(userId, limit).map((event) => ({
        kind: "view" as const,
        title: sceneAtlasStore.getMovieBrief(event.movieId)?.title ?? event.movieId,
        detail: event.spoilerEnabled ? "Spoilers enabled" : "Spoilers hidden",
        createdAt: event.createdAt
      })),
      ...sceneAtlasStore
        .listAnalyticsEvents(limit * 2, ["chat_start", "chat_message", "analysis_request"])
        .filter((event) => event.userId === userId)
        .map((event) => ({
          kind: "analytics" as const,
          title: event.eventName,
          detail: typeof event.payload?.movieId === "string" ? event.payload.movieId : "Activity recorded",
          createdAt: event.createdAt
        }))
    ];

    return activity.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  },

  consumeUsage(userId: string, kind: UsageKind) {
    return mutateState((state) => {
      const { bucket } = currentBucket(state, userId);
      const user = resolveUser(state, userId);
      const isPremium = user?.subscriptionTier === "PREMIUM" || bucket.isPremium;

      if (kind === "SEARCH") {
        if (!isPremium && bucket.searchesUsed >= bucket.searchesLimit) {
          state.auditEvents.push({
            id: randomUUID(),
            kind: "search_limit",
            message: "Daily search limit reached",
            metadata: { userId },
            createdAt: nowIso()
          });
          throw new SceneAtlasError("Daily search limit reached. Upgrade for more access.", "QUOTA_EXCEEDED");
        }
        bucket.searchesUsed += 1;
      } else if (kind === "ANALYSIS") {
        if (!isPremium && bucket.analysesUsed >= bucket.analysesLimit) {
          state.auditEvents.push({
            id: randomUUID(),
            kind: "analysis_limit",
            message: "Daily analysis limit reached",
            metadata: { userId },
            createdAt: nowIso()
          });
          throw new SceneAtlasError("Daily AI analysis limit reached. Upgrade for premium access.", "QUOTA_EXCEEDED");
        }
        bucket.analysesUsed += 1;
      } else if (kind === "CHAT") {
        if (!isPremium && bucket.chatMessagesUsed >= bucket.chatMessagesLimit) {
          state.auditEvents.push({
            id: randomUUID(),
            kind: "chat_limit",
            message: "Daily chat limit reached",
            metadata: { userId },
            createdAt: nowIso()
          });
          throw new SceneAtlasError("Daily chat limit reached. Upgrade for more AI conversations.", "QUOTA_EXCEEDED");
        }
        bucket.chatMessagesUsed += 1;
      } else if (kind === "EXPORT") {
        bucket.exportUses += 1;
      } else if (kind === "REVIEW") {
        bucket.reviewsUsed += 1;
      } else if (kind === "COLLECTION_CREATE") {
        bucket.collectionCreates += 1;
      }

      bucket.isPremium = isPremium;
      bucket.adsEnabled = !isPremium;
      return usageToSnapshot(bucket);
    });
  },

  getUsageSnapshot(userId: string): UsageSnapshot {
    const state = readState();
    const { bucket, changed } = currentBucket(state, userId);
    if (changed) {
      writeState(state);
    }
    return usageToSnapshot(bucket);
  },

  upsertUser(input: SignUpInput & { subscriptionTier?: SubscriptionTier; subscriptionStatus?: SubscriptionStatus }) {
    return mutateState((state) => {
      const email = normalizeEmail(input.email);
      const now = nowIso();
      const provider = input.provider ?? "password";
      const targetId = input.id?.trim();
      let existing = targetId ? state.users.find((item) => item.id === targetId) ?? null : null;

      if (!existing) {
        existing = state.users.find((item) => item.email === email) ?? null;
      }

      if (existing) {
        if (targetId && existing.id !== targetId) {
          const rekeyed = rekeyUser(state, existing.id, targetId);
          if (rekeyed) {
            existing = rekeyed;
          }
        }

        existing.displayName = input.name || existing.displayName || defaultDisplayName(email);
        existing.email = email;
        existing.avatar = input.avatar ?? existing.avatar;
        existing.authProvider = provider;
        existing.subscriptionTier = input.subscriptionTier ?? existing.subscriptionTier;
        existing.subscriptionStatus = input.subscriptionStatus ?? existing.subscriptionStatus;
        existing.updatedAt = now;
        existing.lastLoginAt = now;
        const { bucket } = currentBucket(state, existing.id);
        bucket.isPremium = existing.subscriptionTier === "PREMIUM";
        bucket.adsEnabled = !bucket.isPremium;
        return existing;
      }

      const user: SceneAtlasUserRecord = {
        id: targetId || randomUUID(),
        displayName: input.name.trim() || defaultDisplayName(email),
        email,
        avatar: input.avatar,
        authProvider: provider,
        subscriptionTier: input.subscriptionTier ?? "FREE",
        subscriptionStatus: input.subscriptionStatus ?? "NONE",
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now
      };
      state.users.push(user);
      currentBucket(state, user.id);
      return user;
    });
  },

  createSession(userId: string, token: string = randomUUID()) {
    return mutateState((state) => {
      const now = nowIso();
      const existing = state.sessions.find((item) => item.token === token);
      if (existing) {
        existing.userId = userId;
        existing.lastSeenAt = now;
        return existing;
      }

      const session: SceneAtlasSessionRecord = {
        token,
        userId,
        createdAt: now,
        lastSeenAt: now
      };
      state.sessions.push(session);
      return session;
    });
  },

  resolveSession(token?: string | null) {
    if (!token) {
      return null;
    }

    return mutateState((state) => {
      const session = state.sessions.find((item) => item.token === token);
      if (!session) {
        return null;
      }

      session.lastSeenAt = nowIso();
      return {
        session,
        user: resolveUser(state, session.userId)
      };
    });
  },

  signUp(input: SignUpInput) {
    const user = sceneAtlasStore.upsertUser({
      ...input,
      subscriptionTier: "FREE",
      subscriptionStatus: "NONE"
    });
    const session = sceneAtlasStore.createSession(user.id);

    return {
      session,
      user,
      usage: sceneAtlasStore.getUsageSnapshot(user.id)
    };
  },

  signIn(input: SignInInput) {
    const user = sceneAtlasStore.upsertUser({
      name: defaultDisplayName(input.email),
      email: input.email,
      avatar: input.avatar,
      provider: input.provider ?? "password"
    });
    const session = sceneAtlasStore.createSession(user.id);

    return {
      session,
      user,
      usage: sceneAtlasStore.getUsageSnapshot(user.id)
    };
  },

  signOut(token: string) {
    mutateState((state) => {
      const before = state.sessions.length;
      state.sessions = state.sessions.filter((item) => item.token !== token);
      return before !== state.sessions.length;
    });
  },

  getCurrentAccount(token?: string | null): AccountSnapshot | null {
    const resolved = sceneAtlasStore.resolveSession(token);
    if (!resolved?.user) {
      return null;
    }

    const state = readState();
    const { bucket, changed } = currentBucket(state, resolved.user.id);
    if (changed) {
      writeState(state);
    }

    return userToSnapshot(resolved.user, bucket, state);
  },

  getAccount(userId: string): AccountSnapshot | null {
    const state = readState();
    const user = resolveUser(state, userId);
    if (!user) {
      return null;
    }

    const { bucket, changed } = currentBucket(state, userId);
    if (changed) {
      writeState(state);
    }

    return userToSnapshot(user, bucket, state);
  },

  promoteToPremium(userId: string, source = "manual") {
    return mutateState((state) => {
      const user = resolveUser(state, userId);
      if (!user) {
        throw new SceneAtlasError("User not found.", "NOT_FOUND");
      }

      user.subscriptionTier = "PREMIUM";
      user.subscriptionStatus = "ACTIVE";
      user.updatedAt = nowIso();

      const { bucket } = currentBucket(state, userId);
      bucket.isPremium = true;
      bucket.adsEnabled = false;

      state.auditEvents.push({
        id: randomUUID(),
        kind: "subscription_change",
        message: "Subscription updated to premium",
        metadata: { userId, source },
        createdAt: nowIso()
      });

      return user;
    });
  },

  demoteToFree(userId: string, source = "manual") {
    return mutateState((state) => {
      const user = resolveUser(state, userId);
      if (!user) {
        throw new SceneAtlasError("User not found.", "NOT_FOUND");
      }

      user.subscriptionTier = "FREE";
      user.subscriptionStatus = "NONE";
      user.updatedAt = nowIso();

      const { bucket } = currentBucket(state, userId);
      bucket.isPremium = false;
      bucket.adsEnabled = true;

      state.auditEvents.push({
        id: randomUUID(),
        kind: "subscription_change",
        message: "Subscription downgraded to free",
        metadata: { userId, source },
        createdAt: nowIso()
      });

      return user;
    });
  },

  setAvatar(userId: string, avatar?: string) {
    return mutateState((state) => {
      const user = resolveUser(state, userId);
      if (!user) {
        throw new SceneAtlasError("User not found.", "NOT_FOUND");
      }

      user.avatar = avatar;
      user.updatedAt = nowIso();
      return user;
    });
  },

  updateDisplayName(userId: string, displayName: string) {
    return mutateState((state) => {
      const user = resolveUser(state, userId);
      if (!user) {
        throw new SceneAtlasError("User not found.", "NOT_FOUND");
      }

      user.displayName = displayName.trim() || user.displayName;
      user.updatedAt = nowIso();
      return user;
    });
  },

  listWatchlist(userId: string) {
    const state = readState();
    const movieIds = state.watchlistItems.filter((item) => item.userId === userId).map((item) => item.movieId);
    return movieIds
      .map((movieId) => sceneAtlasStore.getMovieBrief(movieId))
      .filter((movie): movie is MovieBrief => Boolean(movie))
      .map((movie) => movie);
  },

  isOnWatchlist(userId: string, movieId: string) {
    const state = readState();
    return state.watchlistItems.some((item) => item.userId === userId && item.movieId === movieId);
  },

  addToWatchlist(userId: string, movieId: string) {
    return mutateState((state) => {
      const movie = ensureMovie(movieId);
      if (!movie) {
        throw new SceneAtlasError("Movie not found.", "NOT_FOUND");
      }

      if (!state.watchlistItems.some((item) => item.userId === userId && item.movieId === movieId)) {
        state.watchlistItems.push({
          userId,
          movieId,
          createdAt: nowIso()
        });
      }

      return movieToBrief(movie);
    });
  },

  removeFromWatchlist(userId: string, movieId: string) {
    mutateState((state) => {
      state.watchlistItems = state.watchlistItems.filter((item) => !(item.userId === userId && item.movieId === movieId));
      return true;
    });
  },

  listCollections(userId: string) {
    const state = readState();
    return state.collections
      .filter((collection) => collection.userId === userId)
      .map((collection) => collectionPreviewFromRecord(collection, state));
  },

  getCollection(collectionId: string) {
    const state = readState();
    return state.collections.find((collection) => collection.id === collectionId) ?? null;
  },

  createCollection(userId: string, input: { name: string; description?: string; visibility?: CollectionVisibility }) {
    return mutateState((state) => {
      const user = resolveUser(state, userId);
      if (!user) {
        throw new SceneAtlasError("User not found.", "NOT_FOUND");
      }

      const existingCollections = state.collections.filter((collection) => collection.userId === userId);
      const isPremium = user.subscriptionTier === "PREMIUM";
      if (!isPremium && existingCollections.length >= FREE_COLLECTION_LIMIT) {
        state.auditEvents.push({
          id: randomUUID(),
          kind: "collection",
          message: "Collection creation limit reached",
          metadata: { userId },
          createdAt: nowIso()
        });
        throw new SceneAtlasError("Free accounts can create up to two collections. Upgrade for unlimited collections.", "QUOTA_EXCEEDED");
      }

      const now = nowIso();
      const collection: CollectionRecord = {
        id: randomUUID(),
        userId,
        name: input.name.trim() || "Untitled collection",
        description: input.description?.trim() || undefined,
        visibility: input.visibility ?? "private",
        createdAt: now,
        updatedAt: now
      };
      state.collections.push(collection);

      return collectionPreviewFromRecord(collection, state);
    });
  },

  addMovieToCollection(userId: string, collectionId: string, movieId: string) {
    return mutateState((state) => {
      const collection = state.collections.find((item) => item.id === collectionId && item.userId === userId);
      if (!collection) {
        throw new SceneAtlasError("Collection not found.", "NOT_FOUND");
      }

      const movie = ensureMovie(movieId);
      if (!movie) {
        throw new SceneAtlasError("Movie not found.", "NOT_FOUND");
      }

      if (!state.collectionItems.some((item) => item.collectionId === collectionId && item.movieId === movieId)) {
        state.collectionItems.push({
          id: randomUUID(),
          collectionId,
          movieId,
          createdAt: nowIso()
        });
        collection.updatedAt = nowIso();
      }

      return collectionPreviewFromRecord(collection, state);
    });
  },

  removeMovieFromCollection(userId: string, collectionId: string, movieId: string) {
    mutateState((state) => {
      const collection = state.collections.find((item) => item.id === collectionId && item.userId === userId);
      if (!collection) {
        throw new SceneAtlasError("Collection not found.", "NOT_FOUND");
      }

      state.collectionItems = state.collectionItems.filter((item) => !(item.collectionId === collectionId && item.movieId === movieId));
      collection.updatedAt = nowIso();
      return true;
    });
  },

  getCollectionMovies(collectionId: string) {
    const state = readState();
    return state.collectionItems
      .filter((item) => item.collectionId === collectionId)
      .map((item) => sceneAtlasStore.getMovieBrief(item.movieId))
      .filter((movie): movie is MovieBrief => Boolean(movie));
  },

  upsertRating(userId: string, movieId: string, value: number) {
    return mutateState((state) => {
      if (value < 1 || value > 5) {
        throw new SceneAtlasError("Ratings must be between 1 and 5.", "VALIDATION");
      }

      const movie = ensureMovie(movieId);
      if (!movie) {
        throw new SceneAtlasError("Movie not found.", "NOT_FOUND");
      }

      const existing = state.ratings.find((item) => item.userId === userId && item.movieId === movieId);
      if (existing) {
        existing.value = value;
        existing.updatedAt = nowIso();
        return existing;
      }

      const now = nowIso();
      const rating: RatingRecord = {
        id: randomUUID(),
        userId,
        movieId,
        value,
        createdAt: now,
        updatedAt: now
      };
      state.ratings.push(rating);
      return rating;
    });
  },

  getUserRating(userId: string, movieId: string) {
    const state = readState();
    return state.ratings.find((item) => item.userId === userId && item.movieId === movieId) ?? null;
  },

  getAverageRating(movieId: string) {
    const state = readState();
    const ratings = state.ratings.filter((item) => item.movieId === movieId);
    if (!ratings.length) {
      return null;
    }

    const total = ratings.reduce((sum, item) => sum + item.value, 0);
    return Number((total / ratings.length).toFixed(1));
  },

  listReviews(movieId?: string) {
    const state = readState();
    const reviews = movieId ? state.reviews.filter((item) => item.movieId === movieId) : state.reviews;
    return reviews
      .map((review) => {
        const rating = state.ratings.find((item) => item.userId === review.userId && item.movieId === review.movieId)?.value ?? 5;
        return reviewPreviewFromRecord(review, state.users.find((user) => user.id === review.userId), rating);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  upsertReview(userId: string, movieId: string, input: { title: string; body: string; spoilerTag?: boolean }) {
    return mutateState((state) => {
      const movie = ensureMovie(movieId);
      if (!movie) {
        throw new SceneAtlasError("Movie not found.", "NOT_FOUND");
      }

      const now = nowIso();
      const existing = state.reviews.find((item) => item.userId === userId && item.movieId === movieId);
      if (existing) {
        existing.title = input.title.trim() || existing.title;
        existing.body = input.body.trim() || existing.body;
        existing.spoilerTag = Boolean(input.spoilerTag);
        existing.updatedAt = now;
        return existing;
      }

      const review: ReviewRecord = {
        id: randomUUID(),
        userId,
        movieId,
        title: input.title.trim() || "Untitled review",
        body: input.body.trim(),
        spoilerTag: Boolean(input.spoilerTag),
        createdAt: now,
        updatedAt: now
      };
      state.reviews.push(review);
      return review;
    });
  },

  createExportJob(userId: string, movieId: string | undefined, format: ExportFormat) {
    return mutateState((state) => {
      const user = resolveUser(state, userId);
      if (!user) {
        throw new SceneAtlasError("User not found.", "NOT_FOUND");
      }

      if (user.subscriptionTier !== "PREMIUM") {
        state.auditEvents.push({
          id: randomUUID(),
          kind: "export",
          message: "Export attempted on free tier",
          metadata: { userId, movieId, format },
          createdAt: nowIso()
        });
        throw new SceneAtlasError("Exports are available on the premium tier.", "FORBIDDEN");
      }

      const payload = sceneAtlasStore.buildExportPayload(userId, movieId);
      const job: ExportJobRecord = {
        id: randomUUID(),
        userId,
        movieId,
        format,
        payload,
        status: "ready",
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      state.exportJobs.push(job);
      currentBucket(state, userId).bucket.exportUses += 1;
      return job;
    });
  },

  buildExportPayload(userId: string, movieId?: string) {
    const state = readState();
    const user = resolveUser(state, userId);
    if (!user) {
      throw new SceneAtlasError("User not found.", "NOT_FOUND");
    }

    const watchlist = sceneAtlasStore.listWatchlist(userId);
    const collections = sceneAtlasStore.listCollections(userId);
    const reviews = sceneAtlasStore.listReviews(movieId);
    const ratings = state.ratings.filter((item) => item.userId === userId && (!movieId || item.movieId === movieId));
    const analyses = state.analysisCache.filter((item) => !movieId || item.movieId === movieId).map((item) => ({
      movieId: item.movieId,
      spoilerEnabled: item.spoilerEnabled,
      result: item.result,
      cachedAt: item.cachedAt
    }));

    return {
      exportedAt: nowIso(),
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus
      },
      movieId,
      watchlist,
      collections,
      reviews,
      ratings,
      analyses
    };
  },

  formatExportPayload(payload: Record<string, unknown>, format: ExportFormat) {
    if (format === "markdown") {
      const user = payload.user as { displayName?: string; email?: string };
      const sections = [
        `# SceneAtlas Export`,
        ``,
        `- User: ${user?.displayName ?? "Unknown"} <${user?.email ?? "unknown"}>`,
        `- Exported at: ${String(payload.exportedAt ?? "")}`,
        ``,
        `## Watchlist`,
        JSON.stringify(payload.watchlist ?? [], null, 2),
        ``,
        `## Collections`,
        JSON.stringify(payload.collections ?? [], null, 2),
        ``,
        `## Reviews`,
        JSON.stringify(payload.reviews ?? [], null, 2),
        ``,
        `## Ratings`,
        JSON.stringify(payload.ratings ?? [], null, 2),
        ``,
        `## Analyses`,
        JSON.stringify(payload.analyses ?? [], null, 2)
      ];
      return sections.join("\n");
    }

    return JSON.stringify(payload, null, 2);
  },

  getLatestExport(userId: string, movieId?: string) {
    const state = readState();
    const exports = state.exportJobs
      .filter((item) => item.userId === userId && (!movieId || item.movieId === movieId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return exports[0] ?? null;
  },

  cacheAnalysis(movieId: string, spoilerEnabled: boolean, result: MovieAnalysis, source: string) {
    return mutateState((state) => {
      const key = JSON.stringify({ movieId, spoilerEnabled, source });
      const record: AnalysisCacheRecord = {
        key,
        movieId,
        spoilerEnabled,
        result,
        source,
        cachedAt: nowIso()
      };
      const index = state.analysisCache.findIndex((item) => item.key === key);
      if (index >= 0) {
        state.analysisCache[index] = record;
      } else {
        state.analysisCache.push(record);
      }
      return record;
    });
  },

  getAnalysisCache(movieId: string, spoilerEnabled: boolean, source: string) {
    const key = JSON.stringify({ movieId, spoilerEnabled, source });
    const state = readState();
    return state.analysisCache.find((item) => item.key === key) ?? null;
  },

  getCachedAnalysis(movieId: string, spoilerEnabled: boolean) {
    const state = readState();
    return state.analysisCache.find((item) => item.movieId === movieId && item.spoilerEnabled === spoilerEnabled) ?? null;
  },

  clearSearchCache() {
    mutateState((state) => {
      state.searchCache = [];
      return true;
    });
  },

  clearMovieCache(movieId?: string) {
    mutateState((state) => {
      state.movieCache = movieId ? state.movieCache.filter((item) => item.movieId !== movieId) : [];
      return true;
    });
  },

  clearAnalysisCache(movieId?: string, spoilerEnabled?: boolean) {
    mutateState((state) => {
      state.analysisCache = state.analysisCache.filter((item) => {
        if (movieId && item.movieId !== movieId) {
          return true;
        }

        if (typeof spoilerEnabled === "boolean" && item.spoilerEnabled !== spoilerEnabled) {
          return true;
        }

        return false;
      });
      return true;
    });
  },

  listExportJobs(limit = 25) {
    const state = readState();
    return [...state.exportJobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  },

  listAuditEvents(limit = 50, kinds?: AuditEventRecord["kind"][]) {
    const state = readState();
    const filtered = kinds?.length ? state.auditEvents.filter((event) => kinds.includes(event.kind)) : state.auditEvents;
    return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  },

  recordAudit(kind: AuditEventRecord["kind"], message: string, metadata?: Record<string, unknown>) {
    mutateState((state) => {
      state.auditEvents.push({
        id: randomUUID(),
        kind,
        message,
        metadata,
        createdAt: nowIso()
      });
      return true;
    });
  },

  getOpsSnapshot() {
    const state = readState();
    const premiumUsers = state.users.filter((user) => user.subscriptionTier === "PREMIUM").length;
    const failedRequests = state.auditEvents.filter(
      (event) =>
        event.kind === "analysis_provider_failure" ||
        event.kind === "movie_provider_failure" ||
        event.kind === "chat_provider_failure"
    );

    return {
      users: state.users.length,
      premiumUsers,
      searchCacheEntries: state.searchCache.length,
      analysisCacheEntries: state.analysisCache.length,
      searchEvents: state.searchEvents.length,
      movieViewEvents: state.movieViewEvents.length,
      chatSessions: state.chatSessions.length,
      analyticsEvents: state.analyticsEvents.length,
      failedRequests: failedRequests.length,
      quotaDenials: state.auditEvents.filter(
        (event) => event.kind === "search_limit" || event.kind === "analysis_limit" || event.kind === "chat_limit"
      ).length,
      subscriptions: state.users.map((user) => ({
        id: user.id,
        displayName: user.displayName,
        tier: user.subscriptionTier,
        status: user.subscriptionStatus
      })),
      latestEvents: state.auditEvents.slice(-8).reverse()
    };
  }
};
