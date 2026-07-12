import { Controller, Delete, Get, Headers, Param, Post, Query } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";
import { AnalysisService } from "./analysis.service";
import { UsageService } from "../usage/usage.service";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";

@Controller("analysis")
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly usageService: UsageService
  ) {}

  @Get(":movieId")
  async getAnalysis(
    @Param("movieId") movieId: string,
    @Query("spoilers") spoilers = "0",
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolved = await resolveSceneAtlasUserId(sessionToken, userId);
    this.usageService.consumeAnalysis(resolved);
    sceneAtlasStore.recordMovieViewEvent(resolved, movieId, spoilers === "1" || spoilers === "true");
    return this.analysisService.getAnalysis(movieId, spoilers === "1" || spoilers === "true", resolved);
  }

  @Post(":movieId/regenerate")
  async regenerate(
    @Param("movieId") movieId: string,
    @Query("spoilers") spoilers = "0",
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolved = await resolveSceneAtlasUserId(sessionToken, userId);
    return this.analysisService.regenerate(movieId, spoilers === "1" || spoilers === "true", resolved);
  }

  @Delete(":movieId/cache")
  async clearCache(
    @Param("movieId") movieId: string,
    @Query("spoilers") spoilers?: string
  ) {
    return this.analysisService.clearCache(movieId, typeof spoilers === "string" ? spoilers === "1" || spoilers === "true" : undefined);
  }
}
