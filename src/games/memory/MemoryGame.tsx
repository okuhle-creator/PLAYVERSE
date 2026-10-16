import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Clock, Award, CheckCircle2 } from 'lucide-react';
import { Sound } from '../../services/sound';
import { StorageService } from '../../services/storage';

interface MemoryCard {
  id: number;
  symbolId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// 8 Distinctive Minimalist SVG Glyphs
const GLYPH_SYMBOLS = [
  'prism',
  'compass',
  'hexagon',
  'orbit',
  'delta',
  'crosshair',
  'gem',
  'nexus',
] as const;

type GlyphType = (typeof GLYPH_SYMBOLS)[number];

const renderGlyph = (type: GlyphType) => {
  switch (type) {
    case 'prism':
      return (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 22 22 22" />
          <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="2 2" />
        </svg>
      );
    case 'compass':
      return (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polygon points="12 6 15 12 12 18 9 12" fill="currentColor" opacity="0.3" />
        </svg>
      );
    case 'hexagon':
      return (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      );
    case 'orbit':
      return (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      );
    case 'delta':
      return (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="4 20 12 4 20 20" />
          <circle cx="12" cy="15" r="2" fill="currentColor" />
        </svg>
      );
    case 'crosshair':
      return (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <line x1="12" y1="2" x2="12" y2="7" />
          <line x1="12" y1="17" x2="12" y2="22" />
          <line x1="2" y1="12" x2="7" y2="12" />
          <line x1="17" y1="12" x2="22" y2="12" />
        </svg>
      );
    case 'gem':
      return (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="6 3 18 3 22 9 12 21 2 9" />
          <line x1="2" y1="9" x2="22" y2="9" />
          <polyline points="9 3 12 9 15 3" />
        </svg>
      );
    case 'nexus':
      return (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <circle cx="12" cy="20" r="2" fill="currentColor" />
          <circle cx="4" cy="12" r="2" fill="currentColor" />
          <circle cx="20" cy="12" r="2" fill="currentColor" />
          <line x1="12" y1="6" x2="12" y2="8" />
          <line x1="12" y1="16" x2="12" y2="18" />
          <line x1="6" y1="12" x2="8" y2="12" />
          <line x1="16" y1="12" x2="18" y2="12" />
        </svg>
      );
  }
};

export const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const bestTime = StorageService.getHighScores().memory;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and shuffle 16 cards (8 pairs)
  const initializeBoard = useCallback(() => {
    const deck: MemoryCard[] = [];
    const pool = [...GLYPH_SYMBOLS, ...GLYPH_SYMBOLS];
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    pool.forEach((symbol, index) => {
      deck.push({
        id: index,
        symbolId: symbol,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setTimer(0);
    setIsActive(false);
    setIsCompleted(false);
    setIsLocked(false);
  }, []);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Timer loop
  useEffect(() => {
    if (isActive && !isCompleted) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isCompleted]);

  const handleCardClick = (index: number) => {
    // Prevent interaction if locked, card already flipped or matched
    if (isLocked) return;
    const clickedCard = cards[index];
    if (clickedCard.isFlipped || clickedCard.isMatched) return;

    if (!isActive) {
      setIsActive(true);
    }

    Sound.cardFlip();

    // Flip the clicked card
    const updatedCards = cards.map((c, i) => (i === index ? { ...c, isFlipped: true } : c));
    const newFlipped = [...flippedIndices, index];

    setCards(updatedCards);
    setFlippedIndices(newFlipped);

    // If two cards are flipped, check for match
    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = updatedCards[firstIdx];
      const secondCard = updatedCards[secondIdx];

      if (firstCard.symbolId === secondCard.symbolId) {
        // MATCH!
        Sound.cardMatch();
        setTimeout(() => {
          setCards((prev) => {
            const next = prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
            );
            // Check completion
            if (next.every((c) => c.isMatched)) {
              setIsCompleted(true);
              setIsActive(false);
              Sound.win();
              StorageService.saveHighScore('memory', timer + 1, false); // lower is better
              StorageService.addRecentlyPlayed('memory', timer + 1);
            }
            return next;
          });
          setFlippedIndices([]);
        }, 300);
      } else {
        // NO MATCH -> Flip back after delay
        setIsLocked(true);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Telemetry bar */}
      <div className="flex items-center justify-between w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[var(--text-muted)]" />
          <span className="text-xs uppercase font-mono text-[var(--text-muted)] tracking-wider">Time</span>
          <span className="text-xl font-bold font-mono text-[var(--text-primary)]">{formatTimer(timer)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono text-[var(--text-muted)] tracking-wider">Moves</span>
          <span className="text-xl font-bold font-mono text-[var(--text-primary)]">{moves}</span>
        </div>
        <div className="flex items-center gap-2">
          <Award size={16} className="text-[var(--color-accent)]" />
          <span className="text-xs uppercase font-mono text-[var(--text-muted)] tracking-wider">Best</span>
          <span className="text-sm font-bold font-mono text-[var(--color-accent)]">
            {bestTime ? formatTimer(bestTime) : '--:--'}
          </span>
        </div>
        <button onClick={initializeBoard} className="btn btn-secondary btn-sm" aria-label="Reset memory game">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* 4x4 Memory Grid */}
      <div className="relative w-full max-w-[420px] aspect-square bg-[var(--bg-surface)] border border-[var(--border-medium)] rounded-[var(--radius-md)] p-3 shadow-card">
        <div className="grid grid-cols-4 grid-rows-4 gap-2.5 w-full h-full">
          {cards.map((card, index) => {
            const isRevealed = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                disabled={card.isMatched || isLocked}
                aria-label={`Card ${index + 1}`}
                className={`relative w-full h-full rounded-[var(--radius-sm)] border transition-all duration-200 flex items-center justify-center ${
                  card.isMatched
                    ? 'bg-[var(--bg-elevated)] border-[var(--color-accent)] text-[var(--color-accent)] opacity-85'
                    : isRevealed
                    ? 'bg-[var(--bg-elevated)] border-[var(--border-medium)] text-[var(--text-primary)] shadow-sm'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {isRevealed ? (
                  <div className="animate-scale-in">
                    {renderGlyph(card.symbolId as GlyphType)}
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[var(--border-subtle)] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-medium)]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Victory Celebration Overlay */}
        {isCompleted && (
          <div className="absolute inset-0 bg-[#0F1013]/92 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <CheckCircle2 size={44} className="text-[var(--color-accent)] mb-2" />
            <span className="badge badge-accent mb-2">Memory Matrix Cleared</span>
            <h3 className="text-2xl font-bold mb-2">Pattern Synchronized!</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Solved in <strong className="text-[var(--text-primary)] font-mono">{formatTimer(timer)}</strong> across{' '}
              <strong className="text-[var(--text-primary)] font-mono">{moves} moves</strong>.
            </p>
            <button onClick={initializeBoard} className="btn btn-primary">
              <RotateCcw size={16} /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
