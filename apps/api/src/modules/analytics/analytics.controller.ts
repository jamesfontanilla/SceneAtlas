import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { resolveSceneAtlasAdminUserId } from "../../common/admin";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post("events")
  async events(
    @Body() body: { eventName: string; sessionId?: string; payload?: Record<string, unknown> } = { eventName: "event" },
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolvedUserId = await resolveSceneAtlasUserId(sessionToken, userId);
    return this.analyticsService.recordEvent({
      eventName: body.eventName,
      userId: resolvedUserId === "anonymous" ? undefined : resolvedUserId,
      sessionId: body.sessionId,
      payload: body.payload
    });
  }

  @Post("impression")
  async impression(
    @Body() body: { sessionId?: string; payload?: Record<string, unknown> } = {},
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolvedUserId = await resolveSceneAtlasUserId(sessionToken, userId);
    return this.analyticsService.recordImpression({
      userId: resolvedUserId === "anonymous" ? undefined : resolvedUserId,
      sessionId: body.sessionId,
      payload: body.payload
    });
  }

  @Get("summary")
  async summary(
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    await resolveSceneAtlasAdminUserId(sessionToken, userId);
    return this.analyticsService.summary();
  }
}
