import { Controller, Get, Query } from "@nestjs/common";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get("suggestions")
  suggestions(@Query("q") query = "") {
    return this.searchService.suggestions(query);
  }

  @Get("trending")
  trending() {
    return this.searchService.trending();
  }
}
