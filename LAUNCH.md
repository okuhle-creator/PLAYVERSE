# GLITCH HUNT // LinkedIn Launch Plan
## Day 1 of 10: Software Engineering Challenge

---

## 1. 45–60 Second Screen Recording Demo Sequence

To demonstrate the product authentically to engineers, developers, and hiring teams:

| Timestamp | Screen State | Action & Focus | Audio / Narrative Focus |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:08** | **Mission Briefing** (`#F1EFE7` paper aesthetic) | Show title, personal best record, difficulty options (Easy / Normal / Hard / Daily). Click **"Start Investigation"**. | *"Most browser games rely on fast reflexes. I wanted to build a deduction game inspired by digital forensics and real system monitoring."* |
| **0:08 – 0:24** | **Investigation Board** | Five telemetry cards appear with timestamps, fictional microservices, severities, and metrics. Highlight mouse hover and press key `[3]` or `[4]` to target an event. Zoom in on the contradictory evidence (e.g. an L1 cache hit reporting 4,850ms latency, or a 200 OK status on a rejected signature). | *"Five signals arrive from a distributed cluster. Four describe normal telemetry; one contradicts reality. The player has 60 seconds to cross-reference timestamps, latencies, and states."* |
| **0:24 – 0:34** | **Commit Deduction** | Click **"Commit Deduction"** or hit `Enter`. | *"The browser never knows the answer. Scoring is server-authoritative. The backend validates the submission timestamp against its own start record to prevent client clock manipulation."* |
| **0:34 – 0:46** | **Forensics Reveal & Verdict** | The panel displays **"Signal Breach Isolated"**, awards points (+910 PTS), and reveals the technical evidence chain explaining the contradiction. | *"Once locked, the backend reveals the chain of reasoning. In this case, an in-memory cache hit logged a 4.8 second fetch time—an impossible physical contradiction."* |
| **0:46 – 0:58** | **Leaderboard & Wrap-up** | Enter operator alias (`Lynx-01`), submit to PostgreSQL leaderboard, show the updated top 10 list and achievement badges. Finish on the clean GitHub repo and live Vercel link. | *"Day 1 is live, backed by PostgreSQL and zero AI APIs. Try the Daily Challenge or inspect the source code on GitHub."* |

---

## 2. LinkedIn Post Draft

```markdown
I started a 10-day software engineering challenge today.

For Day 1, I built GLITCH HUNT: Signal Breach — a browser-based telemetry deduction game inspired by incident investigation and distributed systems debugging.

Here is the premise:
Five telemetry events arrive on a system-monitoring console. Four describe authentic cluster operations. Exactly one contains a logical contradiction—like an in-memory L1 cache hit taking 4.8 seconds, or a circuit breaker marked OPEN while passing 1,000 requests per second.

You have 60 seconds to cross-reference timestamps, error codes, and metrics to isolate the anomaly.

A few engineering decisions I cared about while building this:

1. Server-authoritative scoring: The frontend never receives the anomaly ID or explanation until the deduction is committed. Official scores are calculated on the server using its own recorded start and submission timestamps, capped with a decaying curve up to 1,000 points.

2. Atomic anti-replay protection: To prevent double-submissions or race conditions, game completion uses an atomic conditional SQL update in PostgreSQL (`WHERE id = $id AND completed = FALSE`).

3. Deterministic UTC daily challenges: Puzzles are generated using a deterministic Mulberry32 PRNG seeded by the UTC calendar date. Every engineer around the world gets the exact same mystery each day.

4. Deliberate, non-generic design: I explicitly avoided generic AI dashboard templates, purple gradients, and glowing cyberpunk tropes. The interface is inspired by technical field notes and physical instrumentation—warm paper, near-black ink, and functional signal orange accents.

5. Rigorous testing: 36 unit and integration tests with Vitest, plus end-to-end browser tests using Playwright.

Zero AI APIs were used for game logic—everything runs on deterministic, explainable rule sets.

Play the live game: https://glitch-hunt.vercel.app [Replace with live URL]
Inspect the full source code: https://github.com/your-username/glitch-hunt [Replace with repo URL]

Would love your thoughts on the deduction mechanics or the edge architecture. What's your top score?
```

---

## 3. Alternative Opening Hooks

- **Option A (Systems-focused):**
  > "Debugging microservices under pressure is stressful. So I turned it into a competitive browser deduction game."

- **Option B (Challenge-focused):**
  > "Day 1 of 10: Building 10 production-minded software engineering projects in 10 days. First up: a digital forensics game called GLITCH HUNT."

- **Option C (Minimalist/Curiosity-driven):**
  > "Five telemetry signals. One contradiction. Can you spot which microservice is lying?"

---

## 4. Short Demo Video Caption

> *"GLITCH HUNT: Signal Breach. A fast browser deduction game inspired by distributed systems forensics. Five telemetry events appear—one is an anomaly. Server-authoritative scoring, deterministic UTC puzzles, PostgreSQL persistence, and zero AI tropes. Built for Day 1 of my 10-day engineering challenge."*

---

## 5. Five Technical Questions Engineers Might Ask & Accurate Answers

### Q1: How do you prevent players from inspecting browser DevTools to find the correct answer before submitting?
> **Answer:** The client never receives the anomaly ID, puzzle category, or explanation in the initial `POST /api/games` response. That payload only contains the five telemetry events, an opaque UUID session token, and a time limit. The ground truth remains in PostgreSQL (or server memory) until the player posts their selection to `/api/games/:id/answer`. DevTools network inspects will show zero hints.

### Q2: How does the server prevent players from freezing the timer or forging rapid submission timestamps?
> **Answer:** Client timestamps are completely ignored for scoring. When the game session is created, the server records `started_at = NOW()`. When the answer arrives, the server captures `submitted_at = NOW()` and evaluates elapsed milliseconds using its own internal clock. The scoring formula decays linearly from 1,000 to 200 points up to the 60-second limit, with an automatic cutoff beyond the grace period.

### Q3: What prevents a user from submitting multiple guesses or replaying a winning session ID to inflate leaderboard scores?
> **Answer:** The database update is atomic and conditional: `UPDATE games SET completed = TRUE, ... WHERE id = $id AND completed = FALSE`. If a concurrent request or replay arrives, the row match count is 0, and the API returns `409 Conflict`. Furthermore, leaderboard submissions require a valid completed `game_id` and have a unique foreign key constraint (`game_id UNIQUE`), preventing duplicate score claims for the same run.

### Q4: How is the Daily Challenge made consistent for all players worldwide without hardcoding content?
> **Answer:** The daily challenge uses a deterministic 32-bit pseudorandom number generator (Mulberry32) seeded with `daily-challenge-seed-${YYYY-MM-DD}` based on UTC date. The PRNG deterministically shuffles the event slots, selects the anomaly template, and computes jittered timestamps. Any player on that calendar day evaluates the exact same puzzle data.

### Q5: How do the API routes work on Vercel without a persistent Node express server?
> **Answer:** All API endpoints are implemented as serverless functions in the `/api` directory following standard Vercel edge conventions. Database persistence connects to managed PostgreSQL (such as Neon or Vercel Postgres) via connection pooling (`pg.Pool`). For local development and test environments, Vite includes an integrated dev server middleware plugin that runs the exact same TypeScript handler functions with an in-memory SQL repository fallback.
