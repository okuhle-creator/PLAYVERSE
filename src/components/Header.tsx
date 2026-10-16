import React from 'react';
import type { GameDifficulty, ChallengeType, PersonalStats } from '../features/game/gameTypes';
import { formatScore } from '../features/game/scoringDisplay';

interface HeaderProps {
  difficulty: GameDifficulty;
  challengeType: ChallengeType;
  stats: PersonalStats;
  onSelectDifficulty: (d: GameDifficulty) => void;
  onSelectChallengeType: (t: ChallengeType) => void;
  isGameActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  difficulty,
  challengeType,
  stats,
  onSelectDifficulty,
  onSelectChallengeType,
  isGameActive
}) => {
  return (
    <header className="header-container" role="banner">
      <div className="header-top">
        <div>
          <div className="brand-title">
            <span>GLITCH HUNT</span>
            <span className="brand-tag">v1.0</span>
          </div>
          <div className="brand-subtitle">Signal Breach — Telemetry Deduction Engine</div>
        </div>

        <div className="header-stats" aria-label="Player Records">
          <div className="stat-box">
            <span className="stat-label">Best Record</span>
            <span className="stat-val">{formatScore(stats.highScore)}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Streak</span>
            <span className="stat-val">{stats.currentStreak}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Cases Won</span>
            <span className="stat-val">
              {stats.gamesWon}/{stats.gamesPlayed}
            </span>
          </div>
        </div>
      </div>

      <div className="mode-selector" role="toolbar" aria-label="Game Configuration">
        <span className="mode-label">Mode:</span>
        <button
          type="button"
          className={`tab-btn ${challengeType === 'standard' ? 'active' : ''}`}
          onClick={() => onSelectChallengeType('standard')}
          disabled={isGameActive}
          aria-pressed={challengeType === 'standard'}
        >
          Investigation
        </button>
        <button
          type="button"
          className={`tab-btn ${challengeType === 'daily' ? 'active' : ''}`}
          onClick={() => onSelectChallengeType('daily')}
          disabled={isGameActive}
          aria-pressed={challengeType === 'daily'}
        >
          Daily Challenge
        </button>

        {challengeType === 'standard' && (
          <>
            <span className="mode-label" style={{ marginLeft: '12px' }}>
              Difficulty:
            </span>
            {(['easy', 'normal', 'hard'] as GameDifficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                className={`tab-btn ${difficulty === d ? 'active' : ''}`}
                onClick={() => onSelectDifficulty(d)}
                disabled={isGameActive}
                aria-pressed={difficulty === d}
              >
                {d}
              </button>
            ))}
          </>
        )}
      </div>
    </header>
  );
};
