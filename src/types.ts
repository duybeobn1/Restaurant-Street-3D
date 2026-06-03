import type * as THREE from "three";

export type GridPos = { col: number; row: number };

export type WorldPos = { x: number; y: number; z: number };

export type ItemCategory =
  | "floor"
  | "wall"
  | "door"
  | "table"
  | "chair"
  | "stove"
  | "sink"
  | "toilet"
  | "trash"
  | "decoration"
  | "ingredient"
  | "dish"
  | "plant"
  | "fishing"
  | "plot"
  | "pond";

export type ItemDef = {
  id: string;
  name: string;
  category: ItemCategory;
  cost: number;
  levelRequired: number;
  walkable: boolean;
  description?: string;
  color: number;
  seats?: number;
  cookSpeed?: number;
  recipe?: string[];
  cookTime?: number;
  sellPrice?: number;
  gourmetPoints?: number;
  area: "indoor" | "outdoor" | "both";
  /** Footprint in tile cells: [width, height] in grid cells. Default [1,1]. */
  footprint?: [number, number];
  /** If true, the item is a serving destination (where customers come to collect food). */
  isServicePoint?: boolean;
};

export type PlacedItem = {
  uid: string;
  itemId: string;
  col: number;
  row: number;
  rotation: 0 | 1 | 2 | 3;
};

export type WorkerRole = "chef" | "waiter" | "cleaner";

export type WorkerData = {
  uid: string;
  name: string;
  role: WorkerRole;
  energy: number;
  maxEnergy: number;
  skill: number;
  col: number;
  row: number;
  state: WorkerState;
  stateEndsAt: number;
  taskUid?: string;
};

export type WorkerState =
  | "idle"
  | "walking"
  | "cooking"
  | "serving"
  | "cleaning"
  | "sleeping"
  | "resting";

export type CustomerState =
  | "spawning"
  | "walking_in"
  | "queued"
  | "walking_to_seat"
  | "seated"
  | "ordering"
  | "waiting_for_food"
  | "eating"
  | "paying"
  | "leaving"
  | "leaving_angry";

export type CustomerData = {
  uid: string;
  col: number;
  row: number;
  state: CustomerState;
  patience: number;
  maxPatience: number;
  orderItemId?: string;
  satAtCol?: number;
  satAtRow?: number;
  path?: GridPos[];
  pathIndex?: number;
  tint: number;
};

export type Inventory = Record<string, number>;

export type StoveState = {
  uid: string;
  placedUid: string;
  currentDishId?: string;
  cookStartedAt?: number;
  cookEndsAt?: number;
  assignedChefUid?: string;
};

export type TableState = {
  uid: string;
  placedUid: string;
  seats: number;
  occupiedBy: string[];
  dirty: boolean;
};

export type OrderTicket = {
  uid: string;
  customerUid: string;
  dishId: string;
  createdAt: number;
  status: "pending" | "cooking" | "ready" | "served";
  assignedChefUid?: string;
  assignedWaiterUid?: string;
};

export type WorldState = {
  money: number;
  gourmetPoints: number;
  level: number;
  day: number;
  hour: number;
  minute: number;
  indoor: PlacedItem[];
  outdoor: PlacedItem[];
  workers: WorkerData[];
  customers: CustomerData[];
  inventory: Inventory;
  selectedItemId?: string;
  mode: "play" | "build";
  unlockedRecipes: string[];
  stoveStates: StoveState[];
  tableStates: TableState[];
  orders: OrderTicket[];
  savedAt: number;
  saveVersion: number;
};

export type SaveData = {
  version: number;
  state: WorldState;
};

export type PathNode = {
  col: number;
  row: number;
  g: number;
  h: number;
  f: number;
  parent?: PathNode;
};

export type Vec3 = THREE.Vector3;
