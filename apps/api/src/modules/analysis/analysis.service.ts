import { Inject, Injectable } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";
import { apiEnv } from "../../config/env";
import { MockAnalysisProvider } from "./providers/mock-analysis.provider";
import { GroqAnalysisProvider } from "./providers/groq-analysis.provider";
import type { AnalysisProvider } from "./providers/analysis-provider.interface";

const ANALYSIS_PROVIDER = "ANALYSIS_PROVIDER";
const ANALYSIS_CACHE_SOURCE = apiEnv.analysisProvider === "groq" && apiEnv.groqApiKey ? "groq" : "mock";

@Injectable()
export class AnalysisService {
  constructor(@Inject(ANALYSIS_PROVIDER) private readonly provider: AnalysisProvider) {}

  async getAnalysis(movieId: string, spoilers: boolean) {
    const cached = sceneAtlasStore.getAnalysisCache(movieId, spoilers, ANALYSIS_CACHE_SOURCE);
    if (cached) {
      return cached.result;
    }

    try {
      const result = await this.provider.generate(movieId, spoilers);
      sceneAtlasStore.cacheAnalysis(movieId, spoilers, result, ANALYSIS_CACHE_SOURCE);
      return result;
    } catch (error) {
      sceneAtlasStore.recordAudit("analysis_provider_failure", "Analysis provider failed", {
        movieId,
        spoilers,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}

export const analysisProviderFactory = {
  provide: ANALYSIS_PROVIDER,
  inject: [MockAnalysisProvider, GroqAnalysisProvider],
  useFactory(mock: MockAnalysisProvider, groq: GroqAnalysisProvider) {
    return apiEnv.analysisProvider === "groq" ? groq : mock;
  }
};
