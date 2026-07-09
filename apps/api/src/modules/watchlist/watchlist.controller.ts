import { Controller, Delete, Get, Headers, Param, Post } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { WatchlistService } from "./watchlist.service";

@Controller("watchlist")
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  async list(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    return this.watchlistService.list(await resolveSceneAtlasUserId(sessionToken, userId));
  }

  @Post(":movieId")
  async add(
    @Param("movieId") movieId: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.watchlistService.add(await resolveSceneAtlasUserId(sessionToken, userId), movieId);
  }

  @Delete(":movieId")
  async remove(
    @Param("movieId") movieId: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.watchlistService.remove(await resolveSceneAtlasUserId(sessionToken, userId), movieId);
  }
}
