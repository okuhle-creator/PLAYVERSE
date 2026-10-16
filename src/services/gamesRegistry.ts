import { GameCategory, GameId, GameMetadata } from '../app/types';

export const GAMES_CATALOG: GameMetadata[] = [
  {
    id: 'snake',
    title: 'Snake Classic',
    tagline: 'Precision grid navigation & rapid reflexes',
    category: 'arcade',
    description: 'Guide the serpent through the grid, collect energy nodes, and grow without colliding with boundaries or your own tail.',
    instructions: [
      'Use Arrow keys or WASD to navigate the grid.',
      'Consume the orange energy orbs to score points and increase length.',
      'Speed increases every 4 items collected.',
      'Avoid perimeter walls and colliding with your own body.',
      'Press Space to pause or resume at any time.',
    ],
    controls: [
      { key: '↑ ↓ ← → / WASD', action: 'Change Direction' },
      { key: 'Space', action: 'Pause / Resume' },
      { key: 'R', action: 'Instant Restart' },
    ],
    difficulty: 'Reflex',
    featured: true,
    scoreLabel: 'Max Length',
    scoreHigherIsBetter: true,
    formatScore: (score: number) => `${score} pts`,
  },
  {
    id: '2048',
    title: '2048 Matrix',
    tagline: 'Strategic tile sliding & power-of-two synthesis',
    category: 'puzzle',
    description: 'Slide numbered tiles on a 4x4 board. When two tiles with the same number touch, they merge into one. Reach tile 2048 to conquer the grid.',
    instructions: [
      'Use Arrow keys, WASD, or swipe gestures to shift all tiles.',
      'Colliding identical numbers combine into their sum (2+2=4, 4+4=8).',
      'Each move spawns a new 2 or 4 tile in an unoccupied slot.',
      'Plan several moves ahead to prevent the grid from congesting.',
      'Game concludes when no adjacent merges or open spaces remain.',
    ],
    controls: [
      { key: '↑ ↓ ← → / WASD', action: 'Slide Grid' },
      { key: 'Mobile Swipe', action: 'Touch Slide' },
      { key: 'R', action: 'New Game' },
    ],
    difficulty: 'Tactical',
    featured: true,
    scoreLabel: 'High Score',
    scoreHigherIsBetter: true,
    formatScore: (score: number) => score.toLocaleString(),
  },
  {
    id: 'memory',
    title: 'Memory Match',
    tagline: 'Visual pairing against the ticking clock',
    category: 'memory',
    description: 'Uncover paired geometric tokens across a hidden 16-card array. Test your spatial recall and achieve the lowest moves and time.',
    instructions: [
      'Click or tap any face-down card to reveal its symbol.',
      'Select a second card to test for a match.',
      'Matching pairs remain uncovered; mismatches flip back after a brief glance.',
      'Clear the entire board in as few turns and seconds as possible.',
    ],
    controls: [
      { key: 'Click / Tap', action: 'Flip Card' },
      { key: 'R', action: 'Reshuffle Board' },
    ],
    difficulty: 'Casual',
    featured: false,
    scoreLabel: 'Best Time',
    scoreHigherIsBetter: false, // lower seconds is better
    formatScore: (score: number) => {
      const mins = Math.floor(score / 60);
      const secs = score % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
  },
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe',
    tagline: 'Pure tactical duality: Human vs Minimax AI',
    category: 'strategy',
    description: 'The definitive 3x3 strategic contest. Face off against an uncompromising Minimax AI or challenge a companion locally in two-player mode.',
    instructions: [
      'Select your game mode: Player vs Computer or Pass & Play.',
      'Place your mark (X or O) on any empty cell in the 3x3 grid.',
      'Align three identical symbols horizontally, vertically, or diagonally to claim victory.',
      'Block your opponent’s tactical forks before they trap you.',
    ],
    controls: [
      { key: 'Click / Tap', action: 'Place Marker' },
      { key: 'R', action: 'Reset Round' },
    ],
    difficulty: 'Tactical',
    featured: true,
    scoreLabel: 'Win Streak',
    scoreHigherIsBetter: true,
    formatScore: (score: number) => `${score} wins`,
  },
  {
    id: 'rps',
    title: 'Rock Paper Scissors',
    tagline: 'Rapid-fire psychological showdown',
    category: 'casual',
    description: 'Engage in swift tactical clashes against the computer. Track your win streaks, monitor decision distribution, and build dominance.',
    instructions: [
      'Select Rock, Paper, or Scissors for the round.',
      'Rock blunts Scissors, Scissors shears Paper, Paper wraps Rock.',
      'Equal picks result in an honorable draw.',
      'Maintain an unbroken win streak to set your highest record.',
    ],
    controls: [
      { key: '1 / 2 / 3', action: 'Rock / Paper / Scissors' },
      { key: 'R', action: 'Reset Record' },
    ],
    difficulty: 'Casual',
    featured: false,
    scoreLabel: 'Best Streak',
    scoreHigherIsBetter: true,
    formatScore: (score: number) => `${score} streak`,
  },
  {
    id: 'reaction',
    title: 'Reaction Test',
    tagline: 'Millisecond physiological latency gauge',
    category: 'casual',
    description: 'Test your neuromuscular reflex speed. When the indicator shifts from warning amber to luminous green, click as rapidly as possible.',
    instructions: [
      'Click or tap the test field to begin the armed sequence.',
      'Stay alert while the board glows warning amber with random delay.',
      'Immediately click when the surface bursts into signal green.',
      'Clicking prematurely triggers a false-start penalty.',
      'Complete attempts to calculate your average response latency.',
    ],
    controls: [
      { key: 'Click / Space / Tap', action: 'Trigger Reaction' },
      { key: 'R', action: 'Reset History' },
    ],
    difficulty: 'Reflex',
    featured: true,
    scoreLabel: 'Fastest Reflex',
    scoreHigherIsBetter: false, // lower ms is better
    formatScore: (score: number) => `${score} ms`,
  },
];

export const CATEGORIES: { id: GameCategory; label: string }[] = [
  { id: 'all', label: 'All Games' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'puzzle', label: 'Puzzle' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'memory', label: 'Memory' },
  { id: 'casual', label: 'Casual' },
];

export function getGameById(id: GameId): GameMetadata | undefined {
  return GAMES_CATALOG.find((g) => g.id === id);
}
