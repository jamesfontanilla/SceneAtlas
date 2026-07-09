import { Body, Controller, Delete, Get, Headers, Param, Post } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { CollectionsService } from "./collections.service";

@Controller("collections")
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  async list(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    return this.collectionsService.list(await resolveSceneAtlasUserId(sessionToken, userId));
  }

  @Get(":collectionId")
  get(@Param("collectionId") collectionId: string) {
    return this.collectionsService.get(collectionId);
  }

  @Post()
  async create(
    @Body() body: { name: string; description?: string; visibility?: "private" | "shared" },
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.collectionsService.create(await resolveSceneAtlasUserId(sessionToken, userId), body);
  }

  @Post(":collectionId/movies/:movieId")
  async addMovie(
    @Param("collectionId") collectionId: string,
    @Param("movieId") movieId: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.collectionsService.addMovie(await resolveSceneAtlasUserId(sessionToken, userId), collectionId, movieId);
  }

  @Delete(":collectionId/movies/:movieId")
  async removeMovie(
    @Param("collectionId") collectionId: string,
    @Param("movieId") movieId: string,
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    return this.collectionsService.removeMovie(await resolveSceneAtlasUserId(sessionToken, userId), collectionId, movieId);
  }
}
