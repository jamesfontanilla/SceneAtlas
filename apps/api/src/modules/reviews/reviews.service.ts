import { Injectable } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";

@Injectable()
export class ReviewsService {
  list(movieId?: string) {
    return sceneAtlasStore.listReviews(movieId);
  }

  upsert(userId: string, movieId: string, input: { title: string; body: string; spoilerTag?: boolean }) {
    return sceneAtlasStore.upsertReview(userId, movieId, input);
  }
}
