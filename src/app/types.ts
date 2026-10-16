export type GameId = 'snake' | '2048' | 'memory' | 'tictactoe' | 'rps' | 'reaction';

export type GameCategory = 'all' | 'arcade' | 'puzzle' | 'strategy' | 'memory' | 'casual';

export interface GameMetadata {
  id: GameId;
  title: string;
  tagline: string;
  category: Exclude<GameCategory, 'all'>;
  description: string;
  instructions: string[];
  controls: { key: string; action: string }[];
  difficulty: 'Casual' | 'Tactical' | 'Reflex';
  featured: boolean;
  scoreLabel: string;
  scoreHigherIsBetter: boolean;
  formatScore: (score: number) => string;
}

export interface RecentlyPlayedItem {
  gameId: GameId;
  timestamp: number;
  score?: number;
}

export type HighScores = Partial<Record<GameId, number>>;

export type Theme = 'dark' | 'light';
