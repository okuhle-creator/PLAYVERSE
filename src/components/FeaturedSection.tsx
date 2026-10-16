import React from 'react';
import { Play, Flame } from 'lucide-react';
import { GameMetadata, HighScores } from '../app/types';
import { GameThumbnail } from './GameThumbnail';

interface Props {
  featuredGames: GameMetadata[];
  highScores: HighScores;
  onPlay: (game: GameMetadata) => void;
}

export const FeaturedSection: React.FC<Props> = ({ featuredGames, highScores, onPlay }) => {
  if (featuredGames.length === 0) return null;

  return (
    <section className="py-6 border-b border-[var(--border-subtle)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-[var(--color-accent)]" />
          <h2 className="text-sm font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
            Featured Spotlight
          </h2>
        </div>
        <span className="text-xs font-mono text-[var(--text-muted)]">Curated Arcade Selection</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featuredGames.map((game) => {
          const score = highScores[game.id];
          return (
            <div
              key={game.id}
              className="card overflow-hidden group hover:border-[var(--color-accent)] transition-all flex flex-col justify-between"
            >
              <div>
                <GameThumbnail gameId={game.id} />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="badge badge-accent text-[10px]">{game.category}</span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">{game.difficulty}</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--color-accent)] transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                    {game.tagline}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-[var(--border-subtle)]/50 mt-auto pt-3">
                <span className="text-xs font-mono text-[var(--text-muted)] truncate max-w-[140px]">
                  {score !== undefined ? `Record: ${game.formatScore(score)}` : 'Ready to play'}
                </span>
                <button
                  onClick={() => onPlay(game)}
                  className="btn btn-secondary btn-sm group-hover:btn-primary"
                >
                  <Play size={12} className="fill-current" /> Play
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
