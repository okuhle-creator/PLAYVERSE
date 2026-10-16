import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Zap, AlertTriangle, CheckCircle, Trophy } from 'lucide-react';
import { Sound } from '../../services/sound';
import { StorageService } from '../../services/storage';

type State = 'idle' | 'waiting' | 'ready' | 'early' | 'result';

export const ReactionGame: React.FC = () => {
  const [gameState, setGameState] = useState<State>('idle');
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [bestTime, setBestTime] = useState<number | null>(() => {
    return StorageService.getHighScores().reaction || null;
  });

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleStart = useCallback(() => {
    clearTimer();
    setGameState('waiting');
    Sound.click();

    // Random delay between 1500ms and 4500ms
    const randomDelay = Math.floor(Math.random() * 3000) + 1500;

    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setGameState('ready');
      Sound.playBeep(880, 0.05, 'triangle', 0.2);
    }, randomDelay);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === 'idle') {
      handleStart();
    } else if (gameState === 'waiting') {
      // FALSE START!
      clearTimer();
      setGameState('early');
      Sound.gameOver();
    } else if (gameState === 'ready') {
      // VALID REACTION!
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setCurrentTime(elapsed);
      setGameState('result');
      Sound.playBeep(1046.5, 0.1, 'sine', 0.15); // C6

      setAttempts((prev) => [elapsed, ...prev].slice(0, 5));

      const isNewBest = StorageService.saveHighScore('reaction', elapsed, false);
      if (isNewBest || bestTime === null || elapsed < bestTime) {
        setBestTime(elapsed);
      }
      StorageService.addRecentlyPlayed('reaction', elapsed);
    } else if (gameState === 'early' || gameState === 'result') {
      handleStart();
    }
  }, [gameState, handleStart, bestTime]);

  const resetAll = () => {
    clearTimer();
    setGameState('idle');
    setCurrentTime(null);
    setAttempts([]);
    Sound.click();
  };

  // Keyboard shortcut: Spacebar triggers reaction/next test
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleClick();
      }
      if (e.key === 'r' || e.key === 'R') {
        resetAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimer();
    };
  }, [handleClick]);

  // Compute average of attempts
  const averageTime =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, val) => sum + val, 0) / attempts.length)
      : null;

  const getLatencyTier = (ms: number) => {
    if (ms < 200) return { label: 'Exceptional (Esports Tier)', color: 'text-[var(--color-success)]' };
    if (ms < 250) return { label: 'Fast Reflexes (Top 10%)', color: 'text-[var(--color-accent)]' };
    if (ms < 320) return { label: 'Average Reflexes', color: 'text-[var(--text-primary)]' };
    return { label: 'Sub-optimal Response', color: 'text-[var(--text-secondary)]' };
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Telemetry bar */}
      <div className="flex items-center justify-between w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-[var(--color-accent)]" />
          <span className="text-xs uppercase font-mono text-[var(--text-muted)] tracking-wider">Best</span>
          <span className="text-xl font-bold font-mono text-[var(--color-accent)]">
            {bestTime !== null ? `${bestTime} ms` : '--'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono text-[var(--text-muted)] tracking-wider">Average</span>
          <span className="text-xl font-bold font-mono text-[var(--text-primary)]">
            {averageTime !== null ? `${averageTime} ms` : '--'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono text-[var(--text-muted)] tracking-wider">Tries</span>
          <span className="text-sm font-semibold font-mono text-[var(--text-secondary)]">{attempts.length}/5</span>
        </div>
      </div>

      {/* Main Interactive Test Area */}
      <div
        onClick={handleClick}
        tabIndex={0}
        role="button"
        aria-label="Reaction test trigger area"
        className={`relative w-full aspect-[16/10] max-w-[480px] rounded-[var(--radius-md)] border p-8 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-150 shadow-card ${
          gameState === 'idle'
            ? 'bg-[var(--bg-surface)] border-[var(--border-medium)] hover:border-[var(--color-accent)]'
            : gameState === 'waiting'
            ? 'bg-[#2A1D0B] border-[#854D0E] text-[#FEF08A]'
            : gameState === 'ready'
            ? 'bg-[#0B2E17] border-[#16A34A] text-[#BBF7D0] animate-pulse'
            : gameState === 'early'
            ? 'bg-[#2C0E0E] border-[#DC2626] text-[#FECACA]'
            : 'bg-[var(--bg-surface)] border-[var(--border-medium)]'
        }`}
      >
        {gameState === 'idle' && (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mb-4 text-[var(--color-accent)]">
              <Zap size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Click to Start</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs">
              When the screen turns green, click as fast as humanly possible.
            </p>
            <span className="text-xs font-mono text-[var(--text-muted)] mt-4">[SPACE] or Click to engage</span>
          </div>
        )}

        {gameState === 'waiting' && (
          <div className="flex flex-col items-center">
            <h3 className="text-3xl font-extrabold mb-2 tracking-tight">Wait for Green...</h3>
            <p className="text-sm opacity-80">Do not click yet. Stay focused.</p>
          </div>
        )}

        {gameState === 'ready' && (
          <div className="flex flex-col items-center">
            <h3 className="text-4xl font-black mb-1 uppercase tracking-wider">CLICK NOW!</h3>
            <p className="text-sm opacity-90 font-mono">Instant response requested</p>
          </div>
        )}

        {gameState === 'early' && (
          <div className="flex flex-col items-center">
            <AlertTriangle size={36} className="text-[#EF4444] mb-3" />
            <h3 className="text-2xl font-bold mb-1 text-[#FECACA]">False Start!</h3>
            <p className="text-sm text-[#FCA5A5] mb-4">You reacted before the signal changed.</p>
            <span className="btn btn-secondary btn-sm bg-[#3B1212] border-[#7F1D1D] text-[#FECACA]">
              Click to Try Again
            </span>
          </div>
        )}

        {gameState === 'result' && currentTime !== null && (
          <div className="flex flex-col items-center animate-scale-in">
            <CheckCircle size={32} className="text-[var(--color-success)] mb-2" />
            <div className="text-5xl font-black font-mono tracking-tight text-[var(--text-primary)] mb-1">
              {currentTime} <span className="text-xl font-normal text-[var(--text-secondary)]">ms</span>
            </div>
            <div className={`text-xs font-bold uppercase font-mono tracking-wider mb-4 ${getLatencyTier(currentTime).color}`}>
              {getLatencyTier(currentTime).label}
            </div>
            <span className="btn btn-primary btn-sm">
              Click to Retest
            </span>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between w-full max-w-[480px]">
        <button onClick={resetAll} className="btn btn-secondary btn-sm">
          <RotateCcw size={14} /> Clear History
        </button>
        <span className="text-xs font-mono text-[var(--text-muted)]">
          Human visual reaction benchmark: ~250ms
        </span>
      </div>

      {/* History attempts list */}
      {attempts.length > 0 && (
        <div className="w-full max-w-[480px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] p-4">
          <div className="text-xs font-mono text-[var(--text-muted)] uppercase mb-3">Recent Reflex Latencies</div>
          <div className="grid grid-cols-5 gap-2">
            {attempts.map((att, idx) => (
              <div
                key={idx}
                className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xs)] p-2 text-center"
              >
                <div className="text-[10px] font-mono text-[var(--text-muted)]">#{attempts.length - idx}</div>
                <div className="text-sm font-bold font-mono text-[var(--text-primary)]">{att}ms</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
