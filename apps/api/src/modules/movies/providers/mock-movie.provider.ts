import { Injectable } from "@nestjs/common";
import { getSceneAtlasMovie, sceneAtlasMovies, searchSceneAtlasMovies } from "@sceneatlas/shared";
import type { MovieBrief, MovieDetail } from "@sceneatlas/shared";
import type { MovieSourceProvider } from "./movie-source.provider";

function toBrief(movie: MovieDetail): MovieBrief {
  return {
    slug: movie.slug,
    title: movie.title,
    year: movie.year,
    releaseDate: movie.releaseDate,
    runtimeMinutes: movie.runtimeMinutes,
    rating: movie.rating,
    genres: movie.genres,
    tagline: movie.tagline,
    overview: movie.overview,
    posterPalette: movie.posterPalette,
    backdropUrl: movie.backdropUrl,
    language: movie.language,
    wikidataId: movie.wikidataId,
    commonsCategory: movie.commonsCategory
  };
}

@Injectable()
export class MockMovieProvider implements MovieSourceProvider {
  async search(query: string) {
    return searchSceneAtlasMovies(query).map(toBrief);
  }

  async findBySlug(slug: string) {
    return getSceneAtlasMovie(slug);
  }
}
