import React from 'react';
import { History, Play, Trash2 } from 'lucide-react';
import { GameMetadata, RecentlyPlayedItem } from '../app/types';

interface Props {
  recentlyPlayed: RecentlyPlayedItem[];
  gamesMap: Record<string, GameMetadata>;
  onPlay: (game: GameMetadata) => void;
  onClear: () => void;
}

export const RecentlyPlayed: React.FC<Props> = ({
  recentlyPlayed,
  gamesMap,
  onPlay,
  onClear,
}) => {
  if (recentlyPlayed.length === 0) return null;

  const formatTimeAgo = (timestamp: number) => {
    const elapsed = Date.now() - timestamp;
    const mins = Math.floor(elapsed / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <section className="py-6 border-b border-[var(--border-subtle)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[var(--color-accent)]" />
          <h2 className="text-sm font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
            Recently Played
          </h2>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            ({recentlyPlayed.length})
          </span>
        </div>
        <button
          onClick={onClear}
          className="btn btn-ghost btn-sm text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          title="Clear recent play activity"
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {recentlyPlayed.map((item) => {
          const game = gamesMap[item.gameId];
          if (!game) return null;

          return (
            <div
              key={item.gameId}
              onClick={() => onPlay(game)}
              className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] hover:border-[var(--color-accent)] hover:bg-[var(--bg-elevated)] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block mb-1">
                  {game.category}
                </span>
                <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                  {game.title}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-[var(--border-subtle)]/40 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                <span>{formatTimeAgo(item.timestamp)}</span>
                <Play size={10} className="text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity fill-current" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
