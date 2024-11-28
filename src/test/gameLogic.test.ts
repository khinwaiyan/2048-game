import seedrandom from 'seedrandom';
import { describe, expect, it } from 'vitest';

import { gameOver, initializeGrid, moveLeft } from '../utils/gameLogic';

describe('initializeGrid', () => {
  it('그리드 4 x 4로  초기화해야 한다.', () => {
    const rows = 4;
    const columns = 4;
    const grid = initializeGrid();

    expect(grid).toHaveLength(rows);
    grid.forEach((row) => {
      expect(row).toHaveLength(columns);
    });
  });

  it('기본값 2 또는 4 또는 0이 뜬다.', () => {
    seedrandom('42', { global: true });
    for (let i = 0; i < 100; i++) {
      const grid = initializeGrid();

      grid.forEach((row) => {
        row.forEach((cell) => {
          expect([2, 4, 0]).toContain(cell);
        });
      });
    }
  });
});

describe('moveLeft', () => {
  it('타일이 잘 이동하고 병합한다.', () => {
    const grid = [
      [0, 2, 0, 2],
      [4, 0, 0, 4],
      [0, 0, 0, 0],
      [2, 2, 2, 2],
    ];
    const expectedGrid = [
      [4, 0, 0, 0],
      [8, 0, 0, 0],
      [0, 0, 0, 0],
      [4, 4, 0, 0],
    ];
    const [newGrid, moved, score] = moveLeft(grid);
    expect(newGrid).toEqual(expectedGrid);
    expect(moved).toBe(true);
    expect(score).toBe(20);
  });

  it('합칠게 없다면 이동만 한다.', () => {
    const grid = [
      [2, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 2, 0, 0],
    ];
    const expectedGrid = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0],
    ];
    const [newGrid, moved, score] = moveLeft(grid);
    expect(newGrid).toEqual(expectedGrid);
    expect(moved).toBe(true);
    expect(score).toBe(0);
  });

  it('이동이 불가능한 경우 타일을 이동하지 않는다.', () => {
    const grid = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 4096],
      [8192, 16384, 32768, 65536],
    ];
    const [newGrid, moved, score] = moveLeft(grid);
    expect(newGrid).toEqual(grid);
    expect(moved).toBe(false);
    expect(score).toBe(0);
  });
});

describe('gameOver', () => {
  it('이동이 불가능하고 128이 아닐때 true를 반환한다.', () => {
    const grid = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    expect(gameOver(grid)).toBe(true);
  });

  it('이동이 불가능하고 128일때 false를 반환한다.', () => {
    const grid = [
      [2, 4, 2, 4],
      [4, 128, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    expect(gameOver(grid)).toBe(false);
  });

  it('이동이 가능할 때 false를 반환한다.', () => {
    const grid = [
      [2, 2, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    expect(gameOver(grid)).toBe(false);
  });
});
