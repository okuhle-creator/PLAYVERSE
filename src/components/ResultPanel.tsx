import React, { useState } from 'react';
import type { EvaluationResult } from '../features/game/gameTypes';
import { formatMs, formatScore } from '../features/game/scoringDisplay';
import { submitLeaderboardScore } from '../features/game/gameApi';

interface ResultPanelProps {
  result: EvaluationResult;
  gameId: string;
  isDaily: boolean;
  onPlayAgain: () => void;
  onSwitchToDaily: () => void;
  onScoreClaimed: () => void;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  result,
  gameId,
  isDaily,
  onPlayAgain,
  onSwitchToDaily,
  onScoreClaimed
}) => {
  const [alias, setAlias] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLeaderboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await submitLeaderboardScore(gameId, alias.trim());
      setClaimStatus('success');
      onScoreClaimed();
    } catch (err: unknown) {
      setClaimStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const outcomeClass = result.correct ? 'outcome-success' : 'outcome-failure';

  return (
    <section
      className={`result-panel ${outcomeClass}`}
      aria-live="polite"
      aria-label="Investigation Conclusion"
    >
      <div className="result-header">
        <div>
          <span
            className={`result-outcome-badge ${
              result.correct ? 'badge-outcome-success' : 'badge-outcome-failure'
            }`}
          >
            {result.correct ? 'Verdict: Confirmed Anomaly' : 'Verdict: False Positive'}
          </span>
          <h2 className="result-headline">
            {result.correct ? 'Signal Breach Isolated' : 'Contradiction Missed'}
          </h2>
        </div>

        <div className="result-metrics">
          <div className="stat-box">
            <span className="stat-label">Response Time</span>
            <span className="stat-val">{formatMs(result.elapsedMs)}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Points Earned</span>
            <span
              className="stat-val"
              style={{ color: result.correct ? 'var(--color-signal)' : 'var(--color-graphite)' }}
            >
              +{formatScore(result.score)}
            </span>
          </div>
        </div>
      </div>

      <div className="explanation-box">
        <span className="explanation-title">Telemetry Forensics & Evidence Chain</span>
        <p className="explanation-text">{result.explanation}</p>
      </div>

      {result.correct && result.score > 0 && claimStatus !== 'success' && (
        <form className="leaderboard-claim-form" onSubmit={handleLeaderboardSubmit}>
          <span className="explanation-title">Record Score on Public Leaderboard</span>
          <div className="claim-input-group">
            <input
              type="text"
              className="alias-input"
              placeholder="Operator Alias (e.g. Lynx-7)"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              maxLength={16}
              minLength={2}
              pattern="^[a-zA-Z0-9_\-. ]{2,16}$"
              required
              aria-label="Operator Alias"
            />
            <button
              type="submit"
              className="btn-secondary"
              disabled={isSubmitting || alias.trim().length < 2}
            >
              {isSubmitting ? 'Verifying...' : 'Submit to Leaderboard'}
            </button>
          </div>
          {claimStatus === 'error' && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-crit)' }}>
              {errorMessage}
            </span>
          )}
        </form>
      )}

      {claimStatus === 'success' && (
        <div style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
          ✓ Verified server score recorded on public leaderboard.
        </div>
      )}

      <div className="action-row">
        <button type="button" className="btn-primary" onClick={onPlayAgain}>
          Run It Back (Next Case)
        </button>

        {!isDaily && (
          <button type="button" className="btn-secondary" onClick={onSwitchToDaily}>
            Attempt Daily Challenge
          </button>
        )}
      </div>
    </section>
  );
};
