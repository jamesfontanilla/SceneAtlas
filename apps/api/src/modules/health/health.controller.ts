import { Controller, Get } from "@nestjs/common";
import { apiEnv } from "../../config/env";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      ok: true,
      app: "SceneAtlas API",
      provider: apiEnv.movieDataProvider,
      analysisProvider: apiEnv.analysisProvider,
      timestamp: new Date().toISOString()
    };
  }
}
