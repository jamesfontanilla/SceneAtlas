import { Injectable } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";

@Injectable()
export class RatingsService {
  get(movieId: string, userId: string) {
    const state = sceneAtlasStore.readState();
    const ratings = state.ratings.filter((item) => item.movieId === movieId);
    const userRating = state.ratings.find((item) => item.movieId === movieId && item.userId === userId) ?? null;
    const average = sceneAtlasStore.getAverageRating(movieId);

    return {
      movieId,
      averageRating: average,
      ratingCount: ratings.length,
      userRating: userRating?.value ?? null
    };
  }

  upsert(userId: string, movieId: string, value: number) {
    const rating = sceneAtlasStore.upsertRating(userId, movieId, value);
    return {
      rating,
      stats: this.get(movieId, userId)
    };
  }
}
