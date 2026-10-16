/**
 * GLITCH HUNT — Server-Authoritative Scoring System
 *
 * Formula:
 * score = round(1000 * max(0.2, 1 - elapsedMs / timeLimitMs))
 * Capped at 1,000 for correct answers, 0 for incorrect answers.
 */

export const DEFAULT_TIME_LIMIT_MS = 60000; // 60 seconds

export interface ScoreCalculationResult {
  score: number;
  elapsedMs: number;
  isExpired: number extends never ? never : boolean;
}

/**
 * Calculates server-authoritative score.
 * Client-submitted score, elapsedMs, or client timestamps are strictly ignored.
 */
export function calculateServerScore(
  isCorrect: boolean,
  startedAt: Date,
  submittedAt: Date,
  timeLimitMs: number = DEFAULT_TIME_LIMIT_MS
): ScoreCalculationResult {
  if (!isCorrect) {
    const elapsedMs = Math.max(0, submittedAt.getTime() - startedAt.getTime());
    return {
      score: 0,
      elapsedMs,
      isExpired: elapsedMs > timeLimitMs + 5000 // 5s grace period for network latency
    };
  }

  const elapsedMs = Math.max(0, submittedAt.getTime() - startedAt.getTime());
  const isExpired = elapsedMs > timeLimitMs + 5000;

  if (isExpired) {
    return {
      score: 0,
      elapsedMs,
      isExpired: true
    };
  }

  // score = round(1000 × max(0.2, 1 − elapsedMs / timeLimitMs))
  const ratio = 1 - elapsedMs / timeLimitMs;
  const factor = Math.max(0.2, ratio);
  const rawScore = Math.round(1000 * factor);
  const score = Math.min(1000, Math.max(0, rawScore));

  return {
    score,
    elapsedMs,
    isExpired: false
  };
}
