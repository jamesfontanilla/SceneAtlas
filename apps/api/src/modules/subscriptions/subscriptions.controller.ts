import { Controller, Get, Headers, Post } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { SubscriptionsService } from "./subscriptions.service";

@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get("me")
  me(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    return this.subscriptionsService.me(resolveSceneAtlasUserId(sessionToken, userId));
  }

  @Post("upgrade")
  upgrade(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    return this.subscriptionsService.upgrade(resolveSceneAtlasUserId(sessionToken, userId));
  }

  @Post("downgrade")
  downgrade(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    return this.subscriptionsService.downgrade(resolveSceneAtlasUserId(sessionToken, userId));
  }
}
