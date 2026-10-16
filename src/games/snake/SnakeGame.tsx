import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trophy } from 'lucide-react';
import { Sound } from '../../services/sound';
import { StorageService } from '../../services/storage';

interface Point {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SPEED = 140;
const MIN_SPEED = 55;

export const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState<Point>({ x: 10, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return StorageService.getHighScores().snake || 0;
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');

  const dirRef = useRef<Direction>('UP');
  const nextDirRef = useRef<Direction>('UP');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate safe random food position not on snake
  const spawnFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    let collision: boolean;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      collision = currentSnake.some((seg) => seg.x === newFood.x && seg.y === newFood.y);
    } while (collision);
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake: Point[] = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    dirRef.current = 'UP';
    nextDirRef.current = 'UP';
    setFood(spawnFood(initialSnake));
    setScore(0);
    setGameState('playing');
    Sound.click();
  }, [spawnFood]);

  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);

  const changeDirection = useCallback(
    (newDir: Direction) => {
      if (gameState === 'idle') {
        resetGame();
      }
      const cur = dirRef.current;
      if (newDir === 'UP' && cur !== 'DOWN') nextDirRef.current = 'UP';
      else if (newDir === 'DOWN' && cur !== 'UP') nextDirRef.current = 'DOWN';
      else if (newDir === 'LEFT' && cur !== 'RIGHT') nextDirRef.current = 'LEFT';
      else if (newDir === 'RIGHT' && cur !== 'LEFT') nextDirRef.current = 'RIGHT';
    },
    [gameState, resetGame]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.code === 'Space') {
        togglePause();
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        resetGame();
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, resetGame, togglePause]);

  // Main Game Loop Tick
  useEffect(() => {
    if (gameState !== 'playing') return;

    const currentSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - Math.floor(score / 3) * 6);

    const intervalId = setInterval(() => {
      dirRef.current = nextDirRef.current;
      const head = snake[0];
      const newHead: Point = { ...head };

      if (dirRef.current === 'UP') newHead.y -= 1;
      else if (dirRef.current === 'DOWN') newHead.y += 1;
      else if (dirRef.current === 'LEFT') newHead.x -= 1;
      else if (dirRef.current === 'RIGHT') newHead.x += 1;

      // Wall collision check
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameState('gameover');
        Sound.gameOver();
        StorageService.saveHighScore('snake', score, true);
        StorageService.addRecentlyPlayed('snake', score);
        return;
      }

      // Self collision check
      if (snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
        setGameState('gameover');
        Sound.gameOver();
        StorageService.saveHighScore('snake', score, true);
        StorageService.addRecentlyPlayed('snake', score);
        return;
      }

      const newSnake = [newHead, ...snake];

      // Food consumption check
      if (newHead.x === food.x && newHead.y === food.y) {
        const nextScore = score + 10;
        setScore(nextScore);
        if (nextScore > highScore) {
          setHighScore(nextScore);
          StorageService.saveHighScore('snake', nextScore, true);
        }
        Sound.eatFood();
        setFood(spawnFood(newSnake));
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    }, currentSpeed);

    return () => clearInterval(intervalId);
  }, [gameState, snake, food, score, highScore, spawnFood]);

  // Render to Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / GRID_SIZE;

    // Background
    ctx.fillStyle = '#17181D';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = '#23252E';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }

    // Draw Food
    const fx = food.x * cellSize + cellSize / 2;
    const fy = food.y * cellSize + cellSize / 2;
    const r = cellSize * 0.38;

    // Glowing food orb
    ctx.beginPath();
    ctx.arc(fx, fy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#22C55E';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(fx, fy, r * 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Snake
    snake.forEach((seg, idx) => {
      const sx = seg.x * cellSize;
      const sy = seg.y * cellSize;
      const padding = 1.5;

      if (idx === 0) {
        // Head
        ctx.fillStyle = '#FF5C28';
        ctx.beginPath();
        ctx.roundRect(sx + padding, sy + padding, cellSize - padding * 2, cellSize - padding * 2, 4);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFFFFF';
        const eyeOffset = cellSize * 0.3;
        const eyeRadius = cellSize * 0.1;
        if (dirRef.current === 'UP' || dirRef.current === 'DOWN') {
          ctx.beginPath();
          ctx.arc(sx + eyeOffset, sy + cellSize / 2, eyeRadius, 0, Math.PI * 2);
          ctx.arc(sx + cellSize - eyeOffset, sy + cellSize / 2, eyeRadius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(sx + cellSize / 2, sy + eyeOffset, eyeRadius, 0, Math.PI * 2);
          ctx.arc(sx + cellSize / 2, sy + cellSize - eyeOffset, eyeRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Body segment
        const alpha = Math.max(0.45, 1 - (idx / snake.length) * 0.55);
        ctx.fillStyle = `rgba(255, 92, 40, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(sx + padding, sy + padding, cellSize - padding * 2, cellSize - padding * 2, 3);
        ctx.fill();
      }
    });
  }, [snake, food]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Telemetry bar */}
      <div className="flex items-center justify-between w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono text-[var(--text-muted)] tracking-wider">Score</span>
          <span className="text-xl font-bold font-mono text-[var(--text-primary)]">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-[var(--color-accent)]" />
          <span className="text-xs uppercase font-mono text-[var(--text-muted)] tracking-wider">Best</span>
          <span className="text-xl font-bold font-mono text-[var(--color-accent)]">{highScore}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono text-[var(--text-muted)] tracking-wider">Speed</span>
          <span className="text-sm font-semibold font-mono text-[var(--text-secondary)]">
            Lv {Math.min(10, 1 + Math.floor(score / 30))}
          </span>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative w-full aspect-square max-w-[420px] bg-[var(--bg-surface)] border border-[var(--border-medium)] rounded-[var(--radius-md)] overflow-hidden shadow-card">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full h-full block"
          tabIndex={0}
          aria-label="Snake Game Grid"
        />

        {/* Overlay States */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-[#0F1013]/85 flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Ready to Strike</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs">
              Collect energy orbs without touching the grid boundaries or self.
            </p>
            <button onClick={resetGame} className="btn btn-primary">
              <Play size={16} /> Start Game
            </button>
            <span className="text-xs font-mono text-[var(--text-muted)] mt-3">Or press any Arrow key to start</span>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-[#0F1013]/85 flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Game Paused</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Take a breath. The grid awaits.</p>
            <div className="flex gap-3">
              <button onClick={togglePause} className="btn btn-primary">
                <Play size={16} /> Resume
              </button>
              <button onClick={resetGame} className="btn btn-secondary">
                <RotateCcw size={16} /> Restart
              </button>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-[#0F1013]/90 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <span className="badge badge-accent mb-2">Collision Detected</span>
            <h3 className="text-2xl font-bold mb-1">Game Over</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Final Score: <strong className="text-[var(--text-primary)] font-mono">{score}</strong></p>
            <div className="flex gap-3">
              <button onClick={resetGame} className="btn btn-primary">
                <RotateCcw size={16} /> Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control Actions */}
      <div className="flex items-center justify-between w-full max-w-[420px]">
        <div className="flex gap-2">
          {gameState === 'playing' ? (
            <button onClick={togglePause} className="btn btn-secondary btn-sm" aria-label="Pause game">
              <Pause size={14} /> Pause
            </button>
          ) : gameState === 'paused' ? (
            <button onClick={togglePause} className="btn btn-secondary btn-sm" aria-label="Resume game">
              <Play size={14} /> Resume
            </button>
          ) : null}
          <button onClick={resetGame} className="btn btn-secondary btn-sm" aria-label="Restart game">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
        <div className="text-xs text-[var(--text-muted)] font-mono">
          [SPACE] Pause &bull; [R] Reset
        </div>
      </div>

      {/* Touch D-Pad for Mobile & Accessibility */}
      <div className="flex flex-col items-center gap-1.5 md:hidden w-full max-w-[200px] mt-2">
        <button
          onClick={() => changeDirection('UP')}
          className="w-14 h-12 flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] active:bg-[var(--color-accent)] active:text-white"
          aria-label="Move Up"
        >
          <ArrowUp size={20} />
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => changeDirection('LEFT')}
            className="w-14 h-12 flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] active:bg-[var(--color-accent)] active:text-white"
            aria-label="Move Left"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => changeDirection('DOWN')}
            className="w-14 h-12 flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] active:bg-[var(--color-accent)] active:text-white"
            aria-label="Move Down"
          >
            <ArrowDown size={20} />
          </button>
          <button
            onClick={() => changeDirection('RIGHT')}
            className="w-14 h-12 flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] active:bg-[var(--color-accent)] active:text-white"
            aria-label="Move Right"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
