import * as THREE from "three";
import { COLORS } from "../config";
import { Grid } from "../systems/Grid";
import { Pathfinding } from "../systems/Pathfinding";
import { GameLoop } from "../systems/GameLoop";
import { SaveSystem } from "../systems/SaveSystem";
import { CameraController } from "./CameraController";
import { Input } from "./Input";
import { Restaurant } from "../world/Restaurant";
import { Outdoor } from "../world/Outdoor";
import { HUD } from "../ui/HUD";
import { ShopPanel } from "../ui/ShopPanel";
import { createInitialState } from "../data/initialState";
import { itemCatalog } from "../data/items";
import { getLevelConfig } from "../data/levels";
import type { WorldState } from "../types";

export class World {
  readonly canvas: HTMLCanvasElement;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly clock: THREE.Clock;

  readonly grid: Grid;
  readonly outdoorGrid: Grid;
  readonly pathfinder: Pathfinding;
  readonly outdoorPathfinder: Pathfinding;
  readonly saveSystem: SaveSystem;
  readonly gameLoop: GameLoop;
  readonly cameraController: CameraController;
  readonly input: Input;
  readonly restaurant: Restaurant;
  readonly outdoor: Outdoor;
  readonly hud: HUD;
  readonly shop: ShopPanel;

  state: WorldState;
  currentView: "indoor" | "outdoor" = "indoor";

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.sky);
    this.scene.fog = new THREE.Fog(COLORS.sky, 18, 40);

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      200,
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.clock = new THREE.Clock(false);

    this.state = createInitialState();

    const indoorSize = getLevelConfig(this.state.level).indoorSize;
    const outdoorSize = getLevelConfig(this.state.level).outdoorSize;

    this.grid = new Grid(itemCatalog, indoorSize, "indoor");
    this.outdoorGrid = new Grid(itemCatalog, outdoorSize, "outdoor");
    this.outdoorGrid.worldOffset = { x: 0, z: -14 };

    this.pathfinder = new Pathfinding(this.grid);
    this.outdoorPathfinder = new Pathfinding(this.outdoorGrid);

    this.saveSystem = new SaveSystem();
    this.gameLoop = new GameLoop();
    this.cameraController = new CameraController(this.camera);
    this.input = new Input(this.camera, this.scene, this.canvas);
    this.input.activeGrid = this.grid;

    this.restaurant = new Restaurant(this.scene, this.grid, this.state);
    this.outdoor = new Outdoor(this.scene, this.outdoorGrid, this.state);
    this.hud = new HUD(this);
    this.shop = new ShopPanel(this);
  }

  async init(): Promise<void> {
    this.setupLighting();
    this.cameraController.reset(this.grid.cols, this.grid.rows);
    this.bindEvents();

    const loaded = this.saveSystem.load();
    if (loaded) {
      this.state = loaded;
      const cfg = getLevelConfig(this.state.level);
      this.grid.resize(cfg.indoorSize);
      this.outdoorGrid.resize(cfg.outdoorSize);
    }

    if (this.state.workers.length === 0) {
      this.spawnStartingWorkers();
    }

    // Cross-link restaurant & outdoor for ingredient consumption
    this.restaurant.outdoorRef = {
      consumeFromOutdoor: (id, qty) => this.outdoor.consumeFromOutdoor(id, qty),
    };

    this.restaurant.build();
    this.outdoor.build();
    this.hud.init();
    this.shop.init();
  }

  start(): void {
    this.clock.start();
    this.gameLoop.start((dt) => this.tick(dt));
    this.loop();
  }

  private loop = (): void => {
    requestAnimationFrame(this.loop);
    const delta = this.clock.getDelta();
    this.gameLoop.update(delta);
    this.cameraController.update();
    this.input.update();
    this.renderer.render(this.scene, this.camera);
  };

  private tick(deltaMs: number): void {
    const deltaSec = deltaMs / 1000;
    this.state.minute += (deltaMs / 1000) * 0.5; // 1 real second = 30 in-game minutes
    while (this.state.minute >= 60) {
      this.state.minute -= 60;
      this.state.hour = (this.state.hour + 1) % 24;
      if (this.state.hour === 0) this.state.day += 1;
    }
    this.restaurant.tick(deltaMs, deltaSec);
    this.outdoor.tick(deltaMs, deltaSec);
    this.hud.update();
  }

  setView(view: "indoor" | "outdoor"): void {
    this.currentView = view;
    this.input.activeGrid = view === "indoor" ? this.grid : this.outdoorGrid;
    this.state.selectedItemId = undefined;
    this.restaurant.hideGhost();
    this.outdoor.hideGhost();
    const g = this.input.activeGrid;
    this.cameraController.frameGrid(g.cols, g.rows, 1.6);
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(COLORS.ambient, 0.55);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(COLORS.sunlight, 1.1);
    sun.position.set(10, 16, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 60;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);

    const hemi = new THREE.HemisphereLight(0x88aaff, 0x442211, 0.25);
    this.scene.add(hemi);
  }

  private bindEvents(): void {
    window.addEventListener("resize", this.onResize);
    this.input.attach();
  }

  private onResize = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  };

  private spawnStartingWorkers(): void {
    // Find a spot close to the door (which is at the bottom-center of the grid)
    const doorRow = this.grid.rows - 1;
    const doorCol = Math.floor(this.grid.cols / 2);
    const startPositions: { col: number; row: number }[] = [];
    // Try cells next to the door first
    const candidates = [
      { col: doorCol, row: doorRow - 1 },
      { col: doorCol - 1, row: doorRow - 1 },
      { col: doorCol + 1, row: doorRow - 1 },
      { col: doorCol, row: doorRow - 2 },
      { col: doorCol - 1, row: doorRow - 2 },
      { col: doorCol + 1, row: doorRow - 2 },
    ];
    for (const c of candidates) {
      if (this.grid.isWalkable(c.col, c.row)) {
        startPositions.push(c);
        if (startPositions.length >= 2) break;
      }
    }
    // Fallback: any walkable cell
    if (startPositions.length < 2) {
      outer: for (let r = this.grid.rows - 1; r >= 0; r--) {
        for (let c = 0; c < this.grid.cols; c++) {
          if (this.grid.isWalkable(c, r)) {
            startPositions.push({ col: c, row: r });
            if (startPositions.length >= 2) break outer;
          }
        }
      }
    }
    const roles: ("waiter" | "chef")[] = ["waiter", "chef"];
    const names = ["Alex", "Jamie"];
    for (let i = 0; i < startPositions.length; i++) {
      const p = startPositions[i];
      this.state.workers.push({
        uid: crypto.randomUUID(),
        name: names[i] ?? "Worker",
        role: roles[i] ?? "waiter",
        energy: 100,
        maxEnergy: 100,
        skill: 1,
        col: p.col,
        row: p.row,
        state: "idle",
        stateEndsAt: 0,
      });
    }
    console.info(
      `[World] spawned ${startPositions.length} starting workers`,
      startPositions,
    );
  }

  save(): void {
    this.state.savedAt = Date.now();
    this.state.saveVersion = 1;
    this.saveSystem.save(this.state);
  }

  resetSave(): void {
    this.saveSystem.clear();
    location.reload();
  }
}
