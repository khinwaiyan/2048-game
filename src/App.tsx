import './App.css';

import { useEffect, useState } from 'react';

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
    const storedGrid = localStorage.getItem('grid');
    return storedGrid !== null
      ? (JSON.parse(storedGrid) as number[][])
      : initializeGrid();
  });

  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    const storedBestScore = localStorage.getItem('bestScore');
    return storedBestScore !== null ? Number(storedBestScore) : 0;
  });
  const [gameIsOver, setGameIsOver] = useState<boolean>(false);
  const [gameIsWon, setGameWon] = useState<boolean>(false);

  const resetGame = () => {
    const newGrid = initializeGrid();
    setGrid(newGrid);
    setScore(0);
    setGameIsOver(false);
    setGameWon(false);
    localStorage.setItem('grid', JSON.stringify(newGrid));
  };

  // Update the best score whenever the score changes
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('bestScore', String(score));
    }
  }, [score, bestScore]);

  // Persist the grid state in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('grid', JSON.stringify(grid));
  }, [grid]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameIsOver || gameIsWon) return;

      let moved = false;
      let currentGrid = grid;
      let scoreToAdd = 0;

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

        // Update the score by adding the merged tile value
        setScore((prevScore) => prevScore + scoreToAdd);

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
        <BoardHeader resetGame={resetGame} />
        <Board grid={grid} />
        {gameIsOver && <Overlay message="Game Over!" resetGame={resetGame} />}
        {gameIsWon && <Overlay message="You Win!" resetGame={resetGame} />}
      </div>
    </>
  );
}

export default App;
