//gameLogic.tsx
type Grid = number[][];
export const initializeGrid = () => {
  //0 으로 채워진 4X4 grid
  let grid: Grid = Array.from({ length: 4 }, () => Array<number>(4).fill(0));
  grid = addTile(grid);
  grid = addTile(grid);
  return grid;
};

export const addTile = (grid: Grid): Grid => {
  const emptyCells: [number, number][] = []; // [[row,col],..]

  // random tile (2 or 4) 생성
  const randTile = Math.random() < 0.9 ? 2 : 4;

  // 비는 곳 찾고 emptyCells 에서 표시
  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === 0) {
        emptyCells.push([i, j]);
      }
    });
  });

  //비는 곳 있으면 random 으로 찾아서 grid 안에 넣고 업데이트 하기
  if (emptyCells.length > 0) {
    // 비는곳 index
    const [row, col] = emptyCells[
      Math.floor(Math.random() * emptyCells.length)
    ] as [number, number];

    // 비는곳에 (2 or 4) or 원래 cell 값 넣기
    const newGrid = grid.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? randTile : c)),
    );
    return newGrid;
  }
  return grid;
};

export const moveLeft = (grid: Grid): [Grid, boolean, number] => {
  let moved = false;
  let scoreToAdd = 0;

  const newGrid: Grid = grid.map((row) => {
    //각 row 마다 0 아니 tile filter
    const newRow: number[] = row.filter((tile) => tile !== 0);

    for (let i = 0; i < newRow.length - 1; i++) {
      const currentTile = newRow[i];
      const nextTile = newRow[i + 1];

      // tiles 이 같을때
      if (currentTile !== undefined && currentTile === nextTile) {
        newRow[i] = currentTile * 2; // 머지하기
        scoreToAdd += newRow[i] ?? 0;
        newRow[i + 1] = 0; // 머지돼서 비는 mark
      }
    }

    //머지후 남은 cell 0 채우기
    const shiftedRow = newRow.filter((tile) => tile !== 0);
    while (shiftedRow.length < 4) {
      shiftedRow.push(0);
    }

    // tile 음직임 check
    if (!moved && !row.every((cell, index) => cell === shiftedRow[index])) {
      moved = true;
    }

    return shiftedRow;
  });

  return [newGrid, moved, scoreToAdd];
};

//moveLeft 를 reverse 하기
export const moveRight = (grid: Grid): [Grid, boolean, number] => {
  const reversedGrid = grid.map((row) => row.slice().reverse()); // shallow copy 만들고 reverse 하기
  const [movedGrid, moved, scoreToAdd] = moveLeft(reversedGrid);
  return [movedGrid.map((row) => row.reverse()), moved, scoreToAdd];
};

const transpose = (grid: Grid): Grid => {
  if (grid[0] !== undefined) {
    return grid[0].map((_, i) => grid.map((row) => row[i] ?? 0));
  }
  return [];
};

export const moveUp = (grid: Grid): [Grid, boolean, number] => {
  const transposedGrid = transpose(grid);
  const [movedGrid, moved, scoreToAdd] = moveLeft(transposedGrid);
  return [transpose(movedGrid), moved, scoreToAdd];
};

export const moveDown = (grid: Grid): [Grid, boolean, number] => {
  const transposedGrid = transpose(grid);
  const [movedGrid, moved, scoreToAdd] = moveRight(transposedGrid);
  return [transpose(movedGrid), moved, scoreToAdd];
};

export const gameOver = (grid: Grid): boolean => {
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];
    if (row !== undefined) {
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        const nextRow = grid[i + 1];
        if (cell !== undefined) {
          if (cell === 0) return false; // 비는곳 남아있을때
          if (j < row.length - 1 && cell === row[j + 1]) return false; // horizontal merge
          if (nextRow !== undefined && cell === nextRow[j]) return false; // vertical merge
        }
      }
    }
  }
  return true;
};
export const gameWon = (grid: number[][]): boolean => {
  return grid.some((row) => row.some((cell) => cell >= 128));
};
