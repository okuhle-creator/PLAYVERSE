import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../src/services/storage';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('manages theme setting and retrieval', () => {
    StorageService.setTheme('light');
    expect(StorageService.getTheme()).toBe('light');

    StorageService.setTheme('dark');
    expect(StorageService.getTheme()).toBe('dark');
  });

  it('saves high scores when higher is better', () => {
    expect(StorageService.saveHighScore('snake', 50, true)).toBe(true);
    expect(StorageService.getHighScores().snake).toBe(50);

    // Worse score should not overwrite
    expect(StorageService.saveHighScore('snake', 30, true)).toBe(false);
    expect(StorageService.getHighScores().snake).toBe(50);

    // Better score should overwrite
    expect(StorageService.saveHighScore('snake', 80, true)).toBe(true);
    expect(StorageService.getHighScores().snake).toBe(80);
  });

  it('saves high scores when lower is better (e.g. reaction time, memory timer)', () => {
    expect(StorageService.saveHighScore('reaction', 280, false)).toBe(true);
    expect(StorageService.getHighScores().reaction).toBe(280);

    // Slower (higher) time should not overwrite
    expect(StorageService.saveHighScore('reaction', 320, false)).toBe(false);
    expect(StorageService.getHighScores().reaction).toBe(280);

    // Faster (lower) time should overwrite
    expect(StorageService.saveHighScore('reaction', 195, false)).toBe(true);
    expect(StorageService.getHighScores().reaction).toBe(195);
  });

  it('tracks recently played games without duplicates and caps list', () => {
    StorageService.addRecentlyPlayed('snake', 50);
    StorageService.addRecentlyPlayed('2048', 1024);
    StorageService.addRecentlyPlayed('memory', 45);

    let recent = StorageService.getRecentlyPlayed();
    expect(recent).toHaveLength(3);
    expect(recent[0].gameId).toBe('memory'); // most recent on top

    // Playing snake again should move snake to top without duplicating
    StorageService.addRecentlyPlayed('snake', 70);
    recent = StorageService.getRecentlyPlayed();
    expect(recent).toHaveLength(3);
    expect(recent[0].gameId).toBe('snake');

    // Clearing recently played
    StorageService.clearRecentlyPlayed();
    expect(StorageService.getRecentlyPlayed()).toHaveLength(0);
  });

  it('toggles sound mute state', () => {
    expect(StorageService.isSoundMuted()).toBe(false);
    StorageService.setSoundMuted(true);
    expect(StorageService.isSoundMuted()).toBe(true);
    StorageService.setSoundMuted(false);
    expect(StorageService.isSoundMuted()).toBe(false);
  });
});
