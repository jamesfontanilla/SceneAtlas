import { Injectable } from "@nestjs/common";
import { getSceneAtlasMovie } from "@sceneatlas/shared";
import type { MovieAnalysis } from "@sceneatlas/shared";
import type { AnalysisProvider } from "./analysis-provider.interface";

function fallbackAnalysis(movieId: string): MovieAnalysis {
  return {
    summary: `SceneAtlas can still generate a structured analysis shell for ${movieId} using the public movie-data baseline.`,
    spoilerSummary: `SceneAtlas can still generate a structured analysis shell for ${movieId} using the public movie-data baseline.`,
    ending: "Enable a richer data source or the AI provider for a fuller ending explanation.",
    spoilerEnding: "Enable a richer data source or the AI provider for a fuller ending explanation.",
    timeline: [],
    relationships: [],
    similar: []
  };
}

@Injectable()
export class MockAnalysisProvider implements AnalysisProvider {
  async generate(movieId: string, spoilers: boolean) {
    const movie = getSceneAtlasMovie(movieId);
    if (!movie) {
      return fallbackAnalysis(movieId);
    }

    const analysis: MovieAnalysis = movie.analysis;
    return spoilers
      ? analysis
      : {
          ...analysis,
          summary: analysis.summary,
          ending: "Enable spoilers to read the ending explanation."
        };
  }
}
