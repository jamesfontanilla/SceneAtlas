import { hashToken, prisma } from "@sceneatlas/db";

export async function resolveSceneAtlasUserId(sessionToken?: string | null, fallbackUserId = "anonymous") {
  if (!sessionToken) {
    return fallbackUserId;
  }

  const session = await prisma.authSession.findFirst({
    where: {
      tokenHash: hashToken(sessionToken),
      revokedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    select: {
      userId: true
    }
  });

  return session?.userId ?? fallbackUserId;
}
