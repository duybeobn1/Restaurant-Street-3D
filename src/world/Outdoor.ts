import * as THREE from "three";
import { COLORS } from "../config";
import type { PlacedItem, WorldState } from "../types";
import { Grid } from "../systems/Grid";
import { getItem } from "../data/items";
import { createGhostMesh, createMeshForItem, disposeMesh } from "../systems/MeshFactory";

type Plot = {
  uid: string;
  placedUid: string;
  ingredient: string;
  plantedAt: number;
  growTime: number;
};

export class Outdoor {
  readonly group: THREE.Group;
  readonly floorGroup: THREE.Group;
  readonly itemGroup: THREE.Group;
  readonly grid: Grid;
  readonly state: WorldState;
  private meshByUid: Map<string, THREE.Object3D> = new Map();
  private plots: Map<string, Plot> = new Map();

  constructor(scene: THREE.Scene, grid: Grid, state: WorldState) {
    this.grid = grid;
    this.state = state;
    this.group = new THREE.Group();
    this.group.name = "Outdoor";
    this.group.position.set(0, 0, -10);
    this.floorGroup = new THREE.Group();
    this.itemGroup = new THREE.Group();
    this.group.add(this.floorGroup);
    this.group.add(this.itemGroup);
    scene.add(this.group);
  }

  build(): void {
    this.rebuildFloor();
    for (const item of this.state.outdoor) {
      this.spawnItemMesh(item);
    }
  }

  private ghost: THREE.Object3D | null = null;

  setSelectedTile(col: number | null, row: number | null): void {
    if (col === null || row === null) {
      this.hideGhost();
      return;
    }
    if (!this.state.selectedItemId) {
      this.hideGhost();
      return;
    }
    const def = getItem(this.state.selectedItemId);
    if (!def) return;
    const canPlace = this.grid.canPlace(col, row, this.state.selectedItemId, this.state.level);
    if (!this.ghost || this.ghost.userData.itemId !== def.id) {
      this.hideGhost();
      this.ghost = createGhostMesh(def, canPlace);
      this.group.add(this.ghost);
    }
    const w = this.grid.gridToWorld(col, row, 0);
    this.ghost.position.set(w.x, 0, w.z);
    const tint = canPlace ? COLORS.ghost : COLORS.ghostBad;
    this.ghost.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          color: tint,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
        });
      }
    });
  }

  hideGhost(): void {
    if (this.ghost) {
      this.group.remove(this.ghost);
      disposeMesh(this.ghost);
      this.ghost = null;
    }
  }

  private rebuildFloor(): void {
    for (const child of [...this.floorGroup.children]) {
      this.floorGroup.remove(child);
      disposeMesh(child);
    }
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.grass, roughness: 1 });
    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        const tile = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.05, 0.98), mat);
        const w = this.grid.gridToWorld(c, r, 0);
        tile.position.set(w.x, -0.01, w.z);
        tile.receiveShadow = true;
        this.floorGroup.add(tile);
      }
    }
  }

  private spawnItemMesh(item: PlacedItem): void {
    const def = getItem(item.itemId);
    if (!def) return;
    const mesh = createMeshForItem(def);
    const w = this.grid.gridToWorld(item.col, item.row, 0);
    mesh.position.set(w.x, 0, w.z);
    mesh.userData.uid = item.uid;
    this.itemGroup.add(mesh);
    this.meshByUid.set(item.uid, mesh);
  }

  placeItem(itemId: string, col: number, row: number): PlacedItem | null {
    if (!this.grid.canPlace(col, row, itemId, this.state.level)) return null;
    const placed: PlacedItem = {
      uid: crypto.randomUUID(),
      itemId,
      col,
      row,
      rotation: 0,
    };
    this.grid.setAt(col, row, placed);
    this.state.outdoor.push(placed);
    this.spawnItemMesh(placed);
    if (itemId === "plot") this.plantInPlot(placed);
    return placed;
  }

  removeItem(uid: string): void {
    const mesh = this.meshByUid.get(uid);
    if (mesh) {
      this.itemGroup.remove(mesh);
      disposeMesh(mesh);
      this.meshByUid.delete(uid);
    }
    this.grid.remove(uid);
    this.state.outdoor = this.state.outdoor.filter((i) => i.uid !== uid);
    this.plots.delete(uid);
  }

  private plantInPlot(placed: PlacedItem): void {
    const ingredients = ["i_tomato", "i_lettuce", "i_flour", "i_rice"];
    const ing = ingredients[Math.floor(Math.random() * ingredients.length)];
    this.plots.set(placed.uid, {
      uid: crypto.randomUUID(),
      placedUid: placed.uid,
      ingredient: ing,
      plantedAt: Date.now(),
      growTime: 30_000,
    });
  }

  /** Pull an ingredient from the outdoor (plots/pond) inventory. */
  consumeFromOutdoor(itemId: string, _qty: number): boolean {
    for (const plot of this.plots.values()) {
      if (plot.ingredient !== itemId) continue;
      if (Date.now() - plot.plantedAt < plot.growTime) continue;
      plot.plantedAt = Date.now();
      return true;
    }
    return false;
  }

  tick(_deltaMs: number, _deltaSeconds: number): void {
    // Auto-replenish a small amount of each ingredient over time
    const replenish: Record<string, number> = {
      i_flour: 6000,
      i_sugar: 8000,
      i_salt: 10000,
      i_water: 4000,
      i_lettuce: 12000,
      i_tomato: 12000,
    };
    for (const [ing, interval] of Object.entries(replenish)) {
      const now = Date.now();
      const last = (this.state as any)[`__last_${ing}`] ?? 0;
      if (now - last >= interval) {
        (this.state as any)[`__last_${ing}`] = now;
        this.state.inventory[ing] = (this.state.inventory[ing] ?? 0) + 1;
      }
    }
  }
}
