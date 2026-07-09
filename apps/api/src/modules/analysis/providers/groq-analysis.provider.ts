import { Injectable } from "@nestjs/common";
import { getSceneAtlasMovie } from "@sceneatlas/shared";
import type { MovieAnalysis, MovieDetail, RelationshipEdge, SimilarMovie, TimelineEvent } from "@sceneatlas/shared";
import { apiEnv } from "../../../config/env";
import type { AnalysisProvider } from "./analysis-provider.interface";

const GROQ_MODEL = "openai/gpt-oss-120b";

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

function fallbackAnalysis(movieId: string): MovieAnalysis {
  return {
    summary: `SceneAtlas can still generate a structured analysis shell for ${movieId} using the public movie-data baseline.`,
    spoilerSummary: `SceneAtlas can still generate a structured analysis shell for ${movieId} using the public movie-data baseline.`,
    ending: "Enable spoilers to read the ending explanation.",
    spoilerEnding: "Enable spoilers to read the ending explanation.",
    timeline: [],
    relationships: [],
    similar: []
  };
}

function redactEnding(analysis: MovieAnalysis): MovieAnalysis {
  return {
    ...analysis,
    ending: "Enable spoilers to read the ending explanation."
  };
}

function toString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function toTimelineEvent(value: unknown): TimelineEvent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const orderNumber = Number(record.order);

  if (!Number.isFinite(orderNumber)) {
    return null;
  }

  const title = toString(record.title);
  const description = toString(record.description);
  if (!title || !description) {
    return null;
  }

  return {
    order: Math.max(0, Math.trunc(orderNumber)),
    label: toString(record.label, `Beat ${Math.max(0, Math.trunc(orderNumber))}`),
    title,
    description,
    characters: toStringArray(record.characters)
  };
}

function toRelationshipEdge(value: unknown): RelationshipEdge | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const source = toString(record.source);
  const target = toString(record.target);
  const label = toString(record.label);

  if (!source || !target || !label) {
    return null;
  }

  return { source, target, label };
}

function toSimilarMovie(value: unknown): SimilarMovie | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const slug = toString(record.slug);
  const title = toString(record.title);
  const reason = toString(record.reason);
  const year = Number(record.year);

  if (!slug || !title || !reason || !Number.isFinite(year)) {
    return null;
  }

  return {
    slug,
    title,
    year: Math.trunc(year),
    reason
  };
}

function parseJsonPayload(content: string): unknown {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fencedMatch?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const firstBrace = candidate.indexOf("{");
    const lastBrace = candidate.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("Groq returned invalid JSON.");
  }
}

function normalizeAnalysis(candidate: unknown, base: MovieAnalysis, spoilers: boolean): MovieAnalysis {
  const record = candidate && typeof candidate === "object" ? (candidate as Record<string, unknown>) : {};
  const summary = toString(record.summary, base.summary);
  const spoilerSummary = toString(record.spoilerSummary, base.spoilerSummary || summary);
  const ending = toString(record.ending, base.ending);
  const spoilerEnding = toString(record.spoilerEnding, base.spoilerEnding || ending);
  const timeline = Array.isArray(record.timeline) ? record.timeline.map(toTimelineEvent).filter(Boolean) as TimelineEvent[] : base.timeline;
  const relationships = Array.isArray(record.relationships)
    ? record.relationships.map(toRelationshipEdge).filter(Boolean) as RelationshipEdge[]
    : base.relationships;
  const similar = Array.isArray(record.similar) ? record.similar.map(toSimilarMovie).filter(Boolean) as SimilarMovie[] : base.similar;

  return {
    summary,
    spoilerSummary,
    ending: spoilers ? spoilerEnding : ending,
    spoilerEnding,
    timeline,
    relationships,
    similar
  };
}

function buildPrompt(movie: MovieDetail, spoilers: boolean) {
  const baseAnalysis = JSON.stringify(movie.analysis, null, 2);
  return [
    "You are SceneAtlas, a premium movie analyst.",
    "Rewrite the provided baseline analysis into polished JSON only.",
    "Do not add markdown, headings, or commentary outside the JSON object.",
    "Keep the schema exactly: summary, spoilerSummary, ending, spoilerEnding, timeline, relationships, similar.",
    `Movie title: ${movie.title}`,
    `Year: ${movie.year}`,
    `Tagline: ${movie.tagline}`,
    `Overview: ${movie.overview}`,
    `Director: ${movie.director}`,
    `Writer: ${movie.writer}`,
    `Composer: ${movie.composer}`,
    `Cast: ${movie.cast.join(", ")}`,
    `Genres: ${movie.genres.join(", ")}`,
    `Language: ${movie.language || "Unknown"}`,
    `Spoilers are ${spoilers ? "allowed" : "off"}.`,
    "Rules:",
    "- summary and spoilerSummary must be concise, editorial, and reusable.",
    "- ending must be spoiler-safe when spoilers are off.",
    "- spoilerEnding may reveal the full ending explanation.",
    "- timeline must be chronological, discrete, and easy to render.",
    "- relationships must contain normalized source, target, and label fields.",
    "- similar should stay grounded in the existing baseline analysis when possible.",
    "Baseline analysis JSON:",
    baseAnalysis
  ].join("\n");
}

@Injectable()
export class GroqAnalysisProvider implements AnalysisProvider {
  async generate(movieId: string, spoilers: boolean) {
    const movie = getSceneAtlasMovie(movieId);
    if (!movie) {
      return fallbackAnalysis(movieId);
    }

    if (!apiEnv.groqApiKey) {
      return spoilers ? movie.analysis : redactEnding(movie.analysis);
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiEnv.groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: "You generate strict JSON for SceneAtlas movie analysis. Never output markdown or commentary."
          },
          {
            role: "user",
            content: buildPrompt(movie, spoilers)
          }
        ],
        temperature: 0.2,
        reasoning_effort: "low",
        max_completion_tokens: 1400,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq analysis request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as GroqChatCompletionResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Groq returned an empty analysis response.");
    }

    const parsed = parseJsonPayload(content);
    return normalizeAnalysis(parsed, movie.analysis, spoilers);
  }
}
