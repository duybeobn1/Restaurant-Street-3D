import type { GridPos, ItemDef, PlacedItem, WorldPos } from "../types";
import { TILE_SIZE } from "../config";

export type GridKind = "indoor" | "outdoor";

export class Grid {
  cols: number;
  rows: number;
  readonly kind: GridKind;
  /** Offset in world space (e.g. the outdoor grid sits behind the indoor one). */
  worldOffset: { x: number; z: number } = { x: 0, z: 0 };
  private items: (PlacedItem | null)[][] = [];
  private byUid: Map<string, PlacedItem> = new Map();
  readonly catalog: Map<string, ItemDef>;

  constructor(catalog: Map<string, ItemDef>, size: number, kind: GridKind = "indoor") {
    this.catalog = catalog;
    this.cols = size;
    this.rows = size;
    this.kind = kind;
    this.allocate();
  }

  private allocate(): void {
    this.items = Array.from({ length: this.cols }, () =>
      Array<PlacedItem | null>(this.rows).fill(null),
    );
    this.byUid.clear();
  }

  /** Resize the grid. Existing items that fit are preserved. */
  resize(newSize: number): void {
    if (newSize === this.cols && newSize === this.rows) return;
    const newItems: (PlacedItem | null)[][] = Array.from({ length: newSize }, () =>
      Array<PlacedItem | null>(newSize).fill(null),
    );
    for (const item of this.byUid.values()) {
      if (item.col < newSize && item.row < newSize) {
        newItems[item.col][item.row] = item;
      }
    }
    this.cols = newSize;
    this.rows = newSize;
    this.items = newItems;
  }

  inBounds(col: number, row: number): boolean {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
  }

  getAt(col: number, row: number): PlacedItem | null {
    if (!this.inBounds(col, row)) return null;
    return this.items[col][row];
  }

  getByUid(uid: string): PlacedItem | null {
    return this.byUid.get(uid) ?? null;
  }

  setAt(col: number, row: number, item: PlacedItem | null): void {
    if (!this.inBounds(col, row)) return;
    const previous = this.items[col][row];
    if (previous) this.byUid.delete(previous.uid);
    this.items[col][row] = item;
    if (item) this.byUid.set(item.uid, item);
  }

  remove(uid: string): PlacedItem | null {
    const item = this.byUid.get(uid);
    if (!item) return null;
    if (this.inBounds(item.col, item.row)) {
      this.items[item.col][item.row] = null;
    }
    this.byUid.delete(uid);
    return item;
  }

  /** Returns true if a character can walk on this cell. */
  isWalkable(col: number, row: number): boolean {
    if (!this.inBounds(col, row)) return false;
    const item = this.items[col][row];
    if (!item) return true;
    const def = this.catalog.get(item.itemId);
    return def ? def.walkable : false;
  }

  /** Returns true if a new item of `itemId` can be placed at (col,row). */
  canPlace(col: number, row: number, itemId: string, level = 1): boolean {
    if (!this.inBounds(col, row)) return false;
    if (this.items[col][row] !== null) return false;
    const def = this.catalog.get(itemId);
    if (!def) return false;
    if (def.levelRequired > level) return false;
    return true;
  }

  /** Grid cell (col,row) -> world position (center of the cell), including offset. */
  gridToWorld(col: number, row: number, y = 0): WorldPos {
    return {
      x: (col - (this.cols - 1) / 2) * TILE_SIZE + this.worldOffset.x,
      y,
      z: (row - (this.rows - 1) / 2) * TILE_SIZE + this.worldOffset.z,
    };
  }

  worldToGrid(x: number, z: number): GridPos | null {
    const localX = x - this.worldOffset.x;
    const localZ = z - this.worldOffset.z;
    const col = Math.round(localX / TILE_SIZE + (this.cols - 1) / 2);
    const row = Math.round(localZ / TILE_SIZE + (this.rows - 1) / 2);
    if (!this.inBounds(col, row)) return null;
    return { col, row };
  }

  /** Returns the first walkable cell in the grid (for spawn points). */
  findFirstWalkable(): GridPos | null {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.isWalkable(c, r)) return { col: c, row: r };
      }
    }
    return null;
  }

  allItems(): PlacedItem[] {
    return Array.from(this.byUid.values());
  }
}
