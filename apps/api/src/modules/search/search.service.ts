import { Injectable } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";

@Injectable()
export class SearchService {
  suggestions(query: string) {
    return {
      suggestions: sceneAtlasStore.getSearchSuggestions(query)
    };
  }

  trending() {
    return {
      queries: sceneAtlasStore.getTrendingQueries(),
      featuredMovies: sceneAtlasStore.getFeaturedMovies()
    };
  }

  featured() {
    return {
      featuredMovies: sceneAtlasStore.getFeaturedMovies()
    };
  }
}
