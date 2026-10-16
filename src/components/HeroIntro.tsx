import React from 'react';
import { ArrowDown, Gamepad2, Compass } from 'lucide-react';

interface Props {
  onExploreClick: () => void;
  totalGames: number;
}

export const HeroIntro: React.FC<Props> = ({ onExploreClick, totalGames }) => {
  return (
    <section className="py-8 md:py-12 border-b border-[var(--border-subtle)]">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-accent">
                <Gamepad2 size={12} /> Independent Arcade
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {totalGames} Fully Playable Titles
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
              One portal. <span className="text-[var(--color-accent)]">Endless play.</span>
            </h1>

            <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
              A curated suite of responsive browser games engineered with authentic mechanics,
              keyboard controls, and zero distractions.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={onExploreClick}
              className="btn btn-primary"
            >
              <Compass size={16} /> Explore Games
              <ArrowDown size={14} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
