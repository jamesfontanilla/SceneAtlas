import { Controller, Get, Headers, Post } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { SubscriptionsService } from "./subscriptions.service";

@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get("me")
  async me(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    return this.subscriptionsService.me(await resolveSceneAtlasUserId(sessionToken, userId));
  }

  @Post("upgrade")
  async upgrade(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    return this.subscriptionsService.upgrade(await resolveSceneAtlasUserId(sessionToken, userId));
  }

  @Post("downgrade")
  async downgrade(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    return this.subscriptionsService.downgrade(await resolveSceneAtlasUserId(sessionToken, userId));
  }
}
