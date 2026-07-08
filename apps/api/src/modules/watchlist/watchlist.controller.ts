import { Controller, Delete, Get, Headers, Param, Post } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { WatchlistService } from "./watchlist.service";

@Controller("watchlist")
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  list(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    return this.watchlistService.list(resolveSceneAtlasUserId(sessionToken, userId));
  }

  @Post(":movieId")
  add(
    @Param("movieId") movieId: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.watchlistService.add(resolveSceneAtlasUserId(sessionToken, userId), movieId);
  }

  @Delete(":movieId")
  remove(
    @Param("movieId") movieId: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.watchlistService.remove(resolveSceneAtlasUserId(sessionToken, userId), movieId);
  }
}
