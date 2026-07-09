import { Controller, Get, Headers } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { UsageService } from "./usage.service";

@Controller("usage")
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get("summary")
  async getSummary(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    return this.usageService.getSnapshot(await resolveSceneAtlasUserId(sessionToken, userId));
  }
}
