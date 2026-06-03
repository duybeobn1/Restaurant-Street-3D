import {
  GRID_COLS,
  GRID_ROWS,
  STARTING_GOURMET_POINTS,
  STARTING_MONEY,
} from "../config";
import type { WorldState } from "../types";
import { getAllRecipes } from "./recipes";

export function createInitialState(): WorldState {
  return {
    money: STARTING_MONEY,
    gourmetPoints: STARTING_GOURMET_POINTS,
    level: 1,
    day: 1,
    hour: 8,
    minute: 0,
    indoor: seedIndoor(GRID_COLS, GRID_ROWS),
    outdoor: [],
    workers: [],
    customers: [],
    inventory: seedInventory(),
    mode: "build",
    unlockedRecipes: getAllRecipes()
      .filter((r) => r.dishId === "d_drink" || r.dishId === "d_salad")
      .map((r) => r.dishId),
    stoveStates: [],
    tableStates: [],
    orders: [],
    savedAt: 0,
    saveVersion: 1,
  };
}

function seedIndoor(cols: number, rows: number) {
  const doorCol = Math.floor(cols / 2);
  return [
    {
      uid: crypto.randomUUID(),
      itemId: "door_basic",
      col: doorCol,
      row: rows - 1,
      rotation: 0 as 0 | 1 | 2 | 3,
    },
  ];
}

function seedInventory(): Record<string, number> {
  // A few starting ingredients to get the player going
  return {
    i_flour: 6,
    i_sugar: 4,
    i_salt: 6,
    i_water: 10,
    i_lettuce: 4,
    i_tomato: 4,
  };
}
