import React from 'react';
import { Sun, Moon, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Theme } from '../app/types';

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  onNavigateHome: () => void;
  onNavigateCategories: () => void;
  onNavigateAllGames: () => void;
}

export const Navbar: React.FC<Props> = ({
  theme,
  onToggleTheme,
  isMuted,
  onToggleSound,
  onNavigateHome,
  onNavigateCategories,
  onNavigateAllGames,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/90 backdrop-blur-md transition-colors">
      <div className="container flex items-center justify-between h-16">
        {/* PLAYVERSE Wordmark */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 group text-left"
          aria-label="PLAYVERSE Home"
        >
          {/* Minimalist Portal Logo */}
          <div className="w-8 h-8 rounded-[var(--radius-xs)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] group-hover:border-[var(--color-accent)] flex items-center justify-center transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="12 2 22 8 22 16 12 22 2 16 2 8" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg leading-none flex items-center gap-1.5">
              PLAYVERSE
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
            </span>
            <span className="hidden sm:block text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
              Browser Arcade
            </span>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={onNavigateHome}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Home
          </button>
          <button
            onClick={onNavigateAllGames}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            All Games
          </button>
          <button
            onClick={onNavigateCategories}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Categories
          </button>
        </nav>

        {/* Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Day 4 Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-mono text-[var(--text-secondary)]">
            <Sparkles size={12} className="text-[var(--color-accent)]" />
            <span>DAY 04</span>
          </div>
        </div>
      </div>
    </header>
  );
};
