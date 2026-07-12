import { Injectable } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";

@Injectable()
export class CollectionsService {
  list(userId: string) {
    return sceneAtlasStore.listCollections(userId);
  }

  get(collectionId: string) {
    const collection = sceneAtlasStore.getCollection(collectionId);
    if (!collection) {
      return null;
    }

    return {
      collection,
      movies: sceneAtlasStore.getCollectionMovies(collectionId)
    };
  }

  create(userId: string, input: { name: string; description?: string; visibility?: "private" | "shared" }) {
    const collection = sceneAtlasStore.createCollection(userId, input);
    sceneAtlasStore.recordAnalyticsEvent("collection_create", {
      userId,
      payload: {
        collectionId: collection.id,
        name: collection.name
      }
    });
    return collection;
  }

  addMovie(userId: string, collectionId: string, movieId: string) {
    const collection = sceneAtlasStore.addMovieToCollection(userId, collectionId, movieId);
    sceneAtlasStore.recordAnalyticsEvent("collection_add_movie", {
      userId,
      payload: {
        collectionId,
        movieId
      }
    });
    return collection;
  }

  removeMovie(userId: string, collectionId: string, movieId: string) {
    const removed = sceneAtlasStore.removeMovieFromCollection(userId, collectionId, movieId);
    sceneAtlasStore.recordAnalyticsEvent("collection_remove_movie", {
      userId,
      payload: {
        collectionId,
        movieId
      }
    });
    return removed;
  }
}
