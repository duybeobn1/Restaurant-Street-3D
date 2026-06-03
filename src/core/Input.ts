import * as THREE from "three";
import type { GridPos } from "../types";
import type { Grid } from "../systems/Grid";

const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

export type InputEvent =
  | { type: "tile_click"; pos: GridPos }
  | { type: "tile_hover"; pos: GridPos | null }
  | { type: "key"; code: string };

export class Input {
  readonly camera: THREE.PerspectiveCamera;
  readonly scene: THREE.Scene;
  readonly canvas: HTMLCanvasElement;
  readonly raycaster: THREE.Raycaster;
  readonly listeners: ((e: InputEvent) => void)[] = [];

  activeGrid: Grid | null = null;

  private mouseNdc = new THREE.Vector2();
  private hoveredTile: GridPos | null = null;
  private worldPoint = new THREE.Vector3();
  private worldPointSet = false;

  constructor(
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    canvas: HTMLCanvasElement,
  ) {
    this.camera = camera;
    this.scene = scene;
    this.canvas = canvas;
    this.raycaster = new THREE.Raycaster();
  }

  attach(): void {
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("click", this.onClick);
    window.addEventListener("keydown", this.onKeyDown);
  }

  on(cb: (e: InputEvent) => void): void {
    this.listeners.push(cb);
  }

  update(): void {
    if (!this.worldPointSet) return;
    this.raycaster.setFromCamera(this.mouseNdc, this.camera);
    const hit = new THREE.Vector3();
    const ok = this.raycaster.ray.intersectPlane(GROUND_PLANE, hit);
    if (!ok) return;
    this.worldPoint.copy(hit);

    if (this.activeGrid) {
      const gp = this.activeGrid.worldToGrid(hit.x, hit.z);
      const same = gp?.col === this.hoveredTile?.col && gp?.row === this.hoveredTile?.row;
      if (!same) {
        this.hoveredTile = gp;
        this.emit({ type: "tile_hover", pos: gp });
      }
    }
  }

  getWorldPoint(): THREE.Vector3 {
    return this.worldPoint;
  }

  getHoveredTile(): GridPos | null {
    return this.hoveredTile;
  }

  private emit(e: InputEvent): void {
    for (const cb of this.listeners) cb(e);
  }

  private onMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.worldPointSet = true;
  };

  private onClick = (_e: MouseEvent): void => {
    if (this.hoveredTile) {
      this.emit({ type: "tile_click", pos: this.hoveredTile });
    }
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }
    this.emit({ type: "key", code: e.code });
  };
}
