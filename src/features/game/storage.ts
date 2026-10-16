import type { PersonalStats, Achievement } from './gameTypes';

const STORAGE_KEY = 'glitch_hunt_stats_v1';

const INITIAL_STATS: PersonalStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  highScore: 0,
  currentStreak: 0,
  achievements: {}
};

export const ACHIEVEMENTS_LIST: Omit<Achievement, 'earned'>[] = [
  {
    id: 'first-signal',
    title: 'First Signal',
    description: 'Conclude your first telemetry investigation.'
  },
  {
    id: 'clean-read',
    title: 'Clean Read',
    description: 'Successfully isolate an anomalous event.'
  },
  {
    id: 'sharp-operator',
    title: 'Sharp Operator',
    description: 'Achieve a deduction score above 800 points.'
  },
  {
    id: 'pattern-hunter',
    title: 'Pattern Hunter',
    description: 'Solve 3 consecutive investigations without an error.'
  },
  {
    id: 'daily-sweep',
    title: 'Daily Sweep',
    description: 'Successfully solve a UTC Daily Challenge.'
  }
];

export function loadPersonalStats(): PersonalStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATS;

    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return INITIAL_STATS;

    return {
      gamesPlayed: Number(parsed.gamesPlayed) || 0,
      gamesWon: Number(parsed.gamesWon) || 0,
      highScore: Number(parsed.highScore) || 0,
      currentStreak: Number(parsed.currentStreak) || 0,
      achievements: typeof parsed.achievements === 'object' && parsed.achievements !== null ? parsed.achievements : {}
    };
  } catch {
    return INITIAL_STATS;
  }
}

export function savePersonalStats(stats: PersonalStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Unable to persist player stats:', err);
  }
}

export function updateStatsOnGameEnd(
  current: PersonalStats,
  isCorrect: boolean,
  score: number,
  isDaily: boolean
): { updated: PersonalStats; newlyUnlocked: string[] } {
  const next: PersonalStats = {
    ...current,
    gamesPlayed: current.gamesPlayed + 1,
    gamesWon: current.gamesWon + (isCorrect ? 1 : 0),
    highScore: Math.max(current.highScore, score),
    currentStreak: isCorrect ? current.currentStreak + 1 : 0,
    achievements: { ...current.achievements }
  };

  const newlyUnlocked: string[] = [];

  const unlock = (id: string) => {
    if (!next.achievements[id]) {
      next.achievements[id] = new Date().toISOString();
      newlyUnlocked.push(id);
    }
  };

  // Rule 1: First Signal
  unlock('first-signal');

  // Rule 2: Clean Read
  if (isCorrect) {
    unlock('clean-read');
  }

  // Rule 3: Sharp Operator
  if (score > 800) {
    unlock('sharp-operator');
  }

  // Rule 4: Pattern Hunter (streak of 3)
  if (next.currentStreak >= 3) {
    unlock('pattern-hunter');
  }

  // Rule 5: Daily Sweep
  if (isDaily && isCorrect) {
    unlock('daily-sweep');
  }

  savePersonalStats(next);
  return { updated: next, newlyUnlocked };
}
