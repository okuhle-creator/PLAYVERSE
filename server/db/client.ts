/**
 * GLITCH HUNT — Database Storage Adapter
 * Production PostgreSQL (Neon / Vercel Postgres / Supabase / standard PG)
 * with robust parameterized queries and atomic updates.
 * Includes embedded memory-backed fallback for isolated unit testing & zero-setup dev.
 */

import pg from 'pg';
import type { TelemetryEvent, Difficulty } from '../game/generator';

export interface GameRecord {
  id: string;
  challengeDate?: string | null;
  difficulty: Difficulty;
  puzzleVersion: number;
  startedAt: Date;
  expiresAt: Date;
  submittedAt?: Date | null;
  completed: boolean;
  isCorrect?: boolean | null;
  score?: number | null;
  timeLimitMs: number;
  anomalyEventId: string;
  explanation: string;
  puzzleData: TelemetryEvent[];
  createdAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  gameId: string;
  alias: string;
  score: number;
  challengeType: string;
  createdAt: Date;
}

// Global connection pool
let pgPool: pg.Pool | null = null;

function getPgPool(): pg.Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  if (!pgPool) {
    pgPool = new pg.Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
  }
  return pgPool;
}

// In-Memory fallback store
class MemoryStore {
  games = new Map<string, GameRecord>();
  leaderboard: LeaderboardEntry[] = [];

  clear() {
    this.games.clear();
    this.leaderboard = [];
  }
}

const memoryStore = new MemoryStore();

/**
 * Ensures tables exist in PostgreSQL
 */
export async function initDb(): Promise<void> {
  const pool = getPgPool();
  if (!pool) return;

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id VARCHAR(64) PRIMARY KEY,
        challenge_date VARCHAR(10),
        difficulty VARCHAR(16) NOT NULL DEFAULT 'normal',
        puzzle_version INT NOT NULL DEFAULT 1,
        started_at TIMESTAMPTZ NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        submitted_at TIMESTAMPTZ,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        is_correct BOOLEAN,
        score INT,
        time_limit_ms INT NOT NULL DEFAULT 60000,
        anomaly_event_id VARCHAR(64) NOT NULL,
        explanation TEXT NOT NULL,
        puzzle_data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_games_challenge_date ON games (challenge_date);
      CREATE INDEX IF NOT EXISTS idx_games_completed ON games (completed);
      CREATE INDEX IF NOT EXISTS idx_games_started_at ON games (started_at);

      CREATE TABLE IF NOT EXISTS leaderboard (
        id VARCHAR(64) PRIMARY KEY,
        game_id VARCHAR(64) NOT NULL UNIQUE REFERENCES games(id) ON DELETE CASCADE,
        alias VARCHAR(16) NOT NULL,
        score INT NOT NULL CHECK (score >= 0 AND score <= 1000),
        challenge_type VARCHAR(32) NOT NULL DEFAULT 'standard',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_leaderboard_score_desc ON leaderboard (score DESC, created_at ASC);
    `);
  } finally {
    client.release();
  }
}

/**
 * Persist a new game record
 */
export async function saveGame(game: GameRecord): Promise<void> {
  const pool = getPgPool();
  if (!pool) {
    memoryStore.games.set(game.id, { ...game });
    return;
  }

  const query = `
    INSERT INTO games (
      id, challenge_date, difficulty, puzzle_version, started_at, expires_at,
      completed, time_limit_ms, anomaly_event_id, explanation, puzzle_data, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `;
  const values = [
    game.id,
    game.challengeDate || null,
    game.difficulty,
    game.puzzleVersion,
    game.startedAt,
    game.expiresAt,
    game.completed,
    game.timeLimitMs,
    game.anomalyEventId,
    game.explanation,
    JSON.stringify(game.puzzleData),
    game.createdAt
  ];

  await pool.query(query, values);
}

/**
 * Retrieve game by ID
 */
export async function getGame(id: string): Promise<GameRecord | null> {
  const pool = getPgPool();
  if (!pool) {
    const found = memoryStore.games.get(id);
    return found ? { ...found } : null;
  }

  const res = await pool.query('SELECT * FROM games WHERE id = $1', [id]);
  if (res.rows.length === 0) return null;

  const row = res.rows[0];
  return {
    id: row.id,
    challengeDate: row.challenge_date,
    difficulty: row.difficulty,
    puzzleVersion: row.puzzle_version,
    startedAt: new Date(row.started_at),
    expiresAt: new Date(row.expires_at),
    submittedAt: row.submitted_at ? new Date(row.submitted_at) : null,
    completed: row.completed,
    isCorrect: row.is_correct,
    score: row.score,
    timeLimitMs: row.time_limit_ms,
    anomalyEventId: row.anomaly_event_id,
    explanation: row.explanation,
    puzzleData: typeof row.puzzle_data === 'string' ? JSON.parse(row.puzzle_data) : row.puzzle_data,
    createdAt: new Date(row.created_at)
  };
}

/**
 * Atomically submit an answer and calculate score.
 * Returns true if update succeeded, false if already completed (prevents replay/race conditions).
 */
export async function submitGameAnswer(
  id: string,
  isCorrect: boolean,
  score: number,
  submittedAt: Date
): Promise<boolean> {
  const pool = getPgPool();
  if (!pool) {
    const game = memoryStore.games.get(id);
    if (!game || game.completed) {
      return false;
    }
    game.completed = true;
    game.isCorrect = isCorrect;
    game.score = score;
    game.submittedAt = submittedAt;
    return true;
  }

  // Atomic conditional update
  const query = `
    UPDATE games
    SET completed = TRUE,
        is_correct = $1,
        score = $2,
        submitted_at = $3
    WHERE id = $4 AND completed = FALSE
  `;
  const res = await pool.query(query, [isCorrect, score, submittedAt, id]);
  return (res.rowCount ?? 0) > 0;
}

/**
 * Fetch top leaderboard scores
 */
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const pool = getPgPool();
  if (!pool) {
    return [...memoryStore.leaderboard]
      .sort((a, b) => b.score - a.score || a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, limit);
  }

  const query = `
    SELECT id, game_id, alias, score, challenge_type, created_at
    FROM leaderboard
    ORDER BY score DESC, created_at ASC
    LIMIT $1
  `;
  const res = await pool.query(query, [limit]);
  return res.rows.map((row) => ({
    id: row.id,
    gameId: row.game_id,
    alias: row.alias,
    score: row.score,
    challengeType: row.challenge_type,
    createdAt: new Date(row.created_at)
  }));
}

/**
 * Insert leaderboard entry with duplicate game protection
 */
export async function addLeaderboardEntry(entry: LeaderboardEntry): Promise<void> {
  const pool = getPgPool();
  if (!pool) {
    const exists = memoryStore.leaderboard.some((e) => e.gameId === entry.gameId);
    if (exists) {
      throw new Error('Game score has already been claimed on leaderboard');
    }
    memoryStore.leaderboard.push({ ...entry });
    return;
  }

  const query = `
    INSERT INTO leaderboard (id, game_id, alias, score, challenge_type, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  await pool.query(query, [
    entry.id,
    entry.gameId,
    entry.alias,
    entry.score,
    entry.challengeType,
    entry.createdAt
  ]);
}

export function resetMemoryStoreForTesting(): void {
  memoryStore.clear();
}
