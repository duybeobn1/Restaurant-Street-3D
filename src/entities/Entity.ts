import * as THREE from "three";
import type { GridPos } from "../types";

/** Movement state for an entity walking along an A* path. */
export class Movement {
  path: GridPos[] = [];
  index = 0;
  progress = 1;
  fromCol = 0;
  fromRow = 0;
  toCol = 0;
  toRow = 0;
  speed: number; // cells per second

  constructor(speed = 3) {
    this.speed = speed;
  }

  setPath(path: GridPos[]): void {
    if (path.length === 0) {
      this.path = [];
      this.index = 0;
      this.progress = 1;
      return;
    }
    this.path = path;
    this.index = 0;
    this.progress = 1;
    this.advance();
  }

  stop(): void {
    this.path = [];
    this.index = 0;
    this.progress = 1;
  }

  isMoving(): boolean {
    return this.path.length > 0 && this.index < this.path.length;
  }

  /** Tick the movement. Returns true if the entity has finished the path. */
  update(deltaSeconds: number): boolean {
    if (!this.isMoving()) return true;
    this.progress += deltaSeconds * this.speed;
    while (this.progress >= 1 && this.isMoving()) {
      this.progress -= 1;
      this.fromCol = this.toCol;
      this.fromRow = this.toRow;
      this.index++;
      if (this.index >= this.path.length) {
        this.path = [];
        return true;
      }
      this.toCol = this.path[this.index].col;
      this.toRow = this.path[this.index].row;
    }
    return false;
  }

  currentCell(): GridPos {
    if (!this.isMoving()) return { col: this.toCol, row: this.toRow };
    return { col: this.toCol, row: this.toRow };
  }

  /** Returns the interpolated (x, z) world position in [0,1] between from and to. */
  worldOffset(): { x: number; z: number; t: number } {
    return { x: this.fromCol, z: this.fromRow, t: this.progress };
  }

  private advance(): void {
    if (this.path.length === 0) return;
    this.fromCol = this.path[0].col;
    this.fromRow = this.path[0].row;
    this.index = 0;
    if (this.path.length > 1) {
      this.toCol = this.path[1].col;
      this.toRow = this.path[1].row;
    } else {
      this.toCol = this.fromCol;
      this.toRow = this.fromRow;
    }
    this.progress = 1;
  }
}

export class Entity {
  readonly uid: string;
  readonly mesh: THREE.Object3D;
  col: number;
  row: number;
  movement: Movement;

  constructor(uid: string, mesh: THREE.Object3D, col: number, row: number, speed = 3) {
    this.uid = uid;
    this.mesh = mesh;
    this.col = col;
    this.row = row;
    this.movement = new Movement(speed);
  }

  setCell(col: number, row: number): void {
    this.col = col;
    this.row = row;
    this.movement.stop();
    this.movement.fromCol = col;
    this.movement.fromRow = row;
    this.movement.toCol = col;
    this.movement.toRow = row;
    this.movement.progress = 1;
  }

  isMoving(): boolean {
    return this.movement.isMoving();
  }

  setPath(path: GridPos[]): void {
    this.movement.setPath(path);
  }

  /** Updates movement. Returns true when path is finished. */
  updateMovement(deltaSeconds: number): boolean {
    const arrived = this.movement.update(deltaSeconds);
    if (arrived) {
      this.col = this.movement.toCol;
      this.row = this.movement.toRow;
    }
    return arrived;
  }

  /** Computes the world (x,z) position from current movement. */
  worldXZ(cols: number, rows: number, tileSize: number): { x: number; z: number; t: number } {
    const m = this.movement;
    if (!m.isMoving()) {
      return {
        x: (this.col - (cols - 1) / 2) * tileSize,
        z: (this.row - (rows - 1) / 2) * tileSize,
        t: 1,
      };
    }
    const t = m.progress;
    const fromX = (m.fromCol - (cols - 1) / 2) * tileSize;
    const fromZ = (m.fromRow - (rows - 1) / 2) * tileSize;
    const toX = (m.toCol - (cols - 1) / 2) * tileSize;
    const toZ = (m.toRow - (rows - 1) / 2) * tileSize;
    return {
      x: fromX + (toX - fromX) * t,
      z: fromZ + (toZ - fromZ) * t,
      t,
    };
  }
}
