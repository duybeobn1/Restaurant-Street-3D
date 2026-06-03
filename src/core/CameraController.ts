import * as THREE from "three";

const MIN_ELEV = 0.2;
const MAX_ELEV = Math.PI / 2.2;
const MIN_DIST = 4;
const MAX_DIST = 32;

export class CameraController {
  readonly camera: THREE.PerspectiveCamera;
  readonly target: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private azimuth = Math.PI * 0.25;
  private elevation = Math.PI * 0.28;
  private distance = 12;

  private isRotating = false;
  private isPanning = false;
  private lastX = 0;
  private lastY = 0;
  private dragMoved = false;
  private downX = 0;
  private downY = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  attach(canvas: HTMLCanvasElement): void {
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("mousemove", this.onMouseMove);
    canvas.addEventListener("wheel", this.onWheel, { passive: false });
  }

  reset(cols: number, rows: number): void {
    this.target.set(0, 0, 0);
    this.azimuth = Math.PI * 0.25;
    this.elevation = Math.PI * 0.35;
    this.distance = Math.max(cols, rows) * 1.8;
    this.update();
  }

  frameGrid(cols: number, rows: number, margin = 1.5): void {
    this.target.set(0, 0, 0);
    this.distance = Math.max(cols, rows) * margin;
    this.update();
  }

  update(): void {
    const x =
      this.target.x + this.distance * Math.cos(this.elevation) * Math.sin(this.azimuth);
    const y = this.target.y + this.distance * Math.sin(this.elevation);
    const z =
      this.target.z + this.distance * Math.cos(this.elevation) * Math.cos(this.azimuth);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }

  /** Returns true if a click was a real click (not a drag). */
  consumeClick(): boolean {
    const wasClick = !this.dragMoved;
    this.dragMoved = false;
    return wasClick;
  }

  private onMouseDown = (e: MouseEvent): void => {
    this.downX = e.clientX;
    this.downY = e.clientY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.dragMoved = false;
    if (e.button === 0) this.isRotating = true;
    if (e.button === 2) this.isPanning = true;
  };

  private onMouseUp = (_e: MouseEvent): void => {
    this.isRotating = false;
    this.isPanning = false;
  };

  private onMouseMove = (e: MouseEvent): void => {
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;

    if (Math.hypot(e.clientX - this.downX, e.clientY - this.downY) > 4) {
      this.dragMoved = true;
    }

    if (this.isRotating) {
      this.azimuth -= dx * 0.01;
      this.elevation = Math.max(MIN_ELEV, Math.min(MAX_ELEV, this.elevation + dy * 0.01));
    } else if (this.isPanning) {
      const right = new THREE.Vector3();
      this.camera.getWorldDirection(right);
      right.y = 0;
      right.normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const fwd = new THREE.Vector3().crossVectors(up, right).normalize();
      this.target.addScaledVector(right, -dx * 0.02);
      this.target.addScaledVector(fwd, dy * 0.02);
    }
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    this.distance = Math.max(MIN_DIST, Math.min(MAX_DIST, this.distance * factor));
  };
}
