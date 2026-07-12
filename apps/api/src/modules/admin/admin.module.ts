import { Module } from "@nestjs/common";
import { AnalysisModule } from "../analysis/analysis.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [AnalysisModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
