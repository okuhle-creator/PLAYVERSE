import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { CreateGameSchema } from '../../server/security/validation';
import { checkRateLimit } from '../../server/security/rateLimit';
import { generateDailyChallenge, generatePuzzle } from '../../server/game/generator';
import { DEFAULT_TIME_LIMIT_MS } from '../../server/game/scoring';
import { saveGame, type GameRecord } from '../../server/db/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Security headers
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate Limiting per IP
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  const rateCheck = checkRateLimit(`create:${clientIp}`, 30, 60000);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait before creating another investigation.'
    });
  }

  // Validate Input
  const parseResult = CreateGameSchema.safeParse(req.body || {});
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid request parameters',
      details: parseResult.error.format()
    });
  }

  const { difficulty, challengeType, challengeDate } = parseResult.data;

  // Generate puzzle content
  const puzzle =
    challengeType === 'daily'
      ? generateDailyChallenge(challengeDate)
      : generatePuzzle(undefined, difficulty);

  const gameId = randomUUID();
  const startedAt = new Date();
  const timeLimitMs =
    Number(process.env.GAME_ROUND_TIME_LIMIT_MS) || DEFAULT_TIME_LIMIT_MS;
  const expiresAt = new Date(startedAt.getTime() + timeLimitMs + 15000); // 15s grace for network

  const gameRecord: GameRecord = {
    id: gameId,
    challengeDate: challengeType === 'daily' ? challengeDate || new Date().toISOString().slice(0, 10) : null,
    difficulty: puzzle.difficulty,
    puzzleVersion: 1,
    startedAt,
    expiresAt,
    completed: false,
    timeLimitMs,
    anomalyEventId: puzzle.anomalyId,
    explanation: puzzle.explanation,
    puzzleData: puzzle.events,
    createdAt: startedAt
  };

  try {
    await saveGame(gameRecord);

    // Return public representation with NO answer or explanation
    return res.status(201).json({
      gameId: gameRecord.id,
      challengeDate: gameRecord.challengeDate,
      difficulty: gameRecord.difficulty,
      startedAt: gameRecord.startedAt.toISOString(),
      timeLimitMs: gameRecord.timeLimitMs,
      events: puzzle.events
    });
  } catch (err) {
    console.error('Failed to create game:', err);
    return res.status(500).json({
      error: 'Internal investigation engine failure. Please retry.'
    });
  }
}
