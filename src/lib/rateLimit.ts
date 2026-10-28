import "server-only";
import { createHash } from "crypto";
import { serverEnv } from "@/lib/env";

/**
 * Best-effort in-memory sliding-window limiter (per server instance).
 * The database enforces the authoritative limits for comments and contact messages;
 * this layer just sheds obvious bursts cheaply.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  return { ok: true, retryAfter: 0 };
}

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}

export function hashIp(ip: string) {
  return createHash("sha256").update(`${serverEnv().ipSalt}:${ip}`).digest("hex").slice(0, 32);
}
