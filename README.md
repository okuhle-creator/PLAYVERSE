# PLAYVERSE — Multi-Game Browser Arcade

> **"One portal. Endless play."**  
> *Day 4 of 10-Day Software Engineering Challenge*

**PLAYVERSE** is a curated multi-game browser arcade engineered with React, TypeScript, and Vite. Designed with an intentional editorial indie aesthetic, it provides six fully implemented, standalone games with zero third-party embeds, zero tracking, local persistence, responsive mobile controls, and crisp tactile audio synthesis.

---

## 1. Design Direction & Aesthetic

Built under strict guidelines to avoid stereotypical AI-generated aesthetics (no neon glows, no excessive gradients, no floating geometric blobs, no emojis as artwork):

- **Palette:** Deep charcoal base (`#0F1013`), warm layered surfaces (`#17181D`, `#1F2128`), warm off-white typography (`#F4F3EE`), graphite secondary tones (`#9EA3B0`), and a signature **Arcade Vermilion** (`#FF5C28`) accent.
- **Typography:** `Space Grotesk` for editorial headings and structured UI, paired with `IBM Plex Mono` for technical telemetry, scores, and keybindings.
- **Bespoke Artwork:** Every game card features bespoke SVG vector artwork illustrating the actual gameplay mechanics rather than generic AI illustrations.
- **Theme Support:** Dark Mode (default deep charcoal) and Light Mode (warm paper editorial) with instantaneous transition.
- **Accessibility:** Full keyboard navigability, skip links, screen-reader labels, and strict compliance with `prefers-reduced-motion`.

---

## 2. Six Playable Games

### 🐍 1. Snake Classic (Arcade)
- **Mechanics:** 20x20 precision grid serpent navigation. Collect energy nodes to grow and score points.
- **Difficulty Scaling:** Speed accelerates automatically every 3 nodes consumed (from 140ms down to 55ms tick rate).
- **Controls:** Arrow keys / `WASD` navigation, `Space` to pause/resume, `R` to restart.
- **Mobile Support:** Virtual tactile D-Pad with directional buttons.
- **Safety:** Direction queue prevents accidental 180° self-collisions.

### 🔢 2. 2048 Matrix (Puzzle)
- **Mechanics:** 4x4 power-of-two number-merging grid. Sliding rows/columns combines identical adjacent values.
- **Victory Condition:** Reach tile 2048 to conquer the board, with an option to keep playing indefinitely.
- **Controls:** Arrow keys / `WASD`, touch swipe gesture detection, and on-screen directional buttons.
- **Scoring:** Tracks high scores and move combinations with tile-specific contrast styling.

### 🃏 3. Memory Match (Memory)
- **Mechanics:** 16-card array (8 pairs) featuring geometric SVG tokens (Prism, Compass, Hexagon, Orbit, Delta, Crosshair, Gem, Nexus).
- **Feedback:** Move counter, live elapsed timer (`MM:SS`), match confirmation chimes, and completion modal.
- **Safety:** Interaction locking prevents clicking third cards while mismatched pairs flip back.

### ⚔️ 4. Tic-Tac-Toe (Strategy)
- **Modes:** 
  1. *Player vs Computer*: Features a mathematically unbeatable Minimax algorithm (`Tactical`) and a balanced mode (`Casual`).
  2. *Pass & Play*: Local two-player hot-seat showdown.
- **Telemetry:** Match scoreboard (X Wins, O Wins, Ties), active win streak counter, and dynamic winning-line highlight.

### ✂️ 5. Rock Paper Scissors (Casual)
- **Mechanics:** Tactical duel against the computer with round result evaluation (Rock blunts Scissors, Scissors shears Paper, Paper wraps Rock).
- **Metrics:** Win rate %, active streak, highest streak record, and recent encounter history log.
- **Controls:** Quick number keys `[1]`, `[2]`, `[3]`, or tactile buttons.

### ⚡ 6. Reaction Test (Reflex)
- **Mechanics:** Millisecond response latency measurement.
- **States:** Armed waiting state (warning amber) with randomized test delay (1.5s – 4.5s), transitioning to active signal (vibrant green).
- **False-Start Guard:** Premature clicks trigger a false-start penalty.
- **Analytics:** 5-attempt history array, calculated running average latency, and tier evaluation (<200ms Esports, 200–250ms Pro, 250–320ms Average).

---

## 3. Architecture & Technical Highlights

```
src/
├── app/
│   ├── App.tsx             # Master router, hash-state coordinator, library filter
│   └── types.ts            # Type contracts (GameMetadata, Categories, Scores)
├── components/
│   ├── Navbar.tsx          # Wordmark, navigation, theme toggle, audio toggle
│   ├── HeroIntro.tsx       # Concise editorial intro & "Explore Games" CTA
│   ├── SearchAndFilter.tsx # Real-time search query & category pills
│   ├── FeaturedSection.tsx # Spotlight for featured arcade titles
│   ├── GameCard.tsx        # Distinctive card with SVG thumbnail and play trigger
│   ├── GameThumbnail.tsx   # Bespoke SVG artwork for all 6 games
│   ├── RecentlyPlayed.tsx  # Dynamic local history tracking with time-ago metrics
│   └── Footer.tsx          # Project metadata & Day 4 credits
├── games/
│   ├── GameArena.tsx       # Focused game view, breadcrumbs, rules tab, stats
│   ├── snake/              # Canvas-based Snake game
│   ├── 2048/               # 4x4 matrix sliding math & swipe handlers
│   ├── memory/             # Card flipping & pair matching logic
│   ├── tictactoe/          # 3x3 Minimax decision-tree algorithm
│   ├── rps/                # Computer duel and streak tracking
│   └── reaction/           # Precision performance.now() latency gauge
├── services/
│   ├── storage.ts          # Safe localStorage adapter with fallback
│   ├── sound.ts            # Web Audio API procedural tone synthesizer
│   └── gamesRegistry.ts    # Comprehensive catalog definition
└── styles/
    ├── tokens.css          # Design system CSS variables & reduced-motion rules
    ├── global.css          # Core layouts, buttons, typography, custom scrollbars
    └── components.css      # Keyframe animations and motion overrides
```

### Local Persistence
All user activity is preserved in the browser's `localStorage` with zero server requirements:
- Personal best scores for all six games.
- Real-time `Recently Played` feed with timestamp deduplication and activity clearing.
- Color theme selection (`dark` / `light`).
- Audio mute preference.

### Web Audio Synthesizer
Zero external audio files or dependencies. Uses the browser's native `AudioContext` to synthesize tactile micro-tones (D5/A5 food eats, sine-wave tile merges, card flips, win chords, and game-over drops).

### GitHub Pages & Subpath Deployment
`vite.config.ts` specifies `base: './'` ensuring all assets resolve correctly regardless of whether the application is hosted at domain root or under a repository subpath (e.g. `https://username.github.io/playverse/`).

---

## 4. Getting Started

### Prerequisites
- Node.js 18+ (tested with Node 20 / 22)
- npm 9+

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/playverse.git
cd playverse

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Running Automated Tests
```bash
npm test
```
Executes the Vitest test suite covering:
- Game metadata and catalog completeness.
- Minimax AI logic and Tic-Tac-Toe win detection.
- LocalStorage persistence and score validation.
- React UI integration (search, filtering, arena navigation, theme toggle).

### Production Build
```bash
npm run build
```
Creates an optimized, tree-shaken static production bundle in `dist/`.

### Previewing the Production Build
```bash
npm run preview
```

---

## 5. Deployment Guide (GitHub Pages)

To publish to GitHub Pages:
1. Build the production assets:
   ```bash
   npm run build
   ```
2. Push the contents of the `dist/` directory to the `gh-pages` branch, or configure GitHub Actions with the following `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy PLAYVERSE to GitHub Pages

   on:
     push:
       branches: [main]

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: 'npm'
         - run: npm ci
         - run: npm test
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: ./dist
         - id: deployment
           uses: actions/deploy-pages@v4
   ```

---

## 6. License & Credits

Built as **Day 4 of a 10-day software development challenge**.  
Licensed under the MIT License.
