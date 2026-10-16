import React from 'react';
import { Play, Trophy, Sparkles } from 'lucide-react';
import { GameMetadata } from '../app/types';
import { GameThumbnail } from './GameThumbnail';

interface Props {
  game: GameMetadata;
  highScore?: number;
  onPlay: (game: GameMetadata) => void;
}

export const GameCard: React.FC<Props> = ({ game, highScore, onPlay }) => {
  return (
    <div className="card group overflow-hidden flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-200">
      <div>
        {/* Visual Artwork Thumbnail */}
        <div className="relative">
          <GameThumbnail gameId={game.id} />
          {game.featured && (
            <div className="absolute top-2.5 right-2.5 bg-[var(--bg-canvas)]/90 border border-[var(--color-accent-border)] text-[var(--color-accent)] px-2 py-0.5 rounded-[var(--radius-xs)] text-[10px] font-mono font-bold uppercase flex items-center gap-1 shadow-sm backdrop-blur-sm">
              <Sparkles size={10} /> Spotlight
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4 md:p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-medium">
              {game.category}
            </span>
            <span className="text-[11px] font-mono text-[var(--text-secondary)]">
              {game.difficulty}
            </span>
          </div>

          <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--color-accent)] transition-colors mb-1.5">
            {game.title}
          </h3>

          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-4">
            {game.description}
          </p>
        </div>
      </div>

      {/* Footer bar with Best score and Play Button */}
      <div className="px-4 pb-4 md:px-5 md:pb-5 pt-0 flex items-center justify-between border-t border-[var(--border-subtle)]/60 mt-auto pt-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)]">
          {highScore !== undefined ? (
            <>
              <Trophy size={13} className="text-[var(--color-accent)] shrink-0" />
              <span className="text-[var(--text-primary)] font-semibold truncate max-w-[120px]">
                {game.formatScore(highScore)}
              </span>
            </>
          ) : (
            <span className="text-[11px]">No record yet</span>
          )}
        </div>

        <button
          onClick={() => onPlay(game)}
          className="btn btn-primary btn-sm group/btn"
          aria-label={`Play ${game.title}`}
        >
          <Play size={13} className="fill-current transition-transform group-hover/btn:scale-110" />
          Play Game
        </button>
      </div>
    </div>
  );
};
