import './App.css';

import {
  type MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

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

type PrevState = {
  grid: number[][];
  score: number;
};
function App() {
  const [grid, setGrid] = usePersistedState('grid', initializeGrid());

  // 리로딩 할때 점수 유지
  const [score, setScore] = usePersistedState('currentScore', 0);

  const scoreRef = useRef<number>(score); // re-rendering 없이 점수 store

  const [bestScore, setBestScore] = usePersistedState('bestScore', 0);

  // undo 기능을 위한 prev Tracking
  const [history, setHistory] = usePersistedState<PrevState[]>('history', []);

  const undoCallback = useCallback(() => {
    undo(history, setGrid, setScore, scoreRef, setHistory);
  }, [history, setGrid, setScore, setHistory]);

  const resetGameCallback = () => {
    resetGame(setGrid, scoreRef, setScore, setHistory);
  };

  // 점수 바뀔 때마다 최고점 확인 및 업데이트
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      persistState('bestScore', score);
    }
    persistState('currentScore', scoreRef.current);
  }, [score, bestScore, setBestScore]);

  // 점수판 유지
  useEffect(() => {
    persistState('grid', grid);
  }, [grid]);

  // 게임 종료 및 승리 확인
  const isGameOver = gameOver(grid);
  const isGameWon = gameWon(grid);

  const handleKeyPressCallback = useCallback(
    (e: KeyboardEvent) => {
      handleKeyPress(
        e,
        grid,
        setGrid,
        setHistory,
        history,
        scoreRef,
        setScore,
        isGameOver,
        isGameWon,
      );
    },
    [grid, history, isGameOver, isGameWon, setGrid, setHistory, setScore],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPressCallback);
    return () => {
      window.removeEventListener('keydown', handleKeyPressCallback);
    };
  }, [handleKeyPressCallback]);

  return (
    <div className="Wrapper">
      <Title score={score} bestScore={bestScore} />
      <div className="game-container">
        <BoardHeader resetGame={resetGameCallback} undo={undoCallback} />
        <Board grid={grid} />
        {isGameOver && (
          <Overlay message="Game Over!" resetGame={resetGameCallback} />
        )}
        {isGameWon && (
          <Overlay message="You Win!" resetGame={resetGameCallback} />
        )}
      </div>
    </div>
  );
}

export default App;

// callbacks

export const persistState = (
  key: string,
  value: object | string | number | boolean | null,
) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const resetGame = (
  setGrid: (grid: number[][]) => void,
  scoreRef: MutableRefObject<number>,
  setScore: (score: number) => void,
  setHistory: (history: PrevState[]) => void,
) => {
  const newGrid = initializeGrid();
  setGrid(newGrid);
  scoreRef.current = 0;
  setScore(0);
  setHistory([]);
  persistState('previousState', { grid: [], score: 0 });
  persistState('grid', newGrid);
};

export const undo = (
  history: PrevState[],
  setGrid: (grid: number[][]) => void,
  setScore: (score: number) => void,
  scoreRef: MutableRefObject<number>,
  setHistory: (history: PrevState[]) => void,
) => {
  if (history.length === 0) return;

  const previousState = history[history.length - 1];
  if (previousState === undefined) return;

  setGrid(previousState.grid);
  setScore(previousState.score);
  scoreRef.current = previousState.score;

  const newHistory = history.slice(0, -1);
  setHistory(newHistory);
  persistState('history', newHistory);
  persistState('grid', previousState.grid);
  persistState('currentScore', previousState.score);
};

export const handleKeyPress = (
  e: KeyboardEvent,
  grid: number[][],
  setGrid: (grid: number[][]) => void,
  setHistory: (history: React.SetStateAction<PrevState[]>) => void,
  history: PrevState[],
  scoreRef: MutableRefObject<number>,
  setScore: (score: number) => void,
  isGameOver: boolean,
  isGameWon: boolean,
) => {
  if (isGameOver || isGameWon) return;

  let moved = false;
  let currentGrid = grid;
  let scoreToAdd = 0;

  //undo 을 위한 grid 및 점수 저장
  setHistory((prevHistory) => [
    ...prevHistory,
    {
      grid: JSON.parse(JSON.stringify(grid)) as number[][],
      score: scoreRef.current,
    },
  ]);

  persistState('history', [
    ...history,
    {
      grid: JSON.parse(JSON.stringify(grid)) as number[][],
      score: scoreRef.current,
    },
  ]);

  switch (e.key) {
    case 'ArrowUp':
      [currentGrid, moved, scoreToAdd] = moveUp(currentGrid);
      break;
    case 'ArrowDown':
      [currentGrid, moved, scoreToAdd] = moveDown(currentGrid);
      break;
    case 'ArrowLeft':
      [currentGrid, moved, scoreToAdd] = moveLeft(currentGrid);
      break;
    case 'ArrowRight':
      [currentGrid, moved, scoreToAdd] = moveRight(currentGrid);
      break;
    default:
      return;
  }

  if (moved) {
    currentGrid = addTile(currentGrid);
    setGrid(currentGrid);

    scoreRef.current += scoreToAdd;
    setScore(scoreRef.current);
  }
};

function usePersistedState<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
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
}
