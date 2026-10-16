import React, { useEffect, useState } from 'react';
import type { GameSession, EvaluationResult } from '../features/game/gameTypes';
import { EventCard } from './EventCard';

interface GameBoardProps {
  session: GameSession;
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
  onSubmitDeduction: () => void;
  onAbort: () => void;
  isEvaluating: boolean;
  result: EvaluationResult | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  session,
  selectedEventId,
  onSelectEvent,
  onSubmitDeduction,
  onAbort,
  isEvaluating,
  result
}) => {
  const [remainingMs, setRemainingMs] = useState<number>(session.timeLimitMs);

  // Live timer countdown
  useEffect(() => {
    if (result) return; // Freeze timer on result

    const startTime = new Date(session.startedAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const left = Math.max(0, session.timeLimitMs - elapsed);
      setRemainingMs(left);
    }, 100);

    return () => clearInterval(interval);
  }, [session, result]);

  // Keyboard shortcut listener (1-5 to select, Enter to submit)
  useEffect(() => {
    if (result || isEvaluating) return;

    const handleKey = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= session.events.length) {
        onSelectEvent(session.events[num - 1].id);
      } else if (e.key === 'Enter' && selectedEventId) {
        onSubmitDeduction();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [session.events, selectedEventId, isEvaluating, result, onSelectEvent, onSubmitDeduction]);

  const progressPercent = Math.max(0, Math.min(100, (remainingMs / session.timeLimitMs) * 100));
  const remainingSecs = (remainingMs / 1000).toFixed(1);

  return (
    <section className="board-container" aria-label="Investigation Console">
      <div className="board-status-bar">
        <div className="status-left">
          <span>CASE REF: <strong className="mono">{session.gameId.slice(0, 8)}</strong></span>
          <span>DIFFICULTY: <strong className="mono">{session.difficulty.toUpperCase()}</strong></span>
        </div>

        <div className="status-right">
          <div className="timer-indicator" aria-live="off">
            <span>TIMER: {remainingSecs}s</span>
            <div className="timer-progress-wrap" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="timer-progress-fill"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: progressPercent < 20 ? 'var(--color-crit)' : 'var(--color-signal)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="events-grid" role="group" aria-label="5 Telemetry Signals">
        {session.events.map((evt, idx) => (
          <EventCard
            key={evt.id}
            event={evt}
            index={idx}
            isSelected={selectedEventId === evt.id}
            onSelect={onSelectEvent}
            disabled={isEvaluating || Boolean(result)}
            isRevealed={Boolean(result)}
            isAnomaly={result ? evt.id === result.anomalyId : false}
            isFalsePositive={result ? !result.correct && evt.id === result.selectedId : false}
          />
        ))}
      </div>

      {!result && (
        <div className="action-row" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onAbort}
            disabled={isEvaluating}
          >
            Abort Case
          </button>

          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--color-graphite)' }}>
              Keyboard: [1-5] to target, [Enter] to commit
            </span>
            <button
              type="button"
              className="btn-primary"
              onClick={onSubmitDeduction}
              disabled={!selectedEventId || isEvaluating}
            >
              {isEvaluating ? 'Evaluating Evidence...' : 'Commit Deduction'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
