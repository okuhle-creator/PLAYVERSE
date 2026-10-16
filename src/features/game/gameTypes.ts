export type SeverityLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRIT';
export type GameDifficulty = 'easy' | 'normal' | 'hard';
export type ChallengeType = 'standard' | 'daily';

export interface TelemetryEvent {
  id: string;
  source: string;
  level: SeverityLevel;
  timestamp: string;
  message: string;
  metric: string;
  value: string;
}

export type GameStateStatus =
  | 'idle'         // Title / Intro screen
  | 'briefing'     // Pre-round briefing
  | 'loading'      // Loading session from API
  | 'investigating'// Active 5-event deduction screen
  | 'evaluating'   // Awaiting server response
  | 'concluded'    // Result revealed with explanation
  | 'error';       // Handled error state

export interface GameSession {
  gameId: string;
  challengeDate?: string | null;
  difficulty: GameDifficulty;
  startedAt: string;
  timeLimitMs: number;
  events: TelemetryEvent[];
}

export interface EvaluationResult {
  correct: boolean;
  score: number;
  totalScore: number;
  elapsedMs: number;
  anomalyId: string;
  explanation: string;
  selectedId: string;
}

export interface LeaderboardItem {
  id: string;
  alias: string;
  score: number;
  challengeType: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  unlockedAt?: string;
}

export interface PersonalStats {
  gamesPlayed: number;
  gamesWon: number;
  highScore: number;
  currentStreak: number;
  achievements: Record<string, string>; // id -> ISO timestamp
}
