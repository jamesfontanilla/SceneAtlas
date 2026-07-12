import { Injectable } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";
import type { UsageSnapshot } from "@sceneatlas/shared";

@Injectable()
export class UsageService {
  getSnapshot(userKey: string): UsageSnapshot {
    return sceneAtlasStore.getUsageSnapshot(userKey);
  }

  consumeSearch(userKey: string) {
    return sceneAtlasStore.consumeUsage(userKey, "SEARCH");
  }

  consumeAnalysis(userKey: string) {
    return sceneAtlasStore.consumeUsage(userKey, "ANALYSIS");
  }

  consumeChat(userKey: string) {
    return sceneAtlasStore.consumeUsage(userKey, "CHAT");
  }

  markPremium(userKey: string) {
    sceneAtlasStore.promoteToPremium(userKey);
  }
}
