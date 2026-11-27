import "server-only";
import { randomBytes } from "node:crypto";

/** 24 random bytes -> 32-char base64url token (192 bits of entropy). */
export function generateShareToken(): string {
  return randomBytes(24).toString("base64url");
}

export const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,64}$/;

export function isValidShareToken(token: unknown): token is string {
  return typeof token === "string" && SHARE_TOKEN_PATTERN.test(token);
}
