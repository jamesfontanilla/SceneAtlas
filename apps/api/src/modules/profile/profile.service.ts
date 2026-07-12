import { Injectable } from "@nestjs/common";
import { SceneAtlasError, sceneAtlasStore } from "@sceneatlas/db";

function buildAnalysisHistory(userId: string) {
  return sceneAtlasStore
    .listAnalyticsEvents(100, ["analysis_request", "analysis_regenerate"])
    .filter((event) => event.userId === userId && event.payload && typeof event.payload.movieId === "string")
    .map((event) => ({
      movieId: String(event.payload?.movieId ?? ""),
      spoilers: Boolean(event.payload?.spoilers),
      eventName: event.eventName,
      createdAt: event.createdAt
    }));
}

function buildRecentActivity(userId: string) {
  return sceneAtlasStore.getRecentActivity(userId);
}

@Injectable()
export class ProfileService {
  me(userId: string) {
    const account = sceneAtlasStore.getAccount(userId);
    if (!account) {
      return null;
    }

    const state = sceneAtlasStore.readState();
    const analysisHistory = buildAnalysisHistory(userId);
    return {
      account,
      joinDate: account.createdAt ?? account.updatedAt ?? null,
      lastLoginAt: account.lastLoginAt ?? null,
      chatSessionCount: state.chatSessions.filter((session) => session.userId === userId).length,
      searchCount: sceneAtlasStore.listSearchEvents(userId).length,
      viewCount: sceneAtlasStore.listMovieViewEvents(userId).length,
      analysisCount: analysisHistory.length,
      recentActivity: buildRecentActivity(userId)
    };
  }

  update(userId: string, input: { displayName?: string; avatar?: string }) {
    const account = sceneAtlasStore.getAccount(userId);
    if (!account) {
      throw new SceneAtlasError("User not found.", "NOT_FOUND");
    }

    if (typeof input.displayName === "string" && input.displayName.trim()) {
      sceneAtlasStore.updateDisplayName(userId, input.displayName.trim());
    }

    if (typeof input.avatar === "string") {
      sceneAtlasStore.setAvatar(userId, input.avatar.trim() || undefined);
    }

    sceneAtlasStore.recordAnalyticsEvent("profile_update", {
      userId,
      payload: {
        displayName: input.displayName ?? null,
        avatar: input.avatar ?? null
      }
    });

    return this.me(userId);
  }

  history(userId: string) {
    return {
      views: sceneAtlasStore.listMovieViewEvents(userId, 50),
      analyses: buildAnalysisHistory(userId),
      recentActivity: buildRecentActivity(userId)
    };
  }

  chatSessions(userId: string) {
    return {
      sessions: sceneAtlasStore.listChatSessions(userId)
    };
  }

  searchHistory(userId: string) {
    return {
      searches: sceneAtlasStore.listSearchEvents(userId, 50)
    };
  }
}
