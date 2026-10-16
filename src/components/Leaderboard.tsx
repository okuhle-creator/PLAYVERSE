import React from 'react';
import type { LeaderboardItem, PersonalStats } from '../features/game/gameTypes';
import { ACHIEVEMENTS_LIST } from '../features/game/storage';
import { formatScore } from '../features/game/scoringDisplay';

interface LeaderboardProps {
  entries: LeaderboardItem[];
  stats: PersonalStats;
  isLoading: boolean;
  onRefresh: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  stats,
  isLoading,
  onRefresh
}) => {
  return (
    <section className="leaderboard-section" aria-label="Leaderboard and Achievements">
      <div className="leaderboard-header">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Top Operator Scores</h3>
        <button
          type="button"
          className="btn-secondary"
          onClick={onRefresh}
          disabled={isLoading}
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
        >
          {isLoading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {entries.length === 0 ? (
        <p style={{ fontSize: '0.875rem', padding: 'var(--space-md) 0' }}>
          {isLoading ? 'Loading leaderboard scores...' : 'No confirmed scores recorded yet. Be the first operator to isolate a breach!'}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="leaderboard-table" aria-label="High Scores Table">
            <thead>
              <tr>
                <th className="rank-col">#</th>
                <th>Operator</th>
                <th>Challenge</th>
                <th>Recorded</th>
                <th className="score-col">Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="rank-col">{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{item.alias}</td>
                  <td style={{ textTransform: 'capitalize' }}>{item.challengeType}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="score-col">{formatScore(item.score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <hr />

      <div>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
          Operator Achievements
        </h4>
        <div className="achievements-grid">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isEarned = Boolean(stats.achievements[ach.id]);
            return (
              <div
                key={ach.id}
                className={`achievement-card ${isEarned ? 'earned' : ''}`}
                title={ach.description}
              >
                <div className="achievement-title">
                  <span>{ach.title}</span>
                  <span className="mono" style={{ fontSize: '0.6875rem' }}>
                    {isEarned ? '✓ EARNED' : 'LOCKED'}
                  </span>
                </div>
                <div className="achievement-desc">{ach.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
