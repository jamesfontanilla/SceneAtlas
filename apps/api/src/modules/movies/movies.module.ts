import { Module } from "@nestjs/common";
import { MoviesController } from "./movies.controller";
import { MoviesService } from "./movies.service";
import { MockMovieProvider } from "./providers/mock-movie.provider";
import { WikidataMovieProvider } from "./providers/wikidata-movie.provider";
import { UsageModule } from "../usage/usage.module";
import { movieSourceProviderFactory } from "./movies.service";

@Module({
  imports: [UsageModule],
  controllers: [MoviesController],
  providers: [MoviesService, MockMovieProvider, WikidataMovieProvider, movieSourceProviderFactory]
})
export class MoviesModule {}
