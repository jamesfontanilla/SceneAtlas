import { Injectable } from "@nestjs/common";
import { getSceneAtlasMovie } from "@sceneatlas/shared";
import type { MovieAnalysis } from "@sceneatlas/shared";
import { apiEnv } from "../../../config/env";
import type { AnalysisProvider } from "./analysis-provider.interface";

function fallbackAnalysis(movieId: string): MovieAnalysis {
  return {
    summary: `SceneAtlas can still generate a structured analysis shell for ${movieId} using the public movie-data baseline.`,
    spoilerSummary: `SceneAtlas can still generate a structured analysis shell for ${movieId} using the public movie-data baseline.`,
    ending: "Enable a richer data source or the OpenAI provider for a fuller ending explanation.",
    spoilerEnding: "Enable a richer data source or the OpenAI provider for a fuller ending explanation.",
    timeline: [],
    relationships: [],
    similar: []
  };
}

@Injectable()
export class OpenAiAnalysisProvider implements AnalysisProvider {
  async generate(movieId: string, spoilers: boolean) {
    const movie = getSceneAtlasMovie(movieId);
    if (!movie) {
      return fallbackAnalysis(movieId);
    }

    if (!apiEnv.openaiApiKey) {
      return movie.analysis;
    }

    const prompt = [
      `Movie: ${movie.title} (${movie.year})`,
      `Tagline: ${movie.tagline}`,
      `Overview: ${movie.overview}`,
      `Spoilers enabled: ${spoilers ? "yes" : "no"}`,
      "Return valid JSON with summary, spoilerSummary, ending, spoilerEnding, timeline, relationships, and similar."
    ].join("\n");

    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiEnv.openaiApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: apiEnv.openaiModel,
          input: prompt,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        return movie.analysis;
      }

      const payload = (await response.json()) as { output_text?: string };
      const parsed = payload.output_text ? (JSON.parse(payload.output_text) as MovieAnalysis) : movie.analysis;
      return parsed;
    } catch {
      return movie.analysis;
    }
  }
}
