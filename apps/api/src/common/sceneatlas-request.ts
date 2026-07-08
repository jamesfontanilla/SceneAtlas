import { sceneAtlasStore } from "@sceneatlas/db";

export function resolveSceneAtlasUserId(sessionToken?: string | null, fallbackUserId = "anonymous") {
  if (!sessionToken) {
    return fallbackUserId;
  }

  return sceneAtlasStore.resolveSession(sessionToken)?.user?.id ?? fallbackUserId;
}
