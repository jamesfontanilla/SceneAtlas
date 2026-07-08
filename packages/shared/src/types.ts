export type MovieSlug = string;

export interface TimelineEvent {
  order: number;
  label: string;
  title: string;
  description: string;
  characters: string[];
}

export interface RelationshipEdge {
  source: string;
  target: string;
  label: string;
}

export interface SimilarMovie {
  slug: MovieSlug;
  title: string;
  year: number;
  reason: string;
}

export interface MovieAnalysis {
  summary: string;
  spoilerSummary: string;
  ending: string;
  spoilerEnding: string;
  timeline: TimelineEvent[];
  relationships: RelationshipEdge[];
  similar: SimilarMovie[];
}

export interface MovieBrief {
  slug: MovieSlug;
  title: string;
  year: number;
  releaseDate?: string;
  runtimeMinutes: number;
  rating: number;
  genres: string[];
  tagline: string;
  overview: string;
  posterPalette: readonly [string, string, string];
  backdropUrl?: string;
  language?: string;
  wikidataId: string;
  commonsCategory: string;
}

export interface MovieDetail extends MovieBrief {
  director: string;
  writer: string;
  composer: string;
  cast: string[];
  analysis: MovieAnalysis;
}

export interface CollectionPreview {
  id: string;
  name: string;
  description: string;
  movieCount: number;
  visibility: "private" | "shared";
}

export interface ReviewPreview {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  spoilerTag?: boolean;
}

export interface UsageSnapshot {
  searchesRemaining: number;
  analysesRemaining: number;
  isPremium: boolean;
  adsEnabled: boolean;
  searchesUsed?: number;
  analysesUsed?: number;
  searchesLimit?: number;
  analysesLimit?: number;
  dayKey?: string;
}

export interface MovieSearchFilters {
  genre?: string;
  year?: number;
  language?: string;
}

export interface AccountSnapshot {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  subscriptionStatus: "NONE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  subscriptionTier: "FREE" | "PREMIUM";
  authProvider: string;
  watchlistCount: number;
  collectionCount: number;
  ratingCount: number;
  reviewCount: number;
  usage: UsageSnapshot;
}
