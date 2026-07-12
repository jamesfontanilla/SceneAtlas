import { Controller, Get } from "@nestjs/common";
import { SearchService } from "./search.service";

@Controller("discover")
export class DiscoverController {
  constructor(private readonly searchService: SearchService) {}

  @Get("featured")
  featured() {
    return this.searchService.featured();
  }
}
