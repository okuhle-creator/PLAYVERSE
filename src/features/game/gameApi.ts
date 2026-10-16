import type {
  GameSession,
  EvaluationResult,
  LeaderboardItem,
  GameDifficulty,
  ChallengeType
} from './gameTypes';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(errorMsg);
  }
  return data as T;
}

export async function createGameSession(
  difficulty: GameDifficulty = 'normal',
  challengeType: ChallengeType = 'standard'
): Promise<GameSession> {
  const payload: Record<string, string> = { difficulty, challengeType };
  if (challengeType === 'daily') {
    payload.challengeDate = new Date().toISOString().slice(0, 10);
  }

  const res = await fetch(`${API_BASE}/api/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return handleResponse<GameSession>(res);
}

export async function submitGameAnswer(
  gameId: string,
  eventId: string
): Promise<EvaluationResult> {
  const res = await fetch(`${API_BASE}/api/games/${encodeURIComponent(gameId)}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ eventId })
  });

  return handleResponse<EvaluationResult>(res);
}

export async function fetchLeaderboard(): Promise<LeaderboardItem[]> {
  const res = await fetch(`${API_BASE}/api/leaderboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data = await handleResponse<{ entries: LeaderboardItem[] }>(res);
  return data.entries || [];
}

export async function submitLeaderboardScore(
  gameId: string,
  alias: string
): Promise<{ success: boolean; leaderboard: LeaderboardItem[] }> {
  const res = await fetch(`${API_BASE}/api/leaderboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ gameId, alias })
  });

  return handleResponse<{ success: boolean; leaderboard: LeaderboardItem[] }>(res);
}
