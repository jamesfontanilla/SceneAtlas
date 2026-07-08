import { Inject, Injectable } from "@nestjs/common";
import { apiEnv } from "../../config/env";
import { sceneAtlasStore } from "@sceneatlas/db";
import { MockMovieProvider } from "./providers/mock-movie.provider";
import { WikidataMovieProvider } from "./providers/wikidata-movie.provider";
import type { MovieSourceProvider } from "./providers/movie-source.provider";
import type { MovieBrief, MovieDetail, MovieSearchFilters } from "@sceneatlas/shared";

const MOVIE_SOURCE_PROVIDER = "MOVIE_SOURCE_PROVIDER";

function normalizeFilters(filters: MovieSearchFilters = {}) {
  return {
    genre: filters.genre?.trim() || undefined,
    year: typeof filters.year === "number" && Number.isFinite(filters.year) ? filters.year : undefined,
    language: filters.language?.trim() || undefined
  };
}

function matchesMovieFilters(movie: MovieBrief | MovieDetail, filters: MovieSearchFilters = {}) {
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

@Injectable()
export class MoviesService {
  constructor(
    @Inject(MOVIE_SOURCE_PROVIDER) private readonly provider: MovieSourceProvider
  ) {}

  async search(query: string, filters: MovieSearchFilters = {}) {
    const normalizedFilters = normalizeFilters(filters);
    const cacheKey = JSON.stringify({
      provider: apiEnv.movieDataProvider,
      query: query.trim().toLowerCase(),
      filters: normalizedFilters
    });
    const cached = sceneAtlasStore.getSearchCache(cacheKey);
    if (cached) {
      return cached.results;
    }

    try {
      const results = await this.provider.search(query);
      const filtered = results.filter((movie) => matchesMovieFilters(movie, normalizedFilters));

      if (filtered.length) {
        sceneAtlasStore.cacheSearch(cacheKey, query, normalizedFilters, filtered);
        return filtered;
      }

      const fallback = sceneAtlasStore.searchMovies(query, normalizedFilters);
      sceneAtlasStore.cacheSearch(cacheKey, query, normalizedFilters, fallback);
      return fallback;
    } catch (error) {
      sceneAtlasStore.recordAudit("movie_provider_failure", "Movie search provider failed", {
        query,
        filters: normalizedFilters,
        error: error instanceof Error ? error.message : String(error)
      });
      const fallback = sceneAtlasStore.searchMovies(query, normalizedFilters);
      sceneAtlasStore.cacheSearch(cacheKey, query, normalizedFilters, fallback);
      return fallback;
    }
  }

  async findBySlug(movieId: string) {
    const cached = sceneAtlasStore.getMovieCache(movieId);
    if (cached) {
      return cached.movie;
    }

    try {
      const movie = await this.provider.findBySlug(movieId);
      if (movie) {
        sceneAtlasStore.cacheMovie(movie, apiEnv.movieDataProvider);
        return movie;
      }
    } catch (error) {
      sceneAtlasStore.recordAudit("movie_provider_failure", "Movie detail provider failed", {
        movieId,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return sceneAtlasStore.getMovie(movieId);
  }
}

export const movieSourceProviderFactory = {
  provide: MOVIE_SOURCE_PROVIDER,
  inject: [MockMovieProvider, WikidataMovieProvider],
  useFactory(mock: MockMovieProvider, wikidata: WikidataMovieProvider) {
    return apiEnv.movieDataProvider === "wikidata" ? wikidata : mock;
  }
};
