import { Body, Controller, Get, Headers, Post, Query } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { ExportsService } from "./exports.service";

@Controller("exports")
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Post()
  async create(
    @Body() body: { movieId?: string; format?: "json" | "markdown" },
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.exportsService.create(await resolveSceneAtlasUserId(sessionToken, userId), body);
  }

  @Get("latest")
  async latest(
    @Query("movieId") movieId?: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.exportsService.latest(await resolveSceneAtlasUserId(sessionToken, userId), movieId);
  }
}
