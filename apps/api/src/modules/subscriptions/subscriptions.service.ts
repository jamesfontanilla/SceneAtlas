import { Injectable } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";

@Injectable()
export class SubscriptionsService {
  me(userId: string) {
    return sceneAtlasStore.getAccount(userId);
  }

  upgrade(userId: string) {
    sceneAtlasStore.promoteToPremium(userId, "billing");
    return sceneAtlasStore.getAccount(userId);
  }

  downgrade(userId: string) {
    sceneAtlasStore.demoteToFree(userId, "billing");
    return sceneAtlasStore.getAccount(userId);
  }
}
