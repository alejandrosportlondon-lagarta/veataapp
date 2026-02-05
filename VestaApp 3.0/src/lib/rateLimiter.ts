const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (bucket && now < bucket.reset) {
    if (bucket.count >= MAX_REQUESTS) return false;
    bucket.count += 1;
    return true;
  }
  buckets.set(key, { count: 1, reset: now + WINDOW_MS });
  return true;
}
