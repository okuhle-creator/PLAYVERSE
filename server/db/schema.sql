-- GLITCH HUNT Schema Definition
-- PostgreSQL compatible (Neon, Vercel Postgres, Supabase, Local PG)

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
CREATE INDEX IF NOT EXISTS idx_leaderboard_challenge_type ON leaderboard (challenge_type);
