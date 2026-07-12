import { Injectable } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";

@Injectable()
export class AnalyticsService {
  recordEvent(input: { eventName: string; userId?: string; sessionId?: string; payload?: Record<string, unknown> }) {
    return sceneAtlasStore.recordAnalyticsEvent(input.eventName, {
      userId: input.userId,
      sessionId: input.sessionId,
      payload: input.payload
    });
  }

  recordImpression(input: { userId?: string; sessionId?: string; payload?: Record<string, unknown> }) {
    return this.recordEvent({
      eventName: "ad_impression",
      userId: input.userId,
      sessionId: input.sessionId,
      payload: input.payload
    });
  }

  summary() {
    return sceneAtlasStore.getAnalyticsSummary();
  }
}
