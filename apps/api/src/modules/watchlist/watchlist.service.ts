import { Injectable } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";

@Injectable()
export class WatchlistService {
  list(userId: string) {
    return sceneAtlasStore.listWatchlist(userId);
  }

  add(userId: string, movieId: string) {
    const movie = sceneAtlasStore.addToWatchlist(userId, movieId);
    sceneAtlasStore.recordAnalyticsEvent("watchlist_save", {
      userId,
      payload: {
        movieId
      }
    });
    return {
      onWatchlist: true,
      movie,
      items: sceneAtlasStore.listWatchlist(userId)
    };
  }

  remove(userId: string, movieId: string) {
    sceneAtlasStore.removeFromWatchlist(userId, movieId);
    sceneAtlasStore.recordAnalyticsEvent("watchlist_remove", {
      userId,
      payload: {
        movieId
      }
    });
    return {
      onWatchlist: false,
      items: sceneAtlasStore.listWatchlist(userId)
    };
  }

  toggle(userId: string, movieId: string) {
    if (sceneAtlasStore.isOnWatchlist(userId, movieId)) {
      return this.remove(userId, movieId);
    }

    return this.add(userId, movieId);
  }
}
