import { Controller, Get, Headers, Param, Query } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { UsageService } from "../usage/usage.service";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";

@Controller("movies")
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly usageService: UsageService
  ) {}

  @Get()
  async search(
    @Query("query") query = "",
    @Query("year") year?: string,
    @Query("genre") genre?: string,
    @Query("language") language?: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolved = resolveSceneAtlasUserId(sessionToken, userId);
    this.usageService.consumeSearch(resolved);
    return this.moviesService.search(query, {
      year: year ? Number(year) : undefined,
      genre: genre?.trim() || undefined,
      language: language?.trim() || undefined
    });
  }

  @Get(":movieId")
  getMovie(@Param("movieId") movieId: string) {
    return this.moviesService.findBySlug(movieId);
  }
}
