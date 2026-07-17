import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

function deriveKey(password: string, salt: string): Buffer {
  return scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = deriveKey(password, salt);
  return `${salt}:${key.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, keyHex] = stored.split(":");
  if (!salt || !keyHex) return false;
  const key = Buffer.from(keyHex, "hex");
  const derived = deriveKey(password, salt);
  if (key.length !== derived.length) return false;
  return timingSafeEqual(key, derived);
}
