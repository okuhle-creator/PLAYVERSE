export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type Board = CellValue[];

export const WINNING_COMBOS = [
  [0, 1, 2], // rows
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // cols
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // diagonals
  [2, 4, 6],
];

export function checkWinner(board: Board): { winner: Player; line: number[] } | null {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line: combo };
    }
  }
  return null;
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

// Minimax algorithm for unbeatable AI
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player
): { score: number; bestMove?: number } {
  const winInfo = checkWinner(board);
  if (winInfo) {
    return { score: winInfo.winner === aiPlayer ? 10 - depth : depth - 10 };
  }
  if (isBoardFull(board)) {
    return { score: 0 };
  }

  const availableMoves: number[] = [];
  board.forEach((cell, idx) => {
    if (cell === null) availableMoves.push(idx);
  });

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      board[move] = aiPlayer;
      const result = minimax(board, depth + 1, false, aiPlayer, humanPlayer);
      board[move] = null;

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
    return { score: bestScore, bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      board[move] = humanPlayer;
      const result = minimax(board, depth + 1, true, aiPlayer, humanPlayer);
      board[move] = null;

      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
    return { score: bestScore, bestMove };
  }
}

export function getBestMove(board: Board, aiPlayer: Player = 'O', difficulty: 'tactical' | 'casual' = 'tactical'): number {
  const availableMoves: number[] = [];
  board.forEach((cell, idx) => {
    if (cell === null) availableMoves.push(idx);
  });

  if (availableMoves.length === 0) return -1;

  // In casual mode, 40% chance to pick a random available move
  if (difficulty === 'casual' && Math.random() < 0.4) {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';
  const result = minimax([...board], 0, true, aiPlayer, humanPlayer);
  return result.bestMove !== undefined ? result.bestMove : availableMoves[0];
}
