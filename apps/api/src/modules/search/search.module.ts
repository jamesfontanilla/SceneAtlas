import { Module } from "@nestjs/common";
import { DiscoverController } from "./discover.controller";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

@Module({
  controllers: [SearchController, DiscoverController],
  providers: [SearchService]
})
export class SearchModule {}
