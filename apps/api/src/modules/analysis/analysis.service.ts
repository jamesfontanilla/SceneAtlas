import { Inject, Injectable } from "@nestjs/common";
import { prisma, sceneAtlasStore, SceneAtlasError } from "@sceneatlas/db";
import type { MovieAnalysis, MovieDetail, RelationshipEdge, SimilarMovie, TimelineEvent } from "@sceneatlas/shared";
import { apiEnv } from "../../config/env";
import { getSceneAtlasMovie } from "@sceneatlas/shared";
import { MockAnalysisProvider } from "./providers/mock-analysis.provider";
import { GroqAnalysisProvider } from "./providers/groq-analysis.provider";
import type { AnalysisProvider } from "./providers/analysis-provider.interface";

const ANALYSIS_PROVIDER = "ANALYSIS_PROVIDER";
const ANALYSIS_CACHE_SOURCE = apiEnv.analysisProvider === "groq" && apiEnv.groqApiKey ? "groq" : "mock";
const ANALYSIS_RETRY_COOLDOWN_MS = 5 * 60 * 1000;

function analysisCacheKey(movieId: string, spoilers: boolean) {
  return JSON.stringify({ movieId, spoilers });
}

function movieAnalysisToRecord(result: MovieAnalysis) {
  return {
    summary: result.summary,
    spoilerSummary: result.spoilerSummary,
    endingExplanation: result.ending,
    spoilerEnding: result.spoilerEnding,
    timeline: result.timeline as unknown,
    relationships: result.relationships as unknown,
    similarMovies: result.similar as unknown
  };
}

function recordToMovieAnalysis(result: {
  summary: string;
  spoilerSummary: string;
  endingExplanation: string;
  spoilerEnding: string;
  timeline: unknown;
  relationships: unknown;
  similarMovies: unknown;
}): MovieAnalysis {
  return {
    summary: result.summary,
    spoilerSummary: result.spoilerSummary,
    ending: result.endingExplanation,
    spoilerEnding: result.spoilerEnding,
    timeline: Array.isArray(result.timeline) ? (result.timeline as TimelineEvent[]) : [],
    relationships: Array.isArray(result.relationships) ? (result.relationships as RelationshipEdge[]) : [],
    similar: Array.isArray(result.similarMovies) ? (result.similarMovies as SimilarMovie[]) : []
  };
}

function resolveMovie(movieId: string): MovieDetail | null {
  return sceneAtlasStore.getMovie(movieId) ?? getSceneAtlasMovie(movieId);
}

function analysisUnavailableError() {
  return new SceneAtlasError("Analysis provider unavailable. Try again later.", "STATE_ERROR");
}

@Injectable()
export class AnalysisService {
  constructor(@Inject(ANALYSIS_PROVIDER) private readonly provider: AnalysisProvider) {}

  private async ensureMovieRecord(movieId: string) {
    const movie = resolveMovie(movieId);
    if (!movie) {
      throw new SceneAtlasError("Movie not found.", "NOT_FOUND");
    }

    await prisma.movie.upsert({
      where: {
        slug: movie.slug
      },
      create: {
        slug: movie.slug,
        title: movie.title,
        releaseYear: movie.year,
        runtimeMinutes: movie.runtimeMinutes,
        rating: movie.rating,
        tagline: movie.tagline,
        overview: movie.overview,
        posterUrl: undefined,
        backdropUrl: movie.backdropUrl,
        posterPalette: movie.posterPalette as unknown,
        sourceSystem: apiEnv.movieDataProvider,
        sourceKey: movie.wikidataId,
        commonsCategory: movie.commonsCategory
      } as any,
      update: {
        title: movie.title,
        releaseYear: movie.year,
        runtimeMinutes: movie.runtimeMinutes,
        rating: movie.rating,
        tagline: movie.tagline,
        overview: movie.overview,
        posterUrl: undefined,
        backdropUrl: movie.backdropUrl,
        posterPalette: movie.posterPalette as unknown,
        sourceSystem: apiEnv.movieDataProvider,
        sourceKey: movie.wikidataId,
        commonsCategory: movie.commonsCategory
      } as any
    });

    return movie;
  }

  private async upsertAnalysisRequest(movieId: string, spoilers: boolean, userId?: string, status = "queued") {
    const movie = await this.ensureMovieRecord(movieId);
    const cacheKey = analysisCacheKey(movieId, spoilers);

    return prisma.analysisRequest.upsert({
      where: {
        cacheKey
      },
      create: {
        cacheKey,
        movieId: movie.slug,
        spoilerEnabled: spoilers,
        status,
        userId: userId ?? null
      },
      update: {
        movieId: movie.slug,
        spoilerEnabled: spoilers,
        status,
        userId: userId ?? null
      },
      include: {
        result: true
      }
    });
  }

  private async persistAnalysisResult(requestId: string, result: MovieAnalysis) {
    await prisma.analysisResult.upsert({
      where: {
        requestId
      },
      create: {
        requestId,
        ...movieAnalysisToRecord(result)
      } as any,
      update: {
        ...movieAnalysisToRecord(result)
      } as any
    });
  }

  private async retryableAnalysis(movieId: string, spoilers: boolean, userId?: string) {
    const request = await this.upsertAnalysisRequest(movieId, spoilers, userId, "queued");

    try {
      const result = await this.provider.generate(movieId, spoilers);
      await this.persistAnalysisResult(request.id, result);
      await prisma.analysisRequest.update({
        where: {
          id: request.id
        },
        data: {
          status: "ready"
        }
      });
      sceneAtlasStore.cacheAnalysis(movieId, spoilers, result, ANALYSIS_CACHE_SOURCE);
      return result;
    } catch (error) {
      sceneAtlasStore.recordAudit("analysis_provider_failure", "Analysis provider failed", {
        movieId,
        spoilers,
        error: error instanceof Error ? error.message : String(error)
      });

      await prisma.analysisRequest.update({
        where: {
          id: request.id
        },
        data: {
          status: request.result ? "ready" : "failed"
        }
      });

      if (request.result) {
        const cached = recordToMovieAnalysis(request.result);
        sceneAtlasStore.cacheAnalysis(movieId, spoilers, cached, ANALYSIS_CACHE_SOURCE);
        return cached;
      }

      throw analysisUnavailableError();
    }
  }

  async getAnalysis(movieId: string, spoilers: boolean, userId?: string) {
    sceneAtlasStore.recordAnalyticsEvent("analysis_request", {
      userId,
      payload: {
        movieId,
        spoilers
      }
    });

    const cached =
      sceneAtlasStore.getAnalysisCache(movieId, spoilers, ANALYSIS_CACHE_SOURCE) ?? sceneAtlasStore.getCachedAnalysis(movieId, spoilers);
    if (cached) {
      const request = await this.upsertAnalysisRequest(movieId, spoilers, userId, "ready");
      await this.persistAnalysisResult(request.id, cached.result);
      return cached.result;
    }

    const request = await prisma.analysisRequest.findUnique({
      where: {
        cacheKey: analysisCacheKey(movieId, spoilers)
      },
      include: {
        result: true
      }
    });

    if (request?.result) {
      const result = recordToMovieAnalysis(request.result);
      sceneAtlasStore.cacheAnalysis(movieId, spoilers, result, ANALYSIS_CACHE_SOURCE);
      return result;
    }

    if (request?.status === "failed" && Date.now() - request.updatedAt.getTime() < ANALYSIS_RETRY_COOLDOWN_MS) {
      throw analysisUnavailableError();
    }

    return this.retryableAnalysis(movieId, spoilers, userId);
  }

  async regenerate(movieId: string, spoilers: boolean, userId?: string) {
    sceneAtlasStore.recordAnalyticsEvent("analysis_regenerate", {
      userId,
      payload: {
        movieId,
        spoilers
      }
    });
    return this.retryableAnalysis(movieId, spoilers, userId);
  }

  async clearCache(movieId?: string, spoilers?: boolean) {
    if (!movieId) {
      sceneAtlasStore.recordAnalyticsEvent("analysis_cache_clear", {
        payload: {
          movieId: null,
          spoilers: typeof spoilers === "boolean" ? spoilers : null
        }
      });
      await prisma.analysisRequest.deleteMany({});
      sceneAtlasStore.clearAnalysisCache();
      return { movieId: null, spoilers: typeof spoilers === "boolean" ? spoilers : null };
    }

    const where = {
      movieId,
      ...(typeof spoilers === "boolean" ? { spoilerEnabled: spoilers } : {})
    };

    await prisma.analysisRequest.deleteMany({
      where
    });

    sceneAtlasStore.recordAnalyticsEvent("analysis_cache_clear", {
      payload: {
        movieId,
        spoilers: typeof spoilers === "boolean" ? spoilers : null
      }
    });
    sceneAtlasStore.clearAnalysisCache(movieId, spoilers);
    return { movieId, spoilers: typeof spoilers === "boolean" ? spoilers : null };
  }
}

export const analysisProviderFactory = {
  provide: ANALYSIS_PROVIDER,
  inject: [MockAnalysisProvider, GroqAnalysisProvider],
  useFactory(mock: MockAnalysisProvider, groq: GroqAnalysisProvider) {
    return apiEnv.analysisProvider === "groq" ? groq : mock;
  }
};
