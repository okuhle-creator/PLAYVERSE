import React from 'react';
import { GameId } from '../app/types';

interface Props {
  gameId: GameId;
  className?: string;
}

export const GameThumbnail: React.FC<Props> = ({ gameId, className = '' }) => {
  const baseBox = "w-full aspect-[16/10] bg-[var(--bg-elevated)] overflow-hidden relative flex items-center justify-center border-b border-[var(--border-subtle)]";

  switch (gameId) {
    case 'snake':
      return (
        <div className={`${baseBox} ${className}`}>
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Subtle Grid */}
            <defs>
              <pattern id="snake-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[var(--border-subtle)]" opacity="0.6" />
              </pattern>
            </defs>
            <rect width="320" height="200" fill="url(#snake-grid)" />
            
            {/* Boundary Box */}
            <rect x="20" y="20" width="280" height="160" stroke="currentColor" strokeWidth="1" className="text-[var(--border-medium)]" rx="4" />
            
            {/* Trail effect */}
            <path d="M 60 140 H 120 V 80 H 220 V 120 H 240" stroke="var(--color-accent-subtle)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Snake Body */}
            <path d="M 80 140 H 140 V 80 H 200 V 120 H 240" stroke="var(--color-accent)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Snake Head with eye */}
            <circle cx="240" cy="120" r="7" fill="var(--color-accent)" />
            <circle cx="242" cy="118" r="2" fill="#FFFFFF" />

            {/* Food Node with pulse rings */}
            <circle cx="260" cy="60" r="6" fill="#22C55E" />
            <circle cx="260" cy="60" r="11" stroke="#22C55E" strokeWidth="1" opacity="0.4" strokeDasharray="2 2" />

            {/* Corner telemetry */}
            <text x="28" y="34" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">GRID 20x20</text>
            <text x="250" y="34" fill="var(--color-accent)" fontSize="9" fontFamily="var(--font-mono)">SPD: 9.8</text>
          </svg>
        </div>
      );

    case '2048':
      return (
        <div className={`${baseBox} ${className}`}>
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="transparent" />
            {/* Grid Container */}
            <rect x="75" y="15" width="170" height="170" rx="6" fill="var(--bg-surface)" stroke="var(--border-medium)" strokeWidth="1.5" />
            
            {/* 4x4 Grid Cells */}
            {/* Row 1 */}
            <rect x="85" y="25" width="34" height="34" rx="4" fill="var(--bg-elevated)" />
            <text x="102" y="47" textAnchor="middle" fill="var(--text-secondary)" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">2</text>
            
            <rect x="124" y="25" width="34" height="34" rx="4" fill="var(--bg-elevated)" />
            <text x="141" y="47" textAnchor="middle" fill="var(--text-secondary)" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">4</text>
            
            <rect x="163" y="25" width="34" height="34" rx="4" fill="var(--bg-elevated)" opacity="0.4" />
            <rect x="202" y="25" width="34" height="34" rx="4" fill="var(--bg-elevated)" opacity="0.4" />

            {/* Row 2 */}
            <rect x="85" y="64" width="34" height="34" rx="4" fill="var(--bg-elevated)" />
            <text x="102" y="86" textAnchor="middle" fill="var(--text-secondary)" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">8</text>
            
            <rect x="124" y="64" width="34" height="34" rx="4" fill="var(--bg-active)" stroke="var(--border-subtle)" />
            <text x="141" y="86" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">64</text>
            
            <rect x="163" y="64" width="34" height="34" rx="4" fill="var(--bg-elevated)" opacity="0.4" />
            <rect x="202" y="64" width="34" height="34" rx="4" fill="var(--bg-elevated)" opacity="0.4" />

            {/* Row 3 */}
            <rect x="85" y="103" width="34" height="34" rx="4" fill="var(--bg-elevated)" />
            <text x="102" y="125" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">128</text>
            
            <rect x="124" y="103" width="34" height="34" rx="4" fill="var(--bg-active)" stroke="var(--border-subtle)" />
            <text x="141" y="125" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">512</text>
            
            <rect x="163" y="103" width="34" height="34" rx="4" fill="var(--color-accent-subtle)" stroke="var(--color-accent-border)" />
            <text x="180" y="125" textAnchor="middle" fill="var(--color-accent)" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)">1024</text>

            <rect x="202" y="103" width="34" height="34" rx="4" fill="var(--bg-elevated)" opacity="0.4" />

            {/* Row 4 - Crown Tile */}
            <rect x="85" y="142" width="34" height="34" rx="4" fill="var(--bg-elevated)" opacity="0.4" />
            <rect x="124" y="142" width="34" height="34" rx="4" fill="var(--bg-elevated)" opacity="0.4" />
            <rect x="163" y="142" width="34" height="34" rx="4" fill="var(--bg-elevated)" opacity="0.4" />

            <rect x="202" y="142" width="34" height="34" rx="4" fill="var(--color-accent)" stroke="var(--color-accent)" />
            <text x="219" y="164" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800" fontFamily="var(--font-mono)">2048</text>
          </svg>
        </div>
      );

    case 'memory':
      return (
        <div className={`${baseBox} ${className}`}>
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background ambient card backs */}
            <rect x="40" y="50" width="60" height="90" rx="5" fill="var(--bg-surface)" stroke="var(--border-subtle)" strokeWidth="1" />
            <rect x="48" y="58" width="44" height="74" rx="3" stroke="var(--border-medium)" strokeWidth="0.8" strokeDasharray="3 3" />

            <rect x="220" y="50" width="60" height="90" rx="5" fill="var(--bg-surface)" stroke="var(--border-subtle)" strokeWidth="1" />
            <rect x="228" y="58" width="44" height="74" rx="3" stroke="var(--border-medium)" strokeWidth="0.8" strokeDasharray="3 3" />

            {/* Matching Twin Cards in Focus */}
            {/* Card 1 */}
            <g transform="translate(105, 38)">
              <rect width="66" height="104" rx="6" fill="var(--bg-surface)" stroke="var(--color-accent)" strokeWidth="1.5" />
              <rect x="6" y="6" width="54" height="92" rx="4" fill="var(--color-accent-subtle)" />
              {/* Star Prism Glyph */}
              <polygon points="33,32 38,44 51,44 41,53 45,66 33,58 21,66 25,53 15,44 28,44" fill="var(--color-accent)" />
              <circle cx="33" cy="50" r="18" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 3" />
            </g>

            {/* Card 2 */}
            <g transform="translate(180, 38)">
              <rect width="66" height="104" rx="6" fill="var(--bg-surface)" stroke="var(--color-accent)" strokeWidth="1.5" />
              <rect x="6" y="6" width="54" height="92" rx="4" fill="var(--color-accent-subtle)" />
              {/* Star Prism Glyph */}
              <polygon points="33,32 38,44 51,44 41,53 45,66 33,58 21,66 25,53 15,44 28,44" fill="var(--color-accent)" />
              <circle cx="33" cy="50" r="18" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 3" />
            </g>

            {/* Match link arc */}
            <path d="M 171 90 H 180" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="2 2" />
            <text x="160" y="172" textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">MATCH CONFIRMED</text>
          </svg>
        </div>
      );

    case 'tictactoe':
      return (
        <div className={`${baseBox} ${className}`}>
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 3x3 Grid Lines */}
            <line x1="130" y1="35" x2="130" y2="165" stroke="var(--border-medium)" strokeWidth="2" strokeLinecap="round" />
            <line x1="190" y1="35" x2="190" y2="165" stroke="var(--border-medium)" strokeWidth="2" strokeLinecap="round" />
            <line x1="80" y1="78" x2="240" y2="78" stroke="var(--border-medium)" strokeWidth="2" strokeLinecap="round" />
            <line x1="80" y1="122" x2="240" y2="122" stroke="var(--border-medium)" strokeWidth="2" strokeLinecap="round" />

            {/* Row 1 Marks */}
            {/* X at [0,0] */}
            <path d="M 97 48 L 117 68 M 117 48 L 97 68" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
            {/* O at [0,1] */}
            <circle cx="160" cy="58" r="11" stroke="var(--text-secondary)" strokeWidth="2.5" />
            {/* X at [0,2] */}
            <path d="M 203 48 L 223 68 M 223 48 L 203 68" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />

            {/* Row 2 Marks */}
            {/* O at [1,0] */}
            <circle cx="107" cy="100" r="11" stroke="var(--text-secondary)" strokeWidth="2.5" />
            {/* X at [1,1] */}
            <path d="M 150 90 L 170 110 M 170 90 L 150 110" stroke="var(--color-accent)" strokeWidth="3.5" strokeLinecap="round" />

            {/* Row 3 Marks */}
            {/* O at [2,1] */}
            <circle cx="160" cy="144" r="11" stroke="var(--text-secondary)" strokeWidth="2.5" />
            {/* X at [2,2] */}
            <path d="M 203 134 L 223 154 M 223 134 L 203 154" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />

            {/* Diagonal Winning Strike Line */}
            <line x1="90" y1="42" x2="230" y2="160" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="90" cy="42" r="4" fill="var(--color-accent)" />
            <circle cx="230" cy="160" r="4" fill="var(--color-accent)" />
          </svg>
        </div>
      );

    case 'rps':
      return (
        <div className={`${baseBox} ${className}`}>
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Triad Geometry Nodes */}
            {/* Top Node: Rock / Shield */}
            <g transform="translate(160, 48)">
              <circle cx="0" cy="0" r="26" fill="var(--bg-surface)" stroke="var(--color-accent)" strokeWidth="1.5" />
              {/* Rock Polygon */}
              <polygon points="-10,-10 6,-12 12,2 8,12 -8,11 -12,0" fill="var(--color-accent)" opacity="0.9" />
              <text x="0" y="38" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">ROCK</text>
            </g>

            {/* Bottom Left: Paper / Parchment */}
            <g transform="translate(100, 136)">
              <circle cx="0" cy="0" r="24" fill="var(--bg-surface)" stroke="var(--border-medium)" strokeWidth="1.5" />
              {/* Paper Lines */}
              <rect x="-8" y="-10" width="16" height="20" rx="2" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" />
              <line x1="-5" y1="-5" x2="5" y2="-5" stroke="var(--text-secondary)" strokeWidth="1" />
              <line x1="-5" y1="0" x2="5" y2="0" stroke="var(--text-secondary)" strokeWidth="1" />
              <line x1="-5" y1="5" x2="2" y2="5" stroke="var(--text-secondary)" strokeWidth="1" />
              <text x="0" y="34" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">PAPER</text>
            </g>

            {/* Bottom Right: Scissors / Shears */}
            <g transform="translate(220, 136)">
              <circle cx="0" cy="0" r="24" fill="var(--bg-surface)" stroke="var(--border-medium)" strokeWidth="1.5" />
              {/* Scissors Mark */}
              <circle cx="-5" cy="7" r="3.5" stroke="var(--text-secondary)" strokeWidth="1.5" />
              <circle cx="5" cy="7" r="3.5" stroke="var(--text-secondary)" strokeWidth="1.5" />
              <line x1="-3" y1="4" x2="6" y2="-8" stroke="var(--text-secondary)" strokeWidth="1.5" />
              <line x1="3" y1="4" x2="-6" y2="-8" stroke="var(--text-secondary)" strokeWidth="1.5" />
              <text x="0" y="34" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">SCISSORS</text>
            </g>

            {/* Directional Connecting Arcs */}
            <path d="M 136 60 Q 95 86 100 110" stroke="var(--border-subtle)" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M 124 136 H 196" stroke="var(--border-subtle)" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M 220 110 Q 225 86 184 60" stroke="var(--border-subtle)" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
        </div>
      );

    case 'reaction':
      return (
        <div className={`${baseBox} ${className}`}>
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Precision Chronometer Dial */}
            <circle cx="160" cy="100" r="70" fill="var(--bg-surface)" stroke="var(--border-medium)" strokeWidth="1.5" />
            <circle cx="160" cy="100" r="62" stroke="var(--border-subtle)" strokeWidth="0.8" strokeDasharray="2 4" />
            
            {/* Reflex Active Arc */}
            <circle cx="160" cy="100" r="54" stroke="#22C55E" strokeWidth="3" strokeDasharray="260 80" strokeLinecap="round" />

            {/* Central Precision Readout */}
            <rect x="115" y="80" width="90" height="38" rx="4" fill="var(--bg-elevated)" stroke="var(--border-subtle)" />
            <text x="160" y="100" textAnchor="middle" fill="var(--text-primary)" fontSize="16" fontWeight="700" fontFamily="var(--font-mono)">184<tspan fontSize="11" fill="var(--text-secondary)"> ms</tspan></text>
            <text x="160" y="112" textAnchor="middle" fill="#22C55E" fontSize="8" fontWeight="600" fontFamily="var(--font-mono)">SUB-200 LATENCY</text>

            {/* Tick Markings */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="160"
                y1="34"
                x2="160"
                y2="39"
                stroke={deg % 90 === 0 ? 'var(--color-accent)' : 'var(--text-muted)'}
                strokeWidth={deg % 90 === 0 ? '2' : '1'}
                transform={`rotate(${deg} 160 100)`}
              />
            ))}
          </svg>
        </div>
      );

    default:
      return <div className={baseBox} />;
  }
};
