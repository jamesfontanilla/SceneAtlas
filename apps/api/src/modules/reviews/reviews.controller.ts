import { Body, Controller, Get, Headers, Param, Post, Query } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { ReviewsService } from "./reviews.service";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  list(@Query("movieId") movieId?: string) {
    return this.reviewsService.list(movieId);
  }

  @Post(":movieId")
  async upsert(
    @Param("movieId") movieId: string,
    @Body() body: { title: string; body: string; spoilerTag?: boolean },
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.reviewsService.upsert(await resolveSceneAtlasUserId(sessionToken, userId), movieId, body);
  }
}
