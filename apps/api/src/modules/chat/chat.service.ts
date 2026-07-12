import { Injectable } from "@nestjs/common";
import { getSceneAtlasMovie, type MovieDetail } from "@sceneatlas/shared";
import { SceneAtlasError, sceneAtlasStore } from "@sceneatlas/db";
import { UsageService } from "../usage/usage.service";
import { GroqChatProvider, type ChatPromptMessage } from "./providers/groq-chat.provider";

const CHAT_MODEL = "openai/gpt-oss-120b";
const CHAT_PROVIDER = "groq";
const CHAT_MESSAGE_WINDOW = 8;
const CHAT_SUMMARY_TRIGGER = 10;

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 0.75));
}

function resolveMovie(movieId: string): MovieDetail {
  const movie = sceneAtlasStore.getMovie(movieId) ?? getSceneAtlasMovie(movieId);
  if (!movie) {
    throw new SceneAtlasError("Movie not found.", "NOT_FOUND");
  }

  return movie;
}

function fallbackReply(movie: MovieDetail, question: string, spoilers: boolean) {
  const base = spoilers ? movie.analysis.spoilerSummary : movie.analysis.summary;
  const ending = spoilers ? movie.analysis.spoilerEnding : "Enable spoilers if you want a deeper ending explanation.";
  return [
    `${movie.title}: ${base}`,
    `You asked: ${question}`,
    ending
  ].join(" ");
}

function fallbackSummary(movie: MovieDetail, messages: Array<{ role: string; content: string }>) {
  const recentQuestions = messages
    .filter((message) => message.role === "user")
    .slice(-3)
    .map((message) => message.content)
    .join(" | ");

  return `${movie.title} chat summary: the discussion has focused on ${recentQuestions || "the movie's themes, plot, and characters"}.`;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly usageService: UsageService,
    private readonly chatProvider: GroqChatProvider
  ) {}

  listSessions(userId: string, movieId?: string) {
    return {
      sessions: sceneAtlasStore.listChatSessions(userId, movieId)
    };
  }

  async createSession(userId: string, movieId: string, spoilers = false) {
    const promptVersion = sceneAtlasStore.getPromptVersion(CHAT_PROVIDER, CHAT_MODEL);
    const session = sceneAtlasStore.createChatSession(userId, movieId, {
      spoilerEnabled: spoilers,
      provider: CHAT_PROVIDER,
      model: CHAT_MODEL,
      promptVersion: promptVersion.versionKey
    });

    return {
      session,
      messages: sceneAtlasStore.getChatMessages(session.id)
    };
  }

  async getSession(sessionId: string, userId: string) {
    const session = sceneAtlasStore.getChatSession(sessionId);
    if (!session) {
      throw new SceneAtlasError("Chat session not found.", "NOT_FOUND");
    }

    if (session.userId !== userId) {
      throw new SceneAtlasError("Chat session not found.", "FORBIDDEN");
    }

    return {
      session,
      messages: sceneAtlasStore.getChatMessages(session.id)
    };
  }

  async sendMessage(sessionId: string, userId: string, content: string) {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      throw new SceneAtlasError("Chat message is required.", "VALIDATION");
    }

    const session = sceneAtlasStore.getChatSession(sessionId);
    if (!session) {
      throw new SceneAtlasError("Chat session not found.", "NOT_FOUND");
    }

    if (session.userId !== userId) {
      throw new SceneAtlasError("Chat session not found.", "FORBIDDEN");
    }

    const movie = resolveMovie(session.movieId);
    this.usageService.consumeChat(userId);

    const userMessage = sceneAtlasStore.appendChatMessage(session.id, {
      role: "user",
      content: trimmedContent,
      inputTokens: estimateTokens(trimmedContent)
    });

    sceneAtlasStore.recordAnalyticsEvent("chat_message", {
      userId,
      sessionId: session.id,
      payload: {
        movieId: session.movieId,
        role: "user"
      }
    });

    const messages = sceneAtlasStore
      .getChatMessages(session.id)
      .slice(-CHAT_MESSAGE_WINDOW)
      .map<ChatPromptMessage>((message) => ({
        role: message.role,
        content: message.content
      }));

    let assistantContent: string;
    try {
      const response = await this.chatProvider.reply({
        movieId: session.movieId,
        spoilerEnabled: session.spoilerEnabled,
        summary: session.summary,
        messages
      });
      assistantContent = response.content;
    } catch (error) {
      sceneAtlasStore.recordAudit("chat_provider_failure", "Chat provider failed", {
        movieId: session.movieId,
        sessionId: session.id,
        error: error instanceof Error ? error.message : String(error)
      });
      assistantContent = fallbackReply(movie, trimmedContent, session.spoilerEnabled);
    }

    const assistantMessage = sceneAtlasStore.appendChatMessage(session.id, {
      role: "assistant",
      content: assistantContent,
      outputTokens: estimateTokens(assistantContent)
    });

    sceneAtlasStore.recordAnalyticsEvent("chat_message", {
      userId,
      sessionId: session.id,
      payload: {
        movieId: session.movieId,
        role: "assistant"
      }
    });

    const updatedMessages = sceneAtlasStore.getChatMessages(session.id);
    if (!session.summary || updatedMessages.length >= CHAT_SUMMARY_TRIGGER) {
      try {
        const summary = await this.chatProvider.summarize({
          movieId: session.movieId,
          spoilerEnabled: session.spoilerEnabled,
          summary: session.summary,
          messages: updatedMessages.slice(-CHAT_MESSAGE_WINDOW).map<ChatPromptMessage>((message) => ({
            role: message.role,
            content: message.content
          }))
        });
        sceneAtlasStore.updateChatSessionSummary(session.id, summary.content);
        sceneAtlasStore.recordAnalyticsEvent("chat_summary", {
          userId,
          sessionId: session.id,
          payload: {
            movieId: session.movieId
          }
        });
      } catch (error) {
        sceneAtlasStore.recordAudit("chat_provider_failure", "Chat summary generation failed", {
          movieId: session.movieId,
          sessionId: session.id,
          error: error instanceof Error ? error.message : String(error)
        });
        sceneAtlasStore.updateChatSessionSummary(session.id, fallbackSummary(movie, updatedMessages));
      }
    }

    return {
      session: sceneAtlasStore.getChatSession(session.id),
      messages: sceneAtlasStore.getChatMessages(session.id),
      reply: assistantMessage,
      userMessage
    };
  }

  async summarizeSession(sessionId: string, userId: string) {
    const session = sceneAtlasStore.getChatSession(sessionId);
    if (!session) {
      throw new SceneAtlasError("Chat session not found.", "NOT_FOUND");
    }

    if (session.userId !== userId) {
      throw new SceneAtlasError("Chat session not found.", "FORBIDDEN");
    }

    const movie = resolveMovie(session.movieId);
    const messages = sceneAtlasStore.getChatMessages(session.id);

    try {
      const summary = await this.chatProvider.summarize({
        movieId: session.movieId,
        spoilerEnabled: session.spoilerEnabled,
        summary: session.summary,
        messages: messages.slice(-CHAT_MESSAGE_WINDOW).map<ChatPromptMessage>((message) => ({
          role: message.role,
          content: message.content
        }))
      });
      const updated = sceneAtlasStore.updateChatSessionSummary(session.id, summary.content);
      sceneAtlasStore.recordAnalyticsEvent("chat_summary", {
        userId,
        sessionId: session.id,
        payload: {
          movieId: session.movieId
        }
      });
      return {
        session: updated,
        messages
      };
    } catch (error) {
      sceneAtlasStore.recordAudit("chat_provider_failure", "Chat summary generation failed", {
        movieId: session.movieId,
        sessionId: session.id,
        error: error instanceof Error ? error.message : String(error)
      });
      const updated = sceneAtlasStore.updateChatSessionSummary(session.id, fallbackSummary(movie, messages));
      return {
        session: updated,
        messages
      };
    }
  }

  async archiveSession(sessionId: string, userId: string) {
    const session = sceneAtlasStore.getChatSession(sessionId);
    if (!session) {
      throw new SceneAtlasError("Chat session not found.", "NOT_FOUND");
    }

    if (session.userId !== userId) {
      throw new SceneAtlasError("Chat session not found.", "FORBIDDEN");
    }

    const archived = sceneAtlasStore.archiveChatSession(sessionId);
    sceneAtlasStore.recordAnalyticsEvent("chat_archive", {
      userId,
      sessionId,
      payload: {
        movieId: archived.movieId
      }
    });
    return archived;
  }
}
