import { describe, it, expect } from 'vitest';
import { GAMES_CATALOG, getGameById, CATEGORIES } from '../src/services/gamesRegistry';

describe('PLAYVERSE Games Catalog', () => {
  it('registers exactly 6 fully playable games', () => {
    expect(GAMES_CATALOG).toHaveLength(6);
    const ids = GAMES_CATALOG.map((g) => g.id);
    expect(ids).toEqual(['snake', '2048', 'memory', 'tictactoe', 'rps', 'reaction']);
  });

  it('provides all mandatory metadata for each game', () => {
    GAMES_CATALOG.forEach((game) => {
      expect(game.id).toBeTruthy();
      expect(game.title).toBeTruthy();
      expect(game.tagline).toBeTruthy();
      expect(game.category).toBeTruthy();
      expect(game.description.length).toBeGreaterThan(15);
      expect(game.instructions.length).toBeGreaterThanOrEqual(3);
      expect(game.controls.length).toBeGreaterThanOrEqual(1);
      expect(typeof game.scoreHigherIsBetter).toBe('boolean');
      expect(typeof game.formatScore).toBe('function');
    });
  });

  it('correctly retrieves individual games by ID', () => {
    const snake = getGameById('snake');
    expect(snake?.title).toBe('Snake Classic');
    expect(snake?.category).toBe('arcade');

    const g2048 = getGameById('2048');
    expect(g2048?.title).toBe('2048 Matrix');
    expect(g2048?.category).toBe('puzzle');

    const reaction = getGameById('reaction');
    expect(reaction?.title).toBe('Reaction Test');
    expect(reaction?.scoreHigherIsBetter).toBe(false); // lower ms is better
  });

  it('formats scores appropriately for different game units', () => {
    const snake = getGameById('snake')!;
    expect(snake.formatScore(120)).toBe('120 pts');

    const memory = getGameById('memory')!;
    expect(memory.formatScore(65)).toBe('1:05');

    const reaction = getGameById('reaction')!;
    expect(reaction.formatScore(218)).toBe('218 ms');

    const tictactoe = getGameById('tictactoe')!;
    expect(tictactoe.formatScore(5)).toBe('5 wins');
  });

  it('contains valid categories mapping', () => {
    const catIds = CATEGORIES.map((c) => c.id);
    expect(catIds).toContain('all');
    expect(catIds).toContain('arcade');
    expect(catIds).toContain('puzzle');
    expect(catIds).toContain('strategy');
    expect(catIds).toContain('memory');
    expect(catIds).toContain('casual');
  });
});
