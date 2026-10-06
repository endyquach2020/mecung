import { Question, QUESTIONS } from '../data/questions';

export interface CellCoord {
  r: number;
  c: number;
}

export interface Obstacle {
  id: number;
  questionId: number;
  r: number;
  c: number;
  type: 'rock' | 'spike';
  cleared: boolean;
  question: Question;
}

export interface MazeData {
  rows: number;
  cols: number;
  grid: number[][]; // 1: wall, 0: passage
  start: CellCoord;
  exit: CellCoord;
  obstacles: Map<string, Obstacle>; // key: `${r},${c}`
  obstacleList: Obstacle[];
}

export const MAZE_ROWS = 21;
export const MAZE_COLS = 21;

/**
 * Generate a procedural maze with guarantee of solvability and 24 distributed obstacles.
 */
export function generateRandomMaze(rows = MAZE_ROWS, cols = MAZE_COLS): MazeData {
  // Ensure odd dimensions for classic maze grid
  const R = rows % 2 === 0 ? rows + 1 : rows;
  const C = cols % 2 === 0 ? cols + 1 : cols;

  // Initialize all as walls (1)
  const grid: number[][] = Array.from({ length: R }, () => Array(C).fill(1));

  // Randomized Depth-First Search (Recursive Backtracker)
  const visited: boolean[][] = Array.from({ length: R }, () => Array(C).fill(false));

  const startR = R - 2;
  const startC = 1;
  const exitR = 1;
  const exitC = C - 2;

  // Directions: [dr, dc]
  const dirs = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ];

  function carve(r: number, c: number) {
    grid[r][c] = 0;
    visited[r][c] = true;

    // Shuffle directions
    const shuffledDirs = [...dirs].sort(() => Math.random() - 0.5);

    for (const [dr, dc] of shuffledDirs) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr > 0 && nr < R - 1 && nc > 0 && nc < C - 1 && !visited[nr][nc]) {
        // Carve wall between
        grid[r + dr / 2][c + dc / 2] = 0;
        carve(nr, nc);
      }
    }
  }

  // Carve starting from (startR, startC)
  carve(startR, startC);

  // Guarantee exit is carved and connected
  grid[exitR][exitC] = 0;
  if (grid[exitR + 1][exitC] === 1 && grid[exitR][exitC - 1] === 1) {
    grid[exitR + 1][exitC] = 0;
  }

  // Add a few loops (braids) to make the maze richer and offer alternate routes
  for (let r = 2; r < R - 2; r += 2) {
    for (let c = 2; c < C - 2; c += 2) {
      if (grid[r][c] === 1 && Math.random() < 0.12) {
        // Check if removing this wall connects two passages
        if (
          (grid[r - 1][c] === 0 && grid[r + 1][c] === 0) ||
          (grid[r][c - 1] === 0 && grid[r][c + 1] === 0)
        ) {
          grid[r][c] = 0;
        }
      }
    }
  }

  // Collect all walkable corridor cells
  const walkableCells: CellCoord[] = [];
  for (let r = 1; r < R - 1; r++) {
    for (let c = 1; c < C - 1; c++) {
      if (grid[r][c] === 0) {
        // Exclude start and exit cells and their immediate adjacent steps
        const isStartOrNear =
          (r === startR && c === startC) ||
          (Math.abs(r - startR) <= 1 && Math.abs(c - startC) <= 1);
        const isExitOrNear =
          (r === exitR && c === exitC) ||
          (Math.abs(r - exitR) <= 1 && Math.abs(c - exitC) <= 1);

        if (!isStartOrNear && !isExitOrNear) {
          walkableCells.push({ r, c });
        }
      }
    }
  }

  // Find shortest path between Start and Exit
  const mainPath = findShortestPath(grid, { r: startR, c: startC }, { r: exitR, c: exitC });
  const mainPathSet = new Set(mainPath.map((p) => `${p.r},${p.c}`));

  // Separate walkable cells into on-path and branch cells
  const pathWalkable: CellCoord[] = walkableCells.filter((c) => mainPathSet.has(`${c.r},${c.c}`));
  const branchWalkable: CellCoord[] = walkableCells.filter((c) => !mainPathSet.has(`${c.r},${c.c}`));

  // Shuffle both
  pathWalkable.sort(() => Math.random() - 0.5);
  branchWalkable.sort(() => Math.random() - 0.5);

  // We need exactly 24 obstacles
  const numObstacles = 24;
  const obstaclesOnPath = Math.min(8, Math.floor(pathWalkable.length * 0.4));
  const obstaclesOnBranch = numObstacles - obstaclesOnPath;

  const chosenPathCells = pathWalkable.slice(0, obstaclesOnPath);
  let chosenBranchCells = branchWalkable.slice(0, obstaclesOnBranch);

  // If branches don't have enough cells, backfill from remaining path cells
  if (chosenPathCells.length + chosenBranchCells.length < numObstacles) {
    const remainingPath = pathWalkable.slice(obstaclesOnPath);
    chosenBranchCells = [
      ...chosenBranchCells,
      ...remainingPath.slice(0, numObstacles - chosenPathCells.length - chosenBranchCells.length),
    ];
  }

  const selectedLocations: CellCoord[] = [...chosenPathCells, ...chosenBranchCells];

  // If still not enough (e.g. exceptionally small corridor), take any walkable
  if (selectedLocations.length < numObstacles) {
    const remaining = walkableCells.filter(
      (w) => !selectedLocations.some((s) => s.r === w.r && s.c === w.c)
    );
    remaining.sort(() => Math.random() - 0.5);
    selectedLocations.push(...remaining.slice(0, numObstacles - selectedLocations.length));
  }

  // Shuffle questions to make each run exciting and fresh
  const shuffledQuestions = [...QUESTIONS].sort(() => Math.random() - 0.5);

  const obstaclesMap = new Map<string, Obstacle>();
  const obstacleList: Obstacle[] = [];

  for (let i = 0; i < Math.min(numObstacles, selectedLocations.length); i++) {
    const loc = selectedLocations[i];
    const q = shuffledQuestions[i] || QUESTIONS[i % QUESTIONS.length];
    const obs: Obstacle = {
      id: i + 1,
      questionId: q.id,
      r: loc.r,
      c: loc.c,
      type: q.obstacleType,
      cleared: false,
      question: q,
    };
    obstaclesMap.set(`${loc.r},${loc.c}`, obs);
    obstacleList.push(obs);
  }

  return {
    rows: R,
    cols: C,
    grid,
    start: { r: startR, c: startC },
    exit: { r: exitR, c: exitC },
    obstacles: obstaclesMap,
    obstacleList,
  };
}

/**
 * BFS algorithm to find shortest path between two points
 */
export function findShortestPath(
  grid: number[][],
  from: CellCoord,
  to: CellCoord
): CellCoord[] {
  const R = grid.length;
  const C = grid[0].length;
  const queue: CellCoord[] = [from];
  const visited = new Set<string>();
  const parent = new Map<string, CellCoord | null>();

  const startKey = `${from.r},${from.c}`;
  visited.add(startKey);
  parent.set(startKey, null);

  const deltas = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  let found = false;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.r === to.r && curr.c === to.c) {
      found = true;
      break;
    }

    for (const [dr, dc] of deltas) {
      const nr = curr.r + dr;
      const nc = curr.c + dc;
      const key = `${nr},${nc}`;

      if (
        nr >= 0 &&
        nr < R &&
        nc >= 0 &&
        nc < C &&
        grid[nr][nc] === 0 &&
        !visited.has(key)
      ) {
        visited.add(key);
        parent.set(key, curr);
        queue.push({ r: nr, c: nc });
      }
    }
  }

  if (!found) return [];

  // Reconstruct path
  const path: CellCoord[] = [];
  let currKey: string | null = `${to.r},${to.c}`;

  while (currKey) {
    const [r, c] = currKey.split(',').map(Number);
    path.unshift({ r, c });
    const p = parent.get(currKey);
    currKey = p ? `${p.r},${p.c}` : null;
  }

  return path;
}
