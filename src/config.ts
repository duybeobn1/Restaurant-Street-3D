export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const TILE_SIZE = 1;

export const GRID_COLS = 7;
export const GRID_ROWS = 7;

export const OUTDOOR_COLS = 6;
export const OUTDOOR_ROWS = 6;

export const STARTING_MONEY = 5000;
export const STARTING_GOURMET_POINTS = 0;

export const SAVE_KEY = "restaurant-streets:save";
export const SAVE_VERSION = 1;

export const TICK_MS = 250;
export const RENDER_FPS_TARGET = 60;

export const CAMERA_FOV = 50;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 200;

export const WALL_HEIGHT = 1.8;
export const FURNITURE_SCALE = 1.0;

export const MAX_WORKERS = 5;

export const COLORS = {
  floor: 0xc9a47a,
  floorAlt: 0xb89270,
  wall: 0x6a4a3a,
  wallEdge: 0x4a3325,
  door: 0x8b5a2b,
  grass: 0x5a8a3a,
  water: 0x3a6a9a,
  path: 0xa08260,
  select: 0xffe066,
  invalid: 0xff5577,
  ghost: 0x88ff88,
  ghostBad: 0xff8888,
  uiBg: 0x1f1a17,
  uiPanel: 0x2a221d,
  uiText: 0xf2e8d8,
  uiAccent: 0xf2b65a,
  sky: 0x1a1a1a,
  ambient: 0x6a5a4a,
  sunlight: 0xfff2d4,
} as const;

export const ITEM_COST_MULTIPLIER = 1.0;
export const XP_PER_DISH = 10;
export const XP_PER_CUSTOMER_SERVED = 5;
export const MONEY_PER_CUSTOMER_BASE = 50;
