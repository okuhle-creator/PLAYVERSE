/**
 * Utility helpers for formatting score, duration, and telemetry timestamps.
 */

export function formatMs(ms: number): string {
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

export function formatScore(score: number): string {
  return new Intl.NumberFormat('en-US').format(score);
}

export function formatIsoTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const mins = String(d.getUTCMinutes()).padStart(2, '0');
    const secs = String(d.getUTCSeconds()).padStart(2, '0');
    const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
    return `${hours}:${mins}:${secs}.${ms}Z`;
  } catch {
    return isoString;
  }
}
