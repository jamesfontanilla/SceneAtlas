import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET is required for SceneAtlas authentication.");
  }

  return secret;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function generateSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function generateVerificationCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function generateResetToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHmac("sha256", getAuthSecret()).update(token).digest("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derived = scryptSync(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${derived.toString("base64url")}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, encodedHash] = storedHash.split("$");
  if (scheme !== "scrypt" || !salt || !encodedHash) {
    return false;
  }

  const expected = Buffer.from(encodedHash, "base64url");
  const actual = scryptSync(password, salt, expected.length) as Buffer;
  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}
