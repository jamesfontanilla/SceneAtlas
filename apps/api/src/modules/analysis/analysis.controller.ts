import { Controller, Get, Headers, Param, Query } from "@nestjs/common";
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
    const resolved = resolveSceneAtlasUserId(sessionToken, userId);
    this.usageService.consumeAnalysis(resolved);
    return this.analysisService.getAnalysis(movieId, spoilers === "1" || spoilers === "true");
  }
}
