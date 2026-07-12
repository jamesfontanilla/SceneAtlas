import { Injectable } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";
import { isAdminEmail } from "../../common/admin";

@Injectable()
export class SubscriptionsService {
  me(userId: string) {
    const account = sceneAtlasStore.getAccount(userId);
    return account ? { ...account, isAdmin: isAdminEmail(account.email) } : null;
  }

  upgrade(userId: string) {
    sceneAtlasStore.promoteToPremium(userId, "billing");
    sceneAtlasStore.recordAnalyticsEvent("upgrade_click", {
      userId,
      payload: {
        source: "billing"
      }
    });
    const account = sceneAtlasStore.getAccount(userId);
    return account ? { ...account, isAdmin: isAdminEmail(account.email) } : null;
  }

  downgrade(userId: string) {
    sceneAtlasStore.demoteToFree(userId, "billing");
    sceneAtlasStore.recordAnalyticsEvent("downgrade_click", {
      userId,
      payload: {
        source: "billing"
      }
    });
    const account = sceneAtlasStore.getAccount(userId);
    return account ? { ...account, isAdmin: isAdminEmail(account.email) } : null;
  }
}
