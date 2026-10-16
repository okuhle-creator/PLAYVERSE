import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Sound } from '../../services/sound';
import { StorageService } from '../../services/storage';

type Board = number[][];
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const BOARD_SIZE = 4;

export const Game2048: React.FC = () => {
  const [board, setBoard] = useState<Board>(() => getInitialBoard());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return StorageService.getHighScores()['2048'] || 0;
  });
  const [won, setWon] = useState(false);
  const [dismissWin, setDismissWin] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Swipe detection coordinates
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function createEmptyBoard(): Board {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
  }

  function getEmptyCells(b: Board): { r: number; c: number }[] {
    const empty: { r: number; c: number }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (b[r][c] === 0) empty.push({ r, c });
      }
    }
    return empty;
  }

  function addRandomTile(b: Board): Board {
    const empty = getEmptyCells(b);
    if (empty.length === 0) return b;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    const newBoard = b.map((row) => [...row]);
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  }

  function getInitialBoard(): Board {
    let b = createEmptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    return b;
  }

  const resetGame = useCallback(() => {
    const newBoard = getInitialBoard();
    setBoard(newBoard);
    setScore(0);
    setWon(false);
    setDismissWin(false);
    setGameOver(false);
    Sound.click();
  }, []);

  // Check if any moves are possible
  const checkGameOver = (b: Board): boolean => {
    if (getEmptyCells(b).length > 0) return false;

    // Check adjacent horizontals
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE - 1; c++) {
        if (b[r][c] === b[r][c + 1]) return false;
      }
    }
    // Check adjacent verticals
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (let r = 0; r < BOARD_SIZE - 1; r++) {
        if (b[r][c] === b[r + 1][c]) return false;
      }
    }
    return true;
  };

  // Slide & Merge a single row to the left
  const slideRowLeft = (row: number[]): { newRow: number[]; points: number; merged: boolean } => {
    const nonZero = row.filter((val) => val !== 0);
    const newRow: number[] = [];
    let points = 0;
    let merged = false;

    let i = 0;
    while (i < nonZero.length) {
      if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
        const combined = nonZero[i] * 2;
        newRow.push(combined);
        points += combined;
        merged = true;
        i += 2;
      } else {
        newRow.push(nonZero[i]);
        i += 1;
      }
    }

    while (newRow.length < BOARD_SIZE) {
      newRow.push(0);
    }

    return { newRow, points, merged };
  };

  // Move Board in Direction
  const move = useCallback(
    (dir: Direction) => {
      if (gameOver) return;

      let currentBoard = board.map((row) => [...row]);
      let pointsEarned = 0;
      let hasMerged = false;

      // Helper rotations to reduce all movements to slideRowLeft
      const rotateClockwise = (b: Board): Board => {
        const result = createEmptyBoard();
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            result[c][BOARD_SIZE - 1 - r] = b[r][c];
          }
        }
        return result;
      };

      let rotations = 0;
      if (dir === 'UP') rotations = 3;
      else if (dir === 'RIGHT') rotations = 2;
      else if (dir === 'DOWN') rotations = 1;

      for (let i = 0; i < rotations; i++) {
        currentBoard = rotateClockwise(currentBoard);
      }

      // Perform slide on each row
      let boardChanged = false;
      const nextBoard: Board = [];

      for (let r = 0; r < BOARD_SIZE; r++) {
        const { newRow, points, merged } = slideRowLeft(currentBoard[r]);
        nextBoard.push(newRow);
        pointsEarned += points;
        if (merged) hasMerged = true;
        if (newRow.some((val, idx) => val !== currentBoard[r][idx])) {
          boardChanged = true;
        }
      }

      // Rotate back
      let finalBoard = nextBoard;
      const reverseRotations = (4 - rotations) % 4;
      for (let i = 0; i < reverseRotations; i++) {
        finalBoard = rotateClockwise(finalBoard);
      }

      if (!boardChanged) return;

      if (hasMerged) {
        Sound.tileMerge();
      }

      const boardWithNewTile = addRandomTile(finalBoard);
      setBoard(boardWithNewTile);

      const nextScore = score + pointsEarned;
      setScore(nextScore);

      if (nextScore > highScore) {
        setHighScore(nextScore);
        StorageService.saveHighScore('2048', nextScore, true);
      }

      // Check win 2048 condition
      if (!won && !dismissWin) {
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (boardWithNewTile[r][c] === 2048) {
              setWon(true);
              Sound.win();
              break;
            }
          }
        }
      }

      // Check game over
      if (checkGameOver(boardWithNewTile)) {
        setGameOver(true);
        Sound.gameOver();
        StorageService.saveHighScore('2048', nextScore, true);
        StorageService.addRecentlyPlayed('2048', nextScore);
      }
    },
    [board, gameOver, score, highScore, won, dismissWin]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'r' || e.key === 'R') {
        resetGame();
        return;
      }
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          move('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          move('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          move('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          move('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, resetGame]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const threshold = 30;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > threshold) {
        move(dx > 0 ? 'RIGHT' : 'LEFT');
      }
    } else {
      if (Math.abs(dy) > threshold) {
        move(dy > 0 ? 'DOWN' : 'UP');
      }
    }
  };

  // Restrained Tile Color Scheme
  const getTileStyle = (val: number) => {
    switch (val) {
      case 2:
        return 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]';
      case 4:
        return 'bg-[var(--bg-active)] text-[var(--text-primary)] border border-[var(--border-subtle)]';
      case 8:
        return 'bg-[#3A3830] text-[#F3E5AB] font-bold border border-[#524E41]';
      case 16:
        return 'bg-[#4A3828] text-[#FFC085] font-bold border border-[#6B4E32]';
      case 32:
        return 'bg-[#5A3322] text-[#FF9E66] font-bold border border-[#80452A]';
      case 64:
        return 'bg-[#732B16] text-[#FF8547] font-bold border border-[#9E391A]';
      case 128:
        return 'bg-[#663D14] text-[#FFD166] font-bold border border-[#945C22] shadow-sm';
      case 256:
        return 'bg-[#7D4814] text-[#FFE082] font-bold border border-[#B3681D] shadow-sm';
      case 512:
        return 'bg-[#8F5210] text-[#FFF176] font-bold border border-[#CCA625] shadow-sm';
      case 1024:
        return 'bg-[#A65B0A] text-[#FFF9C4] font-bold border border-[#FFD54F] shadow-md';
      case 2048:
        return 'bg-[var(--color-accent)] text-white font-black border border-[var(--color-accent-hover)] shadow-md';
      default:
        return 'bg-[#2A2318] text-[#FFE0B2] font-bold border border-[#52442C]';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Telemetry bar */}
      <div className="flex items-center justify-between w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono text-[var(--text-muted)] tracking-wider">Score</span>
          <span className="text-xl font-bold font-mono text-[var(--text-primary)]">{score.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-[var(--color-accent)]" />
          <span className="text-xs uppercase font-mono text-[var(--text-muted)] tracking-wider">Best</span>
          <span className="text-xl font-bold font-mono text-[var(--color-accent)]">{highScore.toLocaleString()}</span>
        </div>
        <button onClick={resetGame} className="btn btn-secondary btn-sm" aria-label="Restart 2048">
          <RotateCcw size={14} /> New Game
        </button>
      </div>

      {/* 2048 Grid Board with Swipe Support */}
      <div
        className="relative w-full aspect-square max-w-[380px] bg-[var(--bg-surface)] border border-[var(--border-medium)] rounded-[var(--radius-md)] p-3 shadow-card select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 grid-rows-4 gap-2.5 w-full h-full">
          {board.map((row, rIdx) =>
            row.map((val, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`flex items-center justify-center rounded-[var(--radius-sm)] text-lg md:text-xl font-mono transition-transform duration-100 ${
                  val === 0 ? 'bg-[var(--bg-elevated)]/40' : getTileStyle(val)
                }`}
              >
                {val !== 0 ? val : ''}
              </div>
            ))
          )}
        </div>

        {/* Win Dialog Overlay */}
        {won && !dismissWin && (
          <div className="absolute inset-0 bg-[#0F1013]/90 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <span className="badge badge-accent mb-2">Matrix Conquered</span>
            <h3 className="text-2xl font-bold mb-2">2048 Achieved!</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              You synthesized the 2048 tile. You can keep pushing for higher limits or begin fresh.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDismissWin(true)} className="btn btn-secondary">
                Keep Playing
              </button>
              <button onClick={resetGame} className="btn btn-primary">
                New Game
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-[#0F1013]/90 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <span className="badge mb-2">Grid Locked</span>
            <h3 className="text-2xl font-bold mb-2">No Moves Remaining</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              Final Score: <strong className="text-[var(--text-primary)] font-mono">{score.toLocaleString()}</strong>
            </p>
            <button onClick={resetGame} className="btn btn-primary">
              <RotateCcw size={16} /> Try Again
            </button>
          </div>
        )}
      </div>

      {/* On-screen Directional Pad for Mobile & Usability */}
      <div className="flex flex-col items-center gap-1.5 md:hidden w-full max-w-[200px] mt-2">
        <button
          onClick={() => move('UP')}
          className="w-14 h-12 flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] active:bg-[var(--color-accent)] active:text-white"
          aria-label="Slide Up"
        >
          <ArrowUp size={20} />
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => move('LEFT')}
            className="w-14 h-12 flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] active:bg-[var(--color-accent)] active:text-white"
            aria-label="Slide Left"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => move('DOWN')}
            className="w-14 h-12 flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] active:bg-[var(--color-accent)] active:text-white"
            aria-label="Slide Down"
          >
            <ArrowDown size={20} />
          </button>
          <button
            onClick={() => move('RIGHT')}
            className="w-14 h-12 flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] active:bg-[var(--color-accent)] active:text-white"
            aria-label="Slide Right"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
