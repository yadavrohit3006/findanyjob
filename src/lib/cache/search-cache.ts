import { Job } from "@/types";

interface CacheEntry {
  data: Job[];
  expiresAt: number;
}

// In-memory cache (server-side, per-process)
// For production: replace with Redis or a persistent KV store
const cache = new Map<string, CacheEntry>();

const TTL_MS = 5 * 60 * 1000; // 5 minutes

export function getCached(key: string): Job[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCached(key: string, data: Job[]): void {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

export function buildCacheKey(params: Record<string, string | number>): string {
  return Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}
