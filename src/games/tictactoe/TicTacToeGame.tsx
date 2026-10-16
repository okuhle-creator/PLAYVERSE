import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, User, Cpu, Users } from 'lucide-react';
import { Board, CellValue, checkWinner, isBoardFull, getBestMove, Player } from './minimax';
import { Sound } from '../../services/sound';
import { StorageService } from '../../services/storage';

type GameMode = 'ai' | 'pvp';
type Difficulty = 'tactical' | 'casual';

export const TicTacToeGame: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>('X');
  const [mode, setMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('tactical');
  const [scores, setScores] = useState({ x: 0, o: 0, ties: 0 });
  const [winStreak, setWinStreak] = useState(0);

  const winInfo = checkWinner(board);
  const isFull = isBoardFull(board);
  const isGameOver = !!winInfo || isFull;

  const resetBoard = useCallback(() => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    Sound.click();
  }, []);

  const resetAll = () => {
    resetBoard();
    setScores({ x: 0, o: 0, ties: 0 });
    setWinStreak(0);
  };

  const handleCellClick = (index: number) => {
    if (board[index] !== null || isGameOver) return;
    if (mode === 'ai' && turn === 'O') return; // AI is thinking

    makeMove(index, turn);
  };

  const makeMove = (index: number, player: Player) => {
    Sound.ticMark();
    const nextBoard = [...board];
    nextBoard[index] = player;
    setBoard(nextBoard);

    const win = checkWinner(nextBoard);
    const full = isBoardFull(nextBoard);

    if (win) {
      Sound.win();
      if (player === 'X') {
        const nextStreak = winStreak + 1;
        setWinStreak(nextStreak);
        StorageService.saveHighScore('tictactoe', nextStreak, true);
        StorageService.addRecentlyPlayed('tictactoe', nextStreak);
      } else {
        setWinStreak(0);
        StorageService.addRecentlyPlayed('tictactoe', 0);
      }
      setScores((prev) => ({
        ...prev,
        [player.toLowerCase()]: prev[player.toLowerCase() as 'x' | 'o'] + 1,
      }));
    } else if (full) {
      Sound.playBeep(330, 0.1, 'sine', 0.1);
      setScores((prev) => ({ ...prev, ties: prev.ties + 1 }));
      StorageService.addRecentlyPlayed('tictactoe', winStreak);
    } else {
      setTurn(player === 'X' ? 'O' : 'X');
    }
  };

  // Computer AI Move trigger
  useEffect(() => {
    if (mode === 'ai' && turn === 'O' && !isGameOver) {
      const timer = setTimeout(() => {
        const aiIndex = getBestMove(board, 'O', difficulty);
        if (aiIndex !== -1) {
          makeMove(aiIndex, 'O');
        }
      }, 350);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, mode, isGameOver, board, difficulty]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Mode Selectors */}
      <div className="flex items-center justify-between w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] p-1.5">
        <div className="flex gap-1">
          <button
            onClick={() => {
              setMode('ai');
              resetBoard();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-xs)] text-xs font-semibold transition-all ${
              mode === 'ai'
                ? 'bg-[var(--bg-elevated)] text-[var(--color-accent)] border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Cpu size={14} /> vs Computer
          </button>
          <button
            onClick={() => {
              setMode('pvp');
              resetBoard();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-xs)] text-xs font-semibold transition-all ${
              mode === 'pvp'
                ? 'bg-[var(--bg-elevated)] text-[var(--color-accent)] border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Users size={14} /> Pass & Play
          </button>
        </div>

        {mode === 'ai' && (
          <div className="flex gap-1 text-xs font-mono">
            <button
              onClick={() => setDifficulty('tactical')}
              className={`px-2 py-1 rounded-[var(--radius-xs)] ${
                difficulty === 'tactical' ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-bold' : 'text-[var(--text-muted)]'
              }`}
            >
              Minimax
            </button>
            <button
              onClick={() => setDifficulty('casual')}
              className={`px-2 py-1 rounded-[var(--radius-xs)] ${
                difficulty === 'casual' ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-bold' : 'text-[var(--text-muted)]'
              }`}
            >
              Casual
            </button>
          </div>
        )}
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-2 w-full">
        <div className={`p-3 rounded-[var(--radius-sm)] border text-center ${
          turn === 'X' && !isGameOver ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]' : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
        }`}>
          <div className="flex items-center justify-center gap-1 text-xs font-mono text-[var(--text-muted)] uppercase mb-1">
            <User size={12} /> {mode === 'ai' ? 'You (X)' : 'Player X'}
          </div>
          <div className="text-xl font-bold font-mono text-[var(--color-accent)]">{scores.x}</div>
        </div>

        <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center">
          <div className="text-xs font-mono text-[var(--text-muted)] uppercase mb-1">Ties</div>
          <div className="text-xl font-bold font-mono text-[var(--text-secondary)]">{scores.ties}</div>
        </div>

        <div className={`p-3 rounded-[var(--radius-sm)] border text-center ${
          turn === 'O' && !isGameOver ? 'border-[var(--text-primary)] bg-[var(--bg-elevated)]' : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
        }`}>
          <div className="flex items-center justify-center gap-1 text-xs font-mono text-[var(--text-muted)] uppercase mb-1">
            {mode === 'ai' ? <Cpu size={12} /> : <User size={12} />} {mode === 'ai' ? 'AI (O)' : 'Player O'}
          </div>
          <div className="text-xl font-bold font-mono text-[var(--text-primary)]">{scores.o}</div>
        </div>
      </div>

      {/* 3x3 Grid Board */}
      <div className="relative w-full max-w-[340px] aspect-square bg-[var(--bg-surface)] border border-[var(--border-medium)] rounded-[var(--radius-md)] p-3 shadow-card">
        <div className="grid grid-cols-3 grid-rows-3 gap-2.5 w-full h-full">
          {board.map((cell: CellValue, index: number) => {
            const isWinningCell = winInfo?.line.includes(index);

            return (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || isGameOver || (mode === 'ai' && turn === 'O')}
                aria-label={`Cell ${index + 1}`}
                className={`flex items-center justify-center rounded-[var(--radius-sm)] border text-3xl font-mono font-bold transition-all duration-150 ${
                  isWinningCell
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-md animate-scale-in'
                    : cell !== null
                    ? 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-medium)] cursor-pointer'
                }`}
              >
                {cell === 'X' ? (
                  <span className={isWinningCell ? 'text-white' : 'text-[var(--color-accent)]'}>X</span>
                ) : cell === 'O' ? (
                  <span className={isWinningCell ? 'text-white' : 'text-[var(--text-primary)]'}>O</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Status / Game Over banner */}
        {isGameOver && (
          <div className="absolute inset-x-3 bottom-3 bg-[#0F1013]/95 border border-[var(--border-medium)] rounded-[var(--radius-sm)] p-3 flex items-center justify-between animate-fade-in shadow-lg">
            <div className="text-sm font-semibold">
              {winInfo ? (
                <span>
                  Winner: <strong className="text-[var(--color-accent)] font-mono">{winInfo.winner === 'X' && mode === 'ai' ? 'You' : winInfo.winner}</strong>!
                </span>
              ) : (
                <span className="text-[var(--text-secondary)]">Honorable Stalemate</span>
              )}
            </div>
            <button onClick={resetBoard} className="btn btn-primary btn-sm">
              <RotateCcw size={13} /> Next Round
            </button>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between w-full max-w-[340px]">
        <button onClick={resetBoard} className="btn btn-secondary btn-sm">
          <RotateCcw size={14} /> Clear Board
        </button>
        <button onClick={resetAll} className="btn btn-ghost btn-sm text-xs font-mono">
          Reset Scores
        </button>
      </div>
    </div>
  );
};
