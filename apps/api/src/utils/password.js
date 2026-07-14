import crypto from "node:crypto";

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, hash] = (storedHash || "").split(":");
  if (!salt || !hash) return false;

  const derived = crypto.scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  if (derived.length !== stored.length) return false;

  return crypto.timingSafeEqual(derived, stored);
}
