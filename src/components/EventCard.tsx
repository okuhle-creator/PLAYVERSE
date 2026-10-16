import React from 'react';
import type { TelemetryEvent } from '../features/game/gameTypes';
import { formatIsoTime } from '../features/game/scoringDisplay';

interface EventCardProps {
  event: TelemetryEvent;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled: boolean;
  isRevealed?: boolean;
  isAnomaly?: boolean;
  isFalsePositive?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  index,
  isSelected,
  onSelect,
  disabled,
  isRevealed = false,
  isAnomaly = false,
  isFalsePositive = false
}) => {
  let cardStateClass = '';
  if (isSelected) {
    cardStateClass = 'selected';
  }
  if (isRevealed) {
    if (isAnomaly) {
      cardStateClass = 'anomaly-revealed';
    } else if (isFalsePositive) {
      cardStateClass = 'false-positive';
    } else {
      cardStateClass = 'muted';
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onSelect(event.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      aria-label={`Telemetry event ${index + 1}: ${event.source}, level ${event.level}, metric ${event.metric} is ${event.value}`}
      className={`event-card ${cardStateClass}`}
      onClick={() => !disabled && onSelect(event.id)}
      onKeyDown={handleKeyDown}
    >
      <div className="card-top-row">
        <span className="card-index">SIGNAL #{index + 1}</span>
        <span className={`card-level-badge badge-${event.level}`}>{event.level}</span>
      </div>

      <div className="card-source">{event.source}</div>
      <div className="card-timestamp">{formatIsoTime(event.timestamp)}</div>

      <p className="card-message">{event.message}</p>

      <div className="card-metric-footer">
        <span className="metric-name">{event.metric}</span>
        <span className="metric-value">{event.value}</span>
      </div>

      {isSelected && !isRevealed && (
        <div className="card-selection-marker" aria-live="polite">
          <span>●</span> SUSPECT TARGET
        </div>
      )}

      {isRevealed && isAnomaly && (
        <div className="card-selection-marker" style={{ color: 'var(--color-signal)' }}>
          <span>▲</span> CONFIRMED ANOMALY
        </div>
      )}

      {isRevealed && isFalsePositive && (
        <div className="card-selection-marker" style={{ color: 'var(--color-graphite)' }}>
          <span>✕</span> FALSE SUSPICION
        </div>
      )}
    </div>
  );
};
