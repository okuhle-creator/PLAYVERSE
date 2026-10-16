import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SubmitAnswerSchema } from '../../../server/security/validation';
import { checkRateLimit } from '../../../server/security/rateLimit';
import { calculateServerScore } from '../../../server/game/scoring';
import { getGame, submitGameAnswer } from '../../../server/db/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const gameId = req.query.gameId as string;
  if (!gameId || typeof gameId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid gameId parameter' });
  }

  // Rate Limiting
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  const rateCheck = checkRateLimit(`answer:${clientIp}`, 60, 60000);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait before submitting another answer.'
    });
  }

  // Validate body
  const parseResult = SubmitAnswerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid request payload',
      details: parseResult.error.format()
    });
  }

  const { eventId } = parseResult.data;

  try {
    const game = await getGame(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Investigation session not found' });
    }

    if (game.completed) {
      return res.status(409).json({
        error: 'Investigation has already been submitted and concluded'
      });
    }

    const now = new Date();
    if (now.getTime() > game.expiresAt.getTime()) {
      return res.status(410).json({
        error: 'Investigation session expired. Time limit exceeded.'
      });
    }

    // Verify selected event belongs to the puzzle
    const eventExists = game.puzzleData.some((e) => e.id === eventId);
    if (!eventExists) {
      return res.status(400).json({
        error: 'Selected event ID does not exist in this investigation session'
      });
    }

    const isCorrect = eventId === game.anomalyEventId;
    const scoreResult = calculateServerScore(
      isCorrect,
      game.startedAt,
      now,
      game.timeLimitMs
    );

    // Atomic update to prevent race condition or duplicate submissions
    const updateSuccess = await submitGameAnswer(
      gameId,
      isCorrect,
      scoreResult.score,
      now
    );

    if (!updateSuccess) {
      return res.status(409).json({
        error: 'Conflict: Investigation has already been submitted'
      });
    }

    return res.status(200).json({
      correct: isCorrect,
      score: scoreResult.score,
      totalScore: scoreResult.score,
      elapsedMs: scoreResult.elapsedMs,
      anomalyId: game.anomalyEventId,
      explanation: game.explanation,
      selectedId: eventId
    });
  } catch (err) {
    console.error('Error submitting answer:', err);
    return res.status(500).json({
      error: 'Internal evaluation failure'
    });
  }
}
