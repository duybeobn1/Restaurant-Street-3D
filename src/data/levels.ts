export type LevelConfig = {
  level: number;
  xpRequired: number;
  indoorSize: number;
  outdoorSize: number;
  maxWorkers: number;
  /** Item ids that unlock at this level. */
  unlocks: string[];
  /** Recipe ids that unlock at this level. */
  recipeUnlocks: string[];
};

// XP thresholds based on the original Restaurant Streets progression table.
const xpTable: number[] = [
  0, 70, 160, 285, 535, 1160, 2410, 4910, 9910, 17410, 27410, 39910, 57410, 79910, 107410,
  144910, 192410, 249910, 322410, 409910, 517410, 644910, 797410, 974910, 1182410, 1419910,
  1691910, 2091910, 2611910, 3361910, 4361910, 5361910, 6661910, 8267960, 10177060, 12581060,
  15621460, 18961860, 22342260, 26120660, 29990660, 34214660, 38665660, 43350660, 48280660,
  53467660, 58924660, 64665660, 70705660, 77071660, 83770660, 90829660, 98210660, 105955660,
  114104660, 122502660, 131212660, 140238660, 149584660, 159254660, 169252660, 179582660,
  190248660, 200828660, 211908660, 223488660, 235388660, 247458660, 259698660, 272118660,
  284728660, 297538660, 310558660, 323798660, 337168660, 350678660, 364298660, 378018660,
  391878660,
];

const sizesByLevel: Array<[number, [number, number]]> = [
  [1, [7, 6]], [2, [7, 6]], [3, [8, 6]], [4, [8, 6]], [5, [8, 6]],
  [6, [9, 6]], [7, [9, 6]], [8, [9, 6]], [9, [10, 8]], [10, [10, 8]],
  [11, [10, 8]], [12, [11, 8]], [13, [11, 8]], [14, [11, 8]], [15, [12, 8]],
  [16, [12, 8]], [17, [12, 8]], [18, [13, 10]], [19, [13, 10]], [20, [14, 10]],
  [25, [16, 8]], [30, [18, 8]], [40, [18, 8]], [50, [18, 8]], [60, [18, 8]],
  [75, [18, 8]],
];

const workersByLevel = (level: number): number => {
  if (level >= 17) return 5;
  if (level >= 8) return 5;
  if (level >= 5) return 4;
  if (level >= 2) return 3;
  return 2;
};

const itemUnlocks: Record<number, string[]> = {
  1: ["floor_basic", "wall_brick", "wall_wood", "door_basic", "table_small", "chair_basic", "stove_basic", "trash_can", "plant_small", "rug", "plot", "grass"],
  2: ["floor_tile", "wall_paint", "table_medium", "painting", "pond"],
  3: ["sink_basic"],
  5: ["table_large", "stove_advanced"],
  8: ["stove_advanced", "toilet_basic"],
  12: ["floor_marble"],
  25: ["stove_industrial"],
};

const recipeUnlocks: Record<number, string[]> = {
  1: ["d_drink", "d_salad", "d_rice_bowl"],
  2: ["d_pasta", "d_fish_dish"],
  5: ["d_pizza", "d_burger"],
  10: ["d_cake"],
};

export function getLevelConfig(level: number): LevelConfig {
  const indoorSize = sizeAt(level, 0);
  const outdoorSize = sizeAt(level, 1);
  return {
    level,
    xpRequired: xpTable[Math.min(level - 1, xpTable.length - 1)] ?? 0,
    indoorSize,
    outdoorSize,
    maxWorkers: workersByLevel(level),
    unlocks: itemUnlocks[level] ?? [],
    recipeUnlocks: recipeUnlocks[level] ?? [],
  };
}

function sizeAt(level: number, axis: 0 | 1): number {
  let size = axis === 0 ? 7 : 6;
  for (const [lvl, sizes] of sizesByLevel) {
    if (level >= lvl) size = sizes[axis];
    else break;
  }
  return size;
}

export function xpToLevel(xp: number): number {
  let lvl = 1;
  for (let i = 1; i < xpTable.length; i++) {
    if (xp >= xpTable[i]) lvl = i + 1;
    else break;
  }
  return lvl;
}

export function xpForNextLevel(currentLevel: number): number {
  if (currentLevel >= xpTable.length) return Infinity;
  return xpTable[currentLevel];
}
