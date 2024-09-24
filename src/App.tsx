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
  const [grid, setGrid] = useState<number[][]>(() => {
    const storedGrid = localStorage.getItem('grid'); // 게임판 유지 위한
    try {
      return storedGrid !== null
        ? (JSON.parse(storedGrid) as number[][])
        : initializeGrid();
    } catch {
      return initializeGrid();
    }
  });

  // 리로딩 할때 점수 유지
  const [score, setScore] = useState<number>(() => {
    const storedScore = localStorage.getItem('currentScore');
    return storedScore !== null ? Number(storedScore) : 0;
  });

  const scoreRef = useRef<number>(score); // re-rendering 없이 점수 store

  const [bestScore, setBestScore] = useState<number>(() => {
    const storedBestScore = localStorage.getItem('bestScore');
    return storedBestScore !== null ? Number(storedBestScore) : 0;
  });

  // undo 기능을 위한 prev Tracking
  const [previousState, setPreviousState] = useState<{
    grid: number[][];
    score: number;
  }>({
    grid: [],
    score: 0,
  });

  useEffect(() => {
    const storedPrevState = localStorage.getItem('previousState');
    if (storedPrevState !== null) {
      setPreviousState(
        JSON.parse(storedPrevState) as { grid: number[][]; score: number },
      );
    }
  }, []);

  const persistState = useCallback(
    (key: string, value: object | string | number | boolean | null) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [],
  );

  const resetGame = useCallback(() => {
    const newGrid = initializeGrid();
    setGrid(newGrid);
    scoreRef.current = 0;
    setScore(0);
    setPreviousState({ grid: [], score: 0 }); // reset 할때 undo 막기
    persistState('previousState', { grid: [], score: 0 });
    persistState('grid', newGrid);
  }, [persistState]);

  const undo = useCallback(() => {
    if (previousState.grid.length > 0) {
      setGrid(previousState.grid);
      setScore(previousState.score);
      scoreRef.current = previousState.score;
      persistState('grid', previousState.grid);
      persistState('currentScore', previousState.score);
    }
  }, [persistState, previousState]);

  // 점수 바뀔 때마다 최고점 확인 및 업데이트
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      persistState('bestScore', score);
    }
    persistState('currentScore', scoreRef.current);
  }, [score, bestScore, persistState]);

  // 점수판 유지
  useEffect(() => {
    persistState('grid', grid);
  }, [grid, persistState]);

  // 게임 종료 및 승리 확인
  const isGameOver = gameOver(grid);
  const isGameWon = gameWon(grid);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (isGameOver || isGameWon) return;
      let moved = false;
      let currentGrid = grid;
      let scoreToAdd = 0;

      //undo 을 위한 grid 및 점수 저장
      setPreviousState({
        grid: JSON.parse(JSON.stringify(grid)) as number[][],
        score: scoreRef.current,
      });

      persistState('previousState', {
        grid: JSON.parse(JSON.stringify(grid)) as number[][],
        score: scoreRef.current,
      }); // undo 를 위한 prev state

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
    },
    [grid, isGameOver, isGameWon, persistState],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

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
