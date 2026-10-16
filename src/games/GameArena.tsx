import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Gamepad2, Trophy } from 'lucide-react';
import { GameMetadata } from '../app/types';
import { SnakeGame } from './snake/SnakeGame';
import { Game2048 } from './2048/Game2048';
import { MemoryGame } from './memory/MemoryGame';
import { TicTacToeGame } from './tictactoe/TicTacToeGame';
import { RPSGame } from './rps/RPSGame';
import { ReactionGame } from './reaction/ReactionGame';

interface Props {
  game: GameMetadata;
  highScore?: number;
  onBack: () => void;
}

export const GameArena: React.FC<Props> = ({ game, highScore, onBack }) => {
  const [activeTab, setActiveTab] = useState<'arena' | 'guide'>('arena');

  const renderActiveGame = () => {
    switch (game.id) {
      case 'snake':
        return <SnakeGame />;
      case '2048':
        return <Game2048 />;
      case 'memory':
        return <MemoryGame />;
      case 'tictactoe':
        return <TicTacToeGame />;
      case 'rps':
        return <RPSGame />;
      case 'reaction':
        return <ReactionGame />;
      default:
        return <div>Game not found</div>;
    }
  };

  return (
    <div className="w-full py-6 animate-fade-in">
      <div className="container max-w-4xl">
        {/* Breadcrumb & Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-subtle)]">
          <button
            onClick={onBack}
            className="btn btn-secondary btn-sm"
            aria-label="Back to Arcade"
          >
            <ArrowLeft size={15} /> Back to Arcade
          </button>

          {/* Quick tab switcher */}
          <div className="flex bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xs)] p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('arena')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-xs)] transition-all ${
                activeTab === 'arena'
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Gamepad2 size={13} /> Play Arena
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-xs)] transition-all ${
                activeTab === 'guide'
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <BookOpen size={13} /> Rules & Keys
            </button>
          </div>
        </div>

        {/* Game Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge badge-accent text-[11px]">{game.category}</span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Difficulty: {game.difficulty}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
              {game.title}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {game.tagline}
            </p>
          </div>

          {highScore !== undefined && (
            <div className="flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-2.5 rounded-[var(--radius-sm)] self-start md:self-auto">
              <Trophy size={20} className="text-[var(--color-accent)]" />
              <div>
                <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">
                  Personal Best ({game.scoreLabel})
                </span>
                <span className="text-base font-bold font-mono text-[var(--text-primary)]">
                  {game.formatScore(highScore)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* View Content */}
        {activeTab === 'arena' ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 md:p-8 shadow-card flex flex-col items-center justify-center min-h-[460px]">
            {renderActiveGame()}
          </div>
        ) : (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-6 md:p-8 shadow-card space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <BookOpen size={18} className="text-[var(--color-accent)]" />
                Instructions & Rules
              </h2>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)] list-disc pl-5">
                {game.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Gamepad2 size={18} className="text-[var(--color-accent)]" />
                Keyboard & Controls
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {game.controls.map((ctrl, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xs)] text-xs font-mono"
                  >
                    <kbd className="px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-medium)] rounded text-[var(--text-primary)] font-bold">
                      {ctrl.key}
                    </kbd>
                    <span className="text-[var(--text-secondary)]">{ctrl.action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end">
              <button
                onClick={() => setActiveTab('arena')}
                className="btn btn-primary btn-sm"
              >
                Return to Play Arena
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
