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
    return sceneAtlasStore.createCollection(userId, input);
  }

  addMovie(userId: string, collectionId: string, movieId: string) {
    return sceneAtlasStore.addMovieToCollection(userId, collectionId, movieId);
  }

  removeMovie(userId: string, collectionId: string, movieId: string) {
    return sceneAtlasStore.removeMovieFromCollection(userId, collectionId, movieId);
  }
}
