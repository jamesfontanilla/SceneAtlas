import { cookies } from "next/headers";
import { sceneAtlasStore } from "@sceneatlas/db";
import type { AccountSnapshot } from "@sceneatlas/shared";

export const SESSION_COOKIE = "sceneatlas-session";

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSessionUserId() {
  const token = await getSessionToken();
  if (!token) {
    return "anonymous";
  }

  const state = sceneAtlasStore.readState();
  return state.sessions.find((item) => item.token === token)?.userId ?? "anonymous";
}

export async function getCurrentAccount(): Promise<AccountSnapshot | null> {
  const token = await getSessionToken();
  return token ? sceneAtlasStore.getCurrentAccount(token) : null;
}
