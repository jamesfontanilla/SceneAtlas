import { Injectable } from "@nestjs/common";
import { SceneAtlasError } from "@sceneatlas/db";
import { getSceneAtlasMovie } from "@sceneatlas/shared";
import { apiEnv } from "../../../config/env";

const GROQ_MODEL = "openai/gpt-oss-120b";

export interface ChatPromptMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatReplyInput {
  movieId: string;
  spoilerEnabled: boolean;
  summary?: string;
  messages: ChatPromptMessage[];
}

function buildMovieContext(movieId: string, spoilerEnabled: boolean, summary?: string) {
  const movie = getSceneAtlasMovie(movieId);
  if (!movie) {
    throw new SceneAtlasError("Movie not found.", "NOT_FOUND");
  }

  return [
    `Movie title: ${movie.title}`,
    `Year: ${movie.year}`,
    `Tagline: ${movie.tagline}`,
    `Overview: ${movie.overview}`,
    `Director: ${movie.director}`,
    `Writer: ${movie.writer}`,
    `Cast: ${movie.cast.join(", ")}`,
    `Genres: ${movie.genres.join(", ")}`,
    `Spoilers are ${spoilerEnabled ? "allowed" : "off"}.`,
    summary ? `Conversation summary so far: ${summary}` : "Conversation summary so far: none."
  ].join("\n");
}

@Injectable()
export class GroqChatProvider {
  async reply(input: ChatReplyInput) {
    if (!apiEnv.groqApiKey) {
      throw new SceneAtlasError("Groq chat provider is unavailable because GROQ_API_KEY is missing.", "STATE_ERROR");
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
            content:
              "You are SceneAtlas, a movie-specific research assistant. Answer only about the selected movie, stay concise, and do not reveal spoiler details unless spoilers are enabled."
          },
          {
            role: "user",
            content: buildMovieContext(input.movieId, input.spoilerEnabled, input.summary)
          },
          ...input.messages
        ],
        temperature: 0.25,
        max_completion_tokens: 400
      })
    });

    if (!response.ok) {
      throw new Error(`Groq chat request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
        };
      }>;
    };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Groq returned an empty chat response.");
    }

    return { content };
  }

  async summarize(input: ChatReplyInput) {
    if (!apiEnv.groqApiKey) {
      throw new SceneAtlasError("Groq chat provider is unavailable because GROQ_API_KEY is missing.", "STATE_ERROR");
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
            content: "You write short, factual summaries of movie conversations for SceneAtlas."
          },
          {
            role: "user",
            content: [
              buildMovieContext(input.movieId, input.spoilerEnabled, input.summary),
              "",
              "Summarize the discussion in two sentences or fewer. Focus on the user's questions and the key movie points."
            ].join("\n")
          },
          ...input.messages
        ],
        temperature: 0.2,
        max_completion_tokens: 180
      })
    });

    if (!response.ok) {
      throw new Error(`Groq summary request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
        };
      }>;
    };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Groq returned an empty summary response.");
    }

    return { content };
  }
}
