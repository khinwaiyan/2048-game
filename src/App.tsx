//App.tsx
import './App.css';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Board } from './components/Board';
import { BoardHeader } from './components/BoardHeader';
import { Overlay } from './components/Overlay';
import { Title } from './components/Title';
import {
  addTile,
  gameOver,
  gameWon,
  initializeGrid,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
} from './utils/gameLogic';

function App() {
  const { grid, score, bestScore, isGameOver, isGameWon, resetGame, undo } =
    useGame();

  return (
    <div className="Wrapper">
      <Title score={score} bestScore={bestScore} />
      <div className="game-container">
        <BoardHeader resetGame={resetGame} undo={undo} />
        <Board grid={grid} />
        {isGameOver && <Overlay message="Game Over!" resetGame={resetGame} />}
        {isGameWon && <Overlay message="You Win!" resetGame={resetGame} />}
      </div>
    </div>
  );
}

export default App;

type PrevState = {
  grid: number[][];
  score: number;
};

const persistState = (
  key: string,
  value: object | string | number | boolean | null,
) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const usePersistedState = <T,>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    const persistedValue = localStorage.getItem(key);
    return persistedValue !== null
      ? (JSON.parse(persistedValue) as T)
      : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

type GameState = {
  grid: number[][];
  score: number;
  bestScore: number;
  isGameOver: boolean;
  isGameWon: boolean;
  resetGame: () => void;
  undo: () => void;
};

const useGame = (): GameState => {
  const [grid, setGrid] = usePersistedState('grid', initializeGrid());
  const [score, setScore] = usePersistedState('currentScore', 0);
  const [bestScore, setBestScore] = usePersistedState('bestScore', 0);
  const [history, setHistory] = usePersistedState<PrevState[]>('history', []);

  const scoreRef = useRef<number>(score);

  const isGameOver = gameOver(grid);
  const isGameWon = gameWon(grid);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
    }
    persistState('currentScore', scoreRef.current);
  }, [score, bestScore, setBestScore]);

  const getGameLogicForKey = (
    key: string,
  ): ((grid: number[][]) => [number[][], boolean, number]) | null => {
    switch (key) {
      case 'ArrowUp':
        return moveUp;
      case 'ArrowDown':
        return moveDown;
      case 'ArrowLeft':
        return moveLeft;
      case 'ArrowRight':
        return moveRight;
      default:
        return null;
    }
  };

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (isGameOver || isGameWon) return;

      const moveFunction = getGameLogicForKey(e.key);
      if (moveFunction === null) return;

      setHistory((prevHistory) => [
        ...prevHistory,
        {
          grid: JSON.parse(JSON.stringify(grid)) as number[][],
          score: scoreRef.current,
        },
      ]);

      const [currentGrid, moved, scoreToAdd] = moveFunction(grid);

      if (moved) {
        const newGrid = addTile(currentGrid);
        setGrid(newGrid);
        scoreRef.current += scoreToAdd;
        setScore(scoreRef.current);
      }
    },
    [grid, isGameOver, isGameWon, setGrid, setHistory, setScore],
  );

  const resetGame = useCallback(() => {
    const newGrid = initializeGrid();
    setGrid(newGrid);
    scoreRef.current = 0;
    setScore(0);
    setHistory([]);
  }, [setGrid, setScore, setHistory]);

  const undo = useCallback(() => {
    if (history.length === 0) return;

    const previousState = history[history.length - 1];
    if (previousState === undefined) return;

    setGrid(previousState.grid);
    setScore(previousState.score);
    scoreRef.current = previousState.score;

    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
  }, [history, setGrid, setScore, setHistory]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return {
    grid,
    score,
    bestScore,
    isGameOver,
    isGameWon,
    resetGame,
    undo,
  };
};
