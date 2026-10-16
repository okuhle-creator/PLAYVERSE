import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { SubmitLeaderboardSchema } from '../../server/security/validation';
import { checkRateLimit } from '../../server/security/rateLimit';
import {
  getGame,
  getLeaderboard,
  addLeaderboardEntry,
  type LeaderboardEntry
} from '../../server/db/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  if (req.method === 'GET') {
    try {
      const entries = await getLeaderboard(10);
      return res.status(200).json({ entries });
    } catch (err) {
      console.error('Failed to retrieve leaderboard:', err);
      return res.status(500).json({ error: 'Failed to retrieve leaderboard scores' });
    }
  }

  if (req.method === 'POST') {
    const rateCheck = checkRateLimit(`leaderboard:${clientIp}`, 20, 60000);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait before submitting another score.'
      });
    }

    const parseResult = SubmitLeaderboardSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid leaderboard payload',
        details: parseResult.error.format()
      });
    }

    const { gameId, alias } = parseResult.data;

    try {
      const game = await getGame(gameId);
      if (!game) {
        return res.status(404).json({ error: 'Game record not found' });
      }

      if (!game.completed) {
        return res.status(400).json({ error: 'Cannot submit an uncompleted game to leaderboard' });
      }

      if (!game.isCorrect || !game.score || game.score <= 0) {
        return res.status(400).json({
          error: 'Only successfully completed games with a positive score can be submitted'
        });
      }

      const entry: LeaderboardEntry = {
        id: randomUUID(),
        gameId,
        alias: alias.trim(),
        score: game.score,
        challengeType: game.challengeDate ? 'daily' : 'standard',
        createdAt: new Date()
      };

      await addLeaderboardEntry(entry);

      const updatedLeaderboard = await getLeaderboard(10);
      return res.status(201).json({
        success: true,
        entry,
        leaderboard: updatedLeaderboard
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('already been claimed') || message.includes('unique constraint')) {
        return res.status(409).json({
          error: 'This game result has already been claimed on the leaderboard'
        });
      }

      console.error('Leaderboard submission error:', err);
      return res.status(500).json({ error: 'Failed to record leaderboard entry' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
