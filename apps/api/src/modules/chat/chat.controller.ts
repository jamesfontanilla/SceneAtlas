import { Body, Controller, Delete, Get, Headers, Param, Post, Query } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { ChatService } from "./chat.service";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("sessions")
  async sessions(
    @Query("movieId") movieId?: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolved = await resolveSceneAtlasUserId(sessionToken, userId);
    return this.chatService.listSessions(resolved, movieId?.trim() || undefined);
  }

  @Post("sessions")
  async create(
    @Body() body: { movieId: string; spoilers?: boolean } = { movieId: "" },
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolved = await resolveSceneAtlasUserId(sessionToken, userId);
    return this.chatService.createSession(resolved, body.movieId, body.spoilers ?? false);
  }

  @Get("sessions/:sessionId")
  async getSession(
    @Param("sessionId") sessionId: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolved = await resolveSceneAtlasUserId(sessionToken, userId);
    return this.chatService.getSession(sessionId, resolved);
  }

  @Post("sessions/:sessionId/messages")
  async sendMessage(
    @Param("sessionId") sessionId: string,
    @Body() body: { content: string } = { content: "" },
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolved = await resolveSceneAtlasUserId(sessionToken, userId);
    return this.chatService.sendMessage(sessionId, resolved, body.content);
  }

  @Post("sessions/:sessionId/summary")
  async summary(
    @Param("sessionId") sessionId: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolved = await resolveSceneAtlasUserId(sessionToken, userId);
    return this.chatService.summarizeSession(sessionId, resolved);
  }

  @Delete("sessions/:sessionId")
  async archive(
    @Param("sessionId") sessionId: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolved = await resolveSceneAtlasUserId(sessionToken, userId);
    return this.chatService.archiveSession(sessionId, resolved);
  }
}
