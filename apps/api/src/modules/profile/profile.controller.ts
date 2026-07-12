import { Body, Controller, Get, Headers, Patch } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { ProfileService } from "./profile.service";

@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get("me")
  async me(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    const resolved = await resolveSceneAtlasUserId(sessionToken, userId);
    if (resolved === "anonymous") {
      return null;
    }

    return this.profileService.me(resolved);
  }

  @Patch("me")
  async update(
    @Body() body: { displayName?: string; avatar?: string } = {},
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolved = await resolveSceneAtlasUserId(sessionToken, userId);
    if (resolved === "anonymous") {
      return null;
    }

    return this.profileService.update(resolved, body);
  }

  @Get("me/history")
  async history(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    const resolved = await resolveSceneAtlasUserId(sessionToken, userId);
    if (resolved === "anonymous") {
      return {
        views: [],
        analyses: [],
        recentActivity: []
      };
    }

    return this.profileService.history(resolved);
  }

  @Get("me/chat-sessions")
  async chatSessions(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    const resolved = await resolveSceneAtlasUserId(sessionToken, userId);
    if (resolved === "anonymous") {
      return {
        sessions: []
      };
    }

    return this.profileService.chatSessions(resolved);
  }

  @Get("me/search-history")
  async searchHistory(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    const resolved = await resolveSceneAtlasUserId(sessionToken, userId);
    if (resolved === "anonymous") {
      return {
        searches: []
      };
    }

    return this.profileService.searchHistory(resolved);
  }
}
