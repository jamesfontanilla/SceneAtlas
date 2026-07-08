import { Body, Controller, Get, Headers, Param, Put } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { RatingsService } from "./ratings.service";

@Controller("ratings")
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get(":movieId")
  get(
    @Param("movieId") movieId: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.ratingsService.get(movieId, resolveSceneAtlasUserId(sessionToken, userId));
  }

  @Put(":movieId")
  upsert(
    @Param("movieId") movieId: string,
    @Body() body: { value: number },
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.ratingsService.upsert(resolveSceneAtlasUserId(sessionToken, userId), movieId, Number(body.value));
  }
}
