import { Body, Controller, Delete, Get, Headers, Param, Post } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { CollectionsService } from "./collections.service";

@Controller("collections")
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  list(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    return this.collectionsService.list(resolveSceneAtlasUserId(sessionToken, userId));
  }

  @Get(":collectionId")
  get(@Param("collectionId") collectionId: string) {
    return this.collectionsService.get(collectionId);
  }

  @Post()
  create(
    @Body() body: { name: string; description?: string; visibility?: "private" | "shared" },
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.collectionsService.create(resolveSceneAtlasUserId(sessionToken, userId), body);
  }

  @Post(":collectionId/movies/:movieId")
  addMovie(
    @Param("collectionId") collectionId: string,
    @Param("movieId") movieId: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.collectionsService.addMovie(resolveSceneAtlasUserId(sessionToken, userId), collectionId, movieId);
  }

  @Delete(":collectionId/movies/:movieId")
  removeMovie(
    @Param("collectionId") collectionId: string,
    @Param("movieId") movieId: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.collectionsService.removeMovie(resolveSceneAtlasUserId(sessionToken, userId), collectionId, movieId);
  }
}
