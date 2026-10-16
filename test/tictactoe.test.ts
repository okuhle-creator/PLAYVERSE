import { describe, it, expect } from 'vitest';
import {
  checkWinner,
  isBoardFull,
  getBestMove,
  Board,
} from '../src/games/tictactoe/minimax';

describe('Tic-Tac-Toe Game Logic & Minimax AI', () => {
  it('detects horizontal row wins', () => {
    const board: Board = ['X', 'X', 'X', null, 'O', null, 'O', null, null];
    const win = checkWinner(board);
    expect(win).not.toBeNull();
    expect(win?.winner).toBe('X');
    expect(win?.line).toEqual([0, 1, 2]);
  });

  it('detects vertical column wins', () => {
    const board: Board = ['O', 'X', null, 'O', 'X', null, 'O', null, 'X'];
    const win = checkWinner(board);
    expect(win).not.toBeNull();
    expect(win?.winner).toBe('O');
    expect(win?.line).toEqual([0, 3, 6]);
  });

  it('detects diagonal wins', () => {
    const board: Board = ['X', 'O', null, 'O', 'X', null, null, null, 'X'];
    const win = checkWinner(board);
    expect(win).not.toBeNull();
    expect(win?.winner).toBe('X');
    expect(win?.line).toEqual([0, 4, 8]);
  });

  it('detects full board (draw condition)', () => {
    const notFull: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null];
    expect(isBoardFull(notFull)).toBe(false);

    const full: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(isBoardFull(full)).toBe(true);
  });

  it('Minimax AI immediately takes a winning move when available', () => {
    // O can win at index 2
    const board: Board = ['O', 'O', null, 'X', 'X', null, null, null, null];
    const move = getBestMove(board, 'O', 'tactical');
    expect(move).toBe(2);
  });

  it('Minimax AI blocks an opponent winning move', () => {
    // X threatens to win at index 2
    const board: Board = ['X', 'X', null, 'O', null, null, null, null, null];
    const move = getBestMove(board, 'O', 'tactical');
    expect(move).toBe(2);
  });
});
