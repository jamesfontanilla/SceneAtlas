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
export const FREE_COLLECTION_LIMIT = 2;

export type SubscriptionTier = "FREE" | "PREMIUM";
export type SubscriptionStatus = "NONE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";
export type CollectionVisibility = "private" | "shared";
export type ExportFormat = "json" | "markdown";
export type UsageKind = "SEARCH" | "ANALYSIS" | "EXPORT" | "REVIEW" | "COLLECTION_CREATE";

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
  exportUses: number;
  reviewsUsed: number;
  collectionCreates: number;
  searchesLimit: number;
  analysesLimit: number;
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

export interface AuditEventRecord {
  id: string;
  kind: "search_limit" | "analysis_limit" | "movie_provider_failure" | "analysis_provider_failure" | "subscription_change" | "auth" | "export" | "collection" | "review" | "rating";
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
  watchlistItems: WatchlistItemRecord[];
  collections: CollectionRecord[];
  collectionItems: CollectionItemRecord[];
  ratings: RatingRecord[];
  reviews: ReviewRecord[];
  exportJobs: ExportJobRecord[];
  auditEvents: AuditEventRecord[];
}

export interface SignUpInput {
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
    isPremium: bucket.isPremium,
    adsEnabled: bucket.adsEnabled,
    searchesUsed: bucket.searchesUsed,
    analysesUsed: bucket.analysesUsed,
    searchesLimit: bucket.searchesLimit,
    analysesLimit: bucket.analysesLimit,
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
      exportUses: 0,
      reviewsUsed: 0,
      collectionCreates: 0,
      searchesLimit: FREE_SEARCH_LIMIT,
      analysesLimit: FREE_ANALYSIS_LIMIT,
      isPremium,
      adsEnabled: !isPremium
    };
    state.usageBuckets.push(bucket);
    changed = true;
  } else if (bucket.dayKey !== today) {
    bucket.dayKey = today;
    bucket.searchesUsed = 0;
    bucket.analysesUsed = 0;
    bucket.exportUses = 0;
    bucket.reviewsUsed = 0;
    bucket.collectionCreates = 0;
    bucket.searchesLimit = FREE_SEARCH_LIMIT;
    bucket.analysesLimit = FREE_ANALYSIS_LIMIT;
    bucket.isPremium = isPremium;
    bucket.adsEnabled = !isPremium;
    changed = true;
  } else if (bucket.isPremium !== isPremium) {
    bucket.isPremium = isPremium;
    bucket.adsEnabled = !isPremium;
    changed = true;
  }

  return { bucket, changed };
}

function resolveUser(state: SceneAtlasState, userId: string) {
  return state.users.find((item) => item.id === userId) ?? null;
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
      const provider = input.provider ?? "authjs";
      const existing = state.users.find((item) => item.email === email);

      if (existing) {
        existing.displayName = input.name || existing.displayName || defaultDisplayName(email);
        existing.avatar = input.avatar ?? existing.avatar;
        existing.authProvider = provider;
        existing.subscriptionTier = input.subscriptionTier ?? existing.subscriptionTier;
        existing.subscriptionStatus = input.subscriptionStatus ?? existing.subscriptionStatus;
        existing.updatedAt = now;
        const { bucket } = currentBucket(state, existing.id);
        bucket.isPremium = existing.subscriptionTier === "PREMIUM";
        bucket.adsEnabled = !bucket.isPremium;
        return existing;
      }

      const user: SceneAtlasUserRecord = {
        id: randomUUID(),
        displayName: input.name.trim() || defaultDisplayName(email),
        email,
        avatar: input.avatar,
        authProvider: provider,
        subscriptionTier: input.subscriptionTier ?? "FREE",
        subscriptionStatus: input.subscriptionStatus ?? "NONE",
        createdAt: now,
        updatedAt: now
      };
      state.users.push(user);
      currentBucket(state, user.id);
      return user;
    });
  },

  createSession(userId: string) {
    return mutateState((state) => {
      const now = nowIso();
      const session: SceneAtlasSessionRecord = {
        token: randomUUID(),
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
      provider: input.provider ?? "authjs"
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
    const failedRequests = state.auditEvents.filter((event) => event.kind === "analysis_provider_failure" || event.kind === "movie_provider_failure");

    return {
      users: state.users.length,
      premiumUsers,
      searchCacheEntries: state.searchCache.length,
      analysisCacheEntries: state.analysisCache.length,
      failedRequests: failedRequests.length,
      quotaDenials: state.auditEvents.filter((event) => event.kind === "search_limit" || event.kind === "analysis_limit").length,
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
