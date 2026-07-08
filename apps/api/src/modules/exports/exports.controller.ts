import { Body, Controller, Get, Headers, Post, Query } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { ExportsService } from "./exports.service";

@Controller("exports")
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Post()
  create(
    @Body() body: { movieId?: string; format?: "json" | "markdown" },
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.exportsService.create(resolveSceneAtlasUserId(sessionToken, userId), body);
  }

  @Get("latest")
  latest(
    @Query("movieId") movieId?: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.exportsService.latest(resolveSceneAtlasUserId(sessionToken, userId), movieId);
  }
}
