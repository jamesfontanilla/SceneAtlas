import { prisma, SceneAtlasError } from "@sceneatlas/db";
import { apiEnv } from "../config/env";
import { resolveSceneAtlasUserId } from "./sceneatlas-request";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getAdminEmailSet() {
  return new Set(
    apiEnv.adminEmails
      .split(",")
      .map((email) => normalizeEmail(email))
      .filter(Boolean)
  );
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return getAdminEmailSet().has(normalizeEmail(email));
}

export async function resolveSceneAtlasAdminUserId(sessionToken?: string | null, fallbackUserId = "anonymous") {
  const userId = await resolveSceneAtlasUserId(sessionToken, fallbackUserId);
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      email: true
    }
  });

  if (!user || !isAdminEmail(user.email)) {
    throw new SceneAtlasError("Admin access required.", "FORBIDDEN");
  }

  return userId;
}
