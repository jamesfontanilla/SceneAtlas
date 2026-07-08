import { Controller, Get, Headers } from "@nestjs/common";
import { UsageService } from "./usage.service";

@Controller("usage")
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get("summary")
  getSummary(@Headers("x-sceneatlas-user-id") userId = "anonymous") {
    return this.usageService.getSnapshot(userId);
  }
}
