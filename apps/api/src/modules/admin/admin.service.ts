import { Injectable } from "@nestjs/common";
import { prisma, sceneAtlasStore } from "@sceneatlas/db";
import type { MovieAnalysis } from "@sceneatlas/shared";
import { AnalysisService } from "../analysis/analysis.service";

interface AdminUsageBucket {
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

interface AdminAnalysisQueueItem {
  id: string;
  movieId: string;
  movieTitle: string;
  spoilerEnabled: boolean;
  status: string;
  hasResult: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminSubscriptionItem {
  id: string;
  displayName: string;
  email: string;
  tier: string;
  status: string;
  authProvider: string;
  updatedAt: string;
}

interface AdminExportJobItem {
  id: string;
  userId: string;
  movieId?: string;
  format: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  payloadSize: number;
}

function summarizePayload(payload: Record<string, unknown>) {
  return JSON.stringify(payload).length;
}

function mapUsageBuckets() {
  const state = sceneAtlasStore.readState();
  return state.usageBuckets
    .map<AdminUsageBucket>((bucket) => {
      const user = state.users.find((item) => item.id === bucket.userId);
      return {
        userId: bucket.userId,
        displayName: user?.displayName ?? "Unknown user",
        email: user?.email ?? "unknown@example.com",
        dayKey: bucket.dayKey,
        searchesUsed: bucket.searchesUsed,
        analysesUsed: bucket.analysesUsed,
        exportUses: bucket.exportUses,
        reviewsUsed: bucket.reviewsUsed,
        collectionCreates: bucket.collectionCreates,
        searchesLimit: bucket.searchesLimit,
        analysesLimit: bucket.analysesLimit,
        isPremium: bucket.isPremium,
        adsEnabled: bucket.adsEnabled
      };
    })
    .sort((a, b) => b.searchesUsed + b.analysesUsed - (a.searchesUsed + a.analysesUsed));
}

@Injectable()
export class AdminService {
  constructor(private readonly analysisService: AnalysisService) {}

  getMetrics() {
    return {
      metrics: sceneAtlasStore.getOpsSnapshot(),
      usageBuckets: mapUsageBuckets()
    };
  }

  async getQueue(limit = 25) {
    const requests = await prisma.analysisRequest.findMany({
      orderBy: {
        updatedAt: "desc"
      },
      take: limit,
      include: {
        movie: {
          select: {
            slug: true,
            title: true,
            releaseYear: true
          }
        },
        result: true
      }
    });

    return {
      analysisRequests: requests.map<AdminAnalysisQueueItem>((request) => ({
        id: request.id,
        movieId: request.movieId,
        movieTitle: request.movie?.title ?? request.movieId,
        spoilerEnabled: request.spoilerEnabled,
        status: request.status,
        hasResult: Boolean(request.result),
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString()
      }))
    };
  }

  getFailures(limit = 25) {
    const failedRequests = sceneAtlasStore.listAuditEvents(limit, ["analysis_provider_failure", "movie_provider_failure"]);
    return {
      failedRequests
    };
  }

  getExportJobs(limit = 25) {
    const exportJobs = sceneAtlasStore.listExportJobs(limit).map<AdminExportJobItem>((job) => ({
      id: job.id,
      userId: job.userId,
      movieId: job.movieId,
      format: job.format,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      payloadSize: summarizePayload(job.payload)
    }));

    return {
      exportJobs
    };
  }

  getSubscriptions(limit = 50) {
    const state = sceneAtlasStore.readState();
    const subscriptions = state.users
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit)
      .map<AdminSubscriptionItem>((user) => ({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        tier: user.subscriptionTier,
        status: user.subscriptionStatus,
        authProvider: user.authProvider,
        updatedAt: user.updatedAt
      }));

    return {
      subscriptions
    };
  }

  async rebuildAnalysis(movieId: string, spoilers: boolean, userId?: string): Promise<MovieAnalysis> {
    return this.analysisService.regenerate(movieId, spoilers, userId);
  }

  async invalidateCache(movieId?: string) {
    if (movieId) {
      sceneAtlasStore.clearMovieCache(movieId);
      sceneAtlasStore.clearSearchCache();
      await this.analysisService.clearCache(movieId);
      sceneAtlasStore.recordAdminAudit("admin", "invalidate_cache", movieId, {
        scope: "movie"
      });
      return {
        movieId,
        cleared: "movie"
      };
    }

    sceneAtlasStore.clearMovieCache();
    sceneAtlasStore.clearSearchCache();
    await this.analysisService.clearCache();
    sceneAtlasStore.recordAdminAudit("admin", "invalidate_cache", undefined, {
      scope: "all"
    });
    return {
      movieId: null,
      cleared: "all"
    };
  }

  featureMovie(movieId: string, featured = true, actor = "admin") {
    const movie = sceneAtlasStore.featureMovie(movieId, featured, actor);
    return {
      movie,
      featured
    };
  }
}
