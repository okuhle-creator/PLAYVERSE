import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Flame } from 'lucide-react';
import { Sound } from '../../services/sound';
import { StorageService } from '../../services/storage';

type Choice = 'rock' | 'paper' | 'scissors';
type Outcome = 'win' | 'lose' | 'draw' | null;

interface RoundHistory {
  id: number;
  player: Choice;
  computer: Choice;
  outcome: Outcome;
}

const CHOICES: { id: Choice; label: string; beats: Choice; key: string }[] = [
  { id: 'rock', label: 'Rock', beats: 'scissors', key: '1' },
  { id: 'paper', label: 'Paper', beats: 'rock', key: '2' },
  { id: 'scissors', label: 'Scissors', beats: 'paper', key: '3' },
];

export const RPSGame: React.FC = () => {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [history, setHistory] = useState<RoundHistory[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState<number>(() => {
    return StorageService.getHighScores().rps || 0;
  });
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  const playRound = (choice: Choice) => {
    if (isRevealing) return;

    Sound.click();
    setIsRevealing(true);
    setPlayerChoice(choice);
    setComputerChoice(null);
    setOutcome(null);

    // AI chooses
    setTimeout(() => {
      const randomChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
      setComputerChoice(randomChoice);

      let roundOutcome: Outcome;
      if (choice === randomChoice) {
        roundOutcome = 'draw';
        Sound.playBeep(330, 0.08, 'sine', 0.1);
        setStats((s) => ({ ...s, draws: s.draws + 1 }));
      } else if (
        (choice === 'rock' && randomChoice === 'scissors') ||
        (choice === 'paper' && randomChoice === 'rock') ||
        (choice === 'scissors' && randomChoice === 'paper')
      ) {
        roundOutcome = 'win';
        Sound.win();
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        if (nextStreak > bestStreak) {
          setBestStreak(nextStreak);
          StorageService.saveHighScore('rps', nextStreak, true);
        }
        setStats((s) => ({ ...s, wins: s.wins + 1 }));
      } else {
        roundOutcome = 'lose';
        Sound.gameOver();
        setStreak(0);
        setStats((s) => ({ ...s, losses: s.losses + 1 }));
      }

      setOutcome(roundOutcome);
      setIsRevealing(false);

      setHistory((prev) => [
        {
          id: Date.now(),
          player: choice,
          computer: randomChoice,
          outcome: roundOutcome,
        },
        ...prev.slice(0, 4),
      ]);

      StorageService.addRecentlyPlayed('rps', streak);
    }, 400);
  };

  const resetStats = () => {
    setStats({ wins: 0, losses: 0, draws: 0 });
    setStreak(0);
    setPlayerChoice(null);
    setComputerChoice(null);
    setOutcome(null);
    setHistory([]);
    Sound.click();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') playRound('rock');
      if (e.key === '2') playRound('paper');
      if (e.key === '3') playRound('scissors');
      if (e.key === 'r' || e.key === 'R') resetStats();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const renderIcon = (c: Choice | null, size = 32) => {
    if (!c) return null;
    switch (c) {
      case 'rock':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 7 12 3 19 7 21 15 15 21 7 20 3 14" fill="currentColor" fillOpacity="0.2" />
          </svg>
        );
      case 'paper':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="4" width="14" height="16" rx="2" fill="currentColor" fillOpacity="0.2" />
            <line x1="8" y1="9" x2="16" y2="9" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="13" y2="17" />
          </svg>
        );
      case 'scissors':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="8.5" y1="8.5" x2="19" y2="19" />
            <line x1="8.5" y1="15.5" x2="19" y2="5" />
          </svg>
        );
    }
  };

  const totalGames = stats.wins + stats.losses + stats.draws;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Telemetry bar */}
      <div className="grid grid-cols-4 gap-2 w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] p-3 text-center">
        <div>
          <div className="text-xs uppercase font-mono text-[var(--text-muted)]">Wins</div>
          <div className="text-lg font-bold font-mono text-[var(--color-success)]">{stats.wins}</div>
        </div>
        <div>
          <div className="text-xs uppercase font-mono text-[var(--text-muted)]">Losses</div>
          <div className="text-lg font-bold font-mono text-[var(--color-danger)]">{stats.losses}</div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-xs uppercase font-mono text-[var(--text-muted)]">
            <Flame size={12} className="text-[var(--color-accent)]" /> Streak
          </div>
          <div className="text-lg font-bold font-mono text-[var(--color-accent)]">{streak}</div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-xs uppercase font-mono text-[var(--text-muted)]">
            <Trophy size={12} className="text-[var(--color-accent)]" /> Best
          </div>
          <div className="text-lg font-bold font-mono text-[var(--color-accent)]">{bestStreak}</div>
        </div>
      </div>

      {/* Showdown Duel Stage */}
      <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-medium)] rounded-[var(--radius-md)] p-6 shadow-card flex flex-col items-center">
        <div className="flex items-center justify-around w-full mb-6">
          {/* Player Choice */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono uppercase text-[var(--text-muted)]">You</span>
            <div className={`w-20 h-20 rounded-[var(--radius-sm)] border flex items-center justify-center transition-all ${
              playerChoice
                ? 'bg-[var(--bg-elevated)] border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-muted)]'
            }`}>
              {playerChoice ? renderIcon(playerChoice, 36) : <span className="font-mono text-sm">?</span>}
            </div>
            <span className="text-xs font-semibold capitalize">
              {playerChoice || 'Awaiting'}
            </span>
          </div>

          <div className="text-xl font-bold font-mono text-[var(--text-muted)]">VS</div>

          {/* Computer Choice */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono uppercase text-[var(--text-muted)]">Computer</span>
            <div className={`w-20 h-20 rounded-[var(--radius-sm)] border flex items-center justify-center transition-all ${
              isRevealing
                ? 'bg-[var(--bg-elevated)] border-[var(--border-medium)] text-[var(--text-muted)] animate-pulse'
                : computerChoice
                ? 'bg-[var(--bg-elevated)] border-[var(--text-secondary)] text-[var(--text-primary)]'
                : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-muted)]'
            }`}>
              {computerChoice ? renderIcon(computerChoice, 36) : <span className="font-mono text-sm">?</span>}
            </div>
            <span className="text-xs font-semibold capitalize">
              {computerChoice || (isRevealing ? 'Rolling...' : 'Awaiting')}
            </span>
          </div>
        </div>

        {/* Round Outcome Callout */}
        <div className="min-h-[44px] flex items-center justify-center w-full">
          {outcome === 'win' && (
            <div className="badge badge-accent text-sm px-4 py-1.5 font-bold animate-scale-in">
              VICTORY &bull; Win Streak Maintained
            </div>
          )}
          {outcome === 'lose' && (
            <div className="badge text-sm px-4 py-1.5 font-bold border-[var(--color-danger)] text-[var(--color-danger)] animate-scale-in">
              DEFEAT &bull; Streak Reset
            </div>
          )}
          {outcome === 'draw' && (
            <div className="badge text-sm px-4 py-1.5 font-bold border-[var(--border-medium)] text-[var(--text-secondary)] animate-scale-in">
              STALEMATE &bull; Identical Selection
            </div>
          )}
          {!outcome && !isRevealing && (
            <div className="text-xs font-mono text-[var(--text-muted)]">
              Select your tactical play below
            </div>
          )}
        </div>
      </div>

      {/* Choice Buttons */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {CHOICES.map((item) => (
          <button
            key={item.id}
            onClick={() => playRound(item.id)}
            disabled={isRevealing}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] hover:border-[var(--color-accent)] hover:bg-[var(--bg-elevated)] active:bg-[var(--color-accent-subtle)] transition-all group"
          >
            <div className="text-[var(--text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">
              {renderIcon(item.id, 28)}
            </div>
            <div className="text-sm font-semibold">{item.label}</div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">[{item.key}]</span>
          </button>
        ))}
      </div>

      {/* Control Actions & Rate */}
      <div className="flex items-center justify-between w-full text-xs font-mono text-[var(--text-muted)]">
        <div>Win Rate: {winRate}% ({totalGames} rounds)</div>
        <button onClick={resetStats} className="btn btn-ghost btn-sm text-xs">
          <RotateCcw size={13} /> Reset Record
        </button>
      </div>

      {/* Recent Round Feed */}
      {history.length > 0 && (
        <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] p-3">
          <div className="text-xs font-mono text-[var(--text-muted)] uppercase mb-2">Recent Encounters</div>
          <div className="flex flex-col gap-1.5">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-xs font-mono py-1 border-b border-[var(--border-subtle)]/50 last:border-none">
                <span className="capitalize text-[var(--text-primary)]">You: {h.player}</span>
                <span className="capitalize text-[var(--text-secondary)]">AI: {h.computer}</span>
                <span className={`font-bold uppercase ${
                  h.outcome === 'win' ? 'text-[var(--color-success)]' : h.outcome === 'lose' ? 'text-[var(--color-danger)]' : 'text-[var(--text-muted)]'
                }`}>
                  {h.outcome}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
