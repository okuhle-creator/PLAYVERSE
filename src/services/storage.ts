import { GameId, HighScores, RecentlyPlayedItem, Theme } from '../app/types';

const STORAGE_KEYS = {
  THEME: 'playverse_theme',
  HIGH_SCORES: 'playverse_high_scores',
  RECENTLY_PLAYED: 'playverse_recent_played',
  SOUND_MUTED: 'playverse_sound_muted',
};

export const StorageService = {
  getTheme(): Theme {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  },

  setTheme(theme: Theme): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch {
      // ignore storage error
    }
  },

  getHighScores(): HighScores {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveHighScore(gameId: GameId, score: number, higherIsBetter = true): boolean {
    try {
      const current = this.getHighScores();
      const existing = current[gameId];

      const isBetter =
        existing === undefined ||
        (higherIsBetter ? score > existing : score < existing);

      if (isBetter) {
        current[gameId] = score;
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(current));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  getRecentlyPlayed(): RecentlyPlayedItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addRecentlyPlayed(gameId: GameId, score?: number): RecentlyPlayedItem[] {
    try {
      let list = this.getRecentlyPlayed();
      // Remove any existing entry for this game
      list = list.filter((item) => item.gameId !== gameId);
      // Insert at front
      list.unshift({
        gameId,
        timestamp: Date.now(),
        score,
      });
      // Cap at 6 recent games
      list = list.slice(0, 6);
      localStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(list));
      return list;
    } catch {
      return [];
    }
  },

  clearRecentlyPlayed(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.RECENTLY_PLAYED);
    } catch {
      // ignore
    }
  },

  isSoundMuted(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.SOUND_MUTED) === 'true';
    } catch {
      return false;
    }
  },

  setSoundMuted(muted: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND_MUTED, String(muted));
    } catch {
      // ignore
    }
  },
};
