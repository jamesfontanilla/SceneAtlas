import { Module } from "@nestjs/common";
import { AnalysisController } from "./analysis.controller";
import { AnalysisService } from "./analysis.service";
import { MockAnalysisProvider } from "./providers/mock-analysis.provider";
import { OpenAiAnalysisProvider } from "./providers/openai-analysis.provider";
import { UsageModule } from "../usage/usage.module";
import { analysisProviderFactory } from "./analysis.service";

@Module({
  imports: [UsageModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, MockAnalysisProvider, OpenAiAnalysisProvider, analysisProviderFactory]
})
export class AnalysisModule {}
