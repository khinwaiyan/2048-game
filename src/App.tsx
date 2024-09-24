import './App.css';

import { useEffect, useRef, useState } from 'react';

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
    return storedGrid !== null
      ? (JSON.parse(storedGrid) as number[][]) // local storage 데이터가 string 형태여서
      : initializeGrid();
  });

  const [score, setScore] = useState<number>(0);
  const scoreRef = useRef<number>(0); // UI re rendering 줄이기 위한

  const [bestScore, setBestScore] = useState<number>(() => {
    const storedBestScore = localStorage.getItem('bestScore');
    return storedBestScore !== null ? Number(storedBestScore) : 0;
  });
  const [gameIsOver, setGameIsOver] = useState<boolean>(false);
  const [gameIsWon, setGameWon] = useState<boolean>(false);

  // undo 기능을 위한 prev Tracking
  const previousGridRef = useRef<number[][]>([]);
  const previousScoreRef = useRef<number>(0);

  const resetGame = () => {
    const newGrid = initializeGrid();
    setGrid(newGrid);
    scoreRef.current = 0;
    setScore(0);
    setGameIsOver(false);
    setGameWon(false);
    localStorage.setItem('grid', JSON.stringify(newGrid));
  };

  const undo = () => {
    if (previousGridRef.current.length > 0) {
      setGrid(previousGridRef.current);
      setScore(previousScoreRef.current);
      scoreRef.current = previousScoreRef.current;
    }
  };

  // 점수 바뀌 때마다 최고점 확인 및 업데이트
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('bestScore', String(score));
    }
  }, [score, bestScore]);

  // 점수판 유지
  useEffect(() => {
    localStorage.setItem('grid', JSON.stringify(grid));
  }, [grid]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameIsOver || gameIsWon) return;

      let moved = false;
      let currentGrid = grid;
      let scoreToAdd = 0;

      //undo 을 위한 grid 및 점수 저장
      previousGridRef.current = JSON.parse(JSON.stringify(grid)) as number[][];
      previousScoreRef.current = scoreRef.current;

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

        if (gameOver(currentGrid)) {
          setGameIsOver(true);
        }
        if (gameWon(currentGrid)) {
          setGameWon(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [grid, gameIsOver, gameIsWon]);

  return (
    <>
      <Title score={score} bestScore={bestScore} />
      <div className="game-container">
        <BoardHeader resetGame={resetGame} undo={undo} />
        <Board grid={grid} />
        {gameIsOver && <Overlay message="Game Over!" resetGame={resetGame} />}
        {gameIsWon && <Overlay message="You Win!" resetGame={resetGame} />}
      </div>
    </>
  );
}

export default App;
