/**
 * In-memory sliding window rate limiter for Vercel/Node serverless environments.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const clientRecords = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of clientRecords.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < 60000);
    if (record.timestamps.length === 0) {
      clientRecords.delete(key);
    }
  }
}, 300000);

export function checkRateLimit(
  clientId: string,
  limit: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = clientRecords.get(clientId) || { timestamps: [] };

  // Remove timestamps outside window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return {
      allowed: false,
      remaining: 0,
      resetMs
    };
  }

  record.timestamps.push(now);
  clientRecords.set(clientId, record);

  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    resetMs: windowMs
  };
}
