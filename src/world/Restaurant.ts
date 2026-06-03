import * as THREE from "three";
import { COLORS, TILE_SIZE } from "../config";
import type {
  CustomerData,
  GridPos,
  OrderTicket,
  PlacedItem,
  StoveState,
  TableState,
  WorldState,
} from "../types";
import { Grid } from "../systems/Grid";
import { Pathfinding } from "../systems/Pathfinding";
import { createGhostMesh, createMeshForItem, disposeMesh } from "../systems/MeshFactory";
import { getItem } from "../data/items";
import { getRecipe } from "../data/recipes";
import { Worker } from "../entities/Worker";
import { Customer } from "../entities/Customer";
import { getLevelConfig } from "../data/levels";

export class Restaurant {
  readonly group: THREE.Group;
  readonly floorGroup: THREE.Group;
  readonly itemGroup: THREE.Group;
  readonly entityGroup: THREE.Group;
  readonly grid: Grid;
  readonly state: WorldState;
  readonly pathfinder: Pathfinding;
  readonly workers: Map<string, Worker> = new Map();
  readonly customers: Map<string, Customer> = new Map();

  private meshByUid: Map<string, THREE.Object3D> = new Map();
  private ghost: THREE.Object3D | null = null;
  private doorCell: GridPos | null = null;
  private customerSpawnTimer = 2000;

  // Outdoor reference for replenishing ingredients
  outdoorRef?: { consumeFromOutdoor(itemId: string, qty: number): boolean };

  constructor(scene: THREE.Scene, grid: Grid, state: WorldState) {
    this.grid = grid;
    this.state = state;
    this.pathfinder = new Pathfinding(grid);

    this.group = new THREE.Group();
    this.group.name = "Restaurant";

    this.floorGroup = new THREE.Group();
    this.floorGroup.name = "Floor";
    this.group.add(this.floorGroup);

    this.itemGroup = new THREE.Group();
    this.itemGroup.name = "Items";
    this.group.add(this.itemGroup);

    this.entityGroup = new THREE.Group();
    this.entityGroup.name = "Entities";
    this.group.add(this.entityGroup);

    // Base ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: COLORS.grass, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    this.group.add(ground);

    scene.add(this.group);
  }

  build(): void {
    this.rebuildFloor();
    for (const item of this.state.indoor) {
      this.spawnItemMesh(item);
    }
    this.findDoor();
    for (const w of this.state.workers) {
      const worker = new Worker(this, w);
      this.workers.set(w.uid, worker);
      this.entityGroup.add(worker.mesh);
    }
    for (const c of this.state.customers) {
      const customer = new Customer(c);
      this.customers.set(c.uid, customer);
      this.entityGroup.add(customer.mesh);
    }
    this.rebuildStoveStates();
    this.rebuildTableStates();
  }

  private findDoor(): void {
    for (const item of this.state.indoor) {
      if (item.itemId === "door_basic") {
        this.doorCell = { col: item.col, row: item.row };
        return;
      }
    }
    this.doorCell = null;
  }

  private rebuildFloor(): void {
    // Clear existing floor
    for (const child of [...this.floorGroup.children]) {
      this.floorGroup.remove(child);
      disposeMesh(child);
    }
    const floorMat = new THREE.MeshStandardMaterial({
      color: COLORS.floor,
      roughness: 0.95,
    });
    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        const tile = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.05, 0.98), floorMat);
        const w = this.grid.gridToWorld(c, r, 0);
        tile.position.set(w.x, -0.01, w.z);
        tile.receiveShadow = true;
        tile.userData.gridCol = c;
        tile.userData.gridRow = r;
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
    mesh.userData.itemId = item.itemId;
    mesh.userData.gridCol = item.col;
    mesh.userData.gridRow = item.row;
    this.itemGroup.add(mesh);
    this.meshByUid.set(item.uid, mesh);
  }

  removeItem(uid: string): void {
    const mesh = this.meshByUid.get(uid);
    if (mesh) {
      this.itemGroup.remove(mesh);
      disposeMesh(mesh);
      this.meshByUid.delete(uid);
    }
    this.grid.remove(uid);
    const idx = this.state.indoor.findIndex((i) => i.uid === uid);
    if (idx >= 0) this.state.indoor.splice(idx, 1);
  }

  placeItem(itemId: string, col: number, row: number): PlacedItem | null {
    if (!this.grid.canPlace(col, row, itemId, this.state.level)) return null;
    const def = getItem(itemId);
    if (!def) return null;
    const placed: PlacedItem = {
      uid: crypto.randomUUID(),
      itemId,
      col,
      row,
      rotation: 0,
    };
    this.grid.setAt(col, row, placed);
    this.state.indoor.push(placed);
    this.spawnItemMesh(placed);
    if (itemId === "door_basic") this.findDoor();
    if (def.category === "stove") {
      this.state.stoveStates.push({
        uid: crypto.randomUUID(),
        placedUid: placed.uid,
      });
    }
    if (def.category === "table") {
      this.state.tableStates.push({
        uid: crypto.randomUUID(),
        placedUid: placed.uid,
        seats: def.seats ?? 2,
        occupiedBy: [],
        dirty: false,
      });
    }
    return placed;
  }

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
    // Tint the ghost based on validity
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

  // ============ AI / Tick ============

  tick(deltaMs: number, deltaSeconds: number): void {
    this.customerSpawnTimer -= deltaMs;
    if (this.customerSpawnTimer <= 0) {
      this.trySpawnCustomer();
      this.customerSpawnTimer = 8000 + Math.random() * 6000;
    }
    for (const customer of this.customers.values()) {
      this.updateCustomer(customer, deltaMs, deltaSeconds);
    }
    for (const worker of this.workers.values()) {
      this.updateWorker(worker, deltaMs, deltaSeconds);
    }
    this.updateOrders(deltaMs);
    this.updateEntities3D(deltaSeconds);
    this.pruneFinished();
  }

  private pruneFinished(): void {
    for (const [uid, customer] of this.customers) {
      if (customer.data.state === "leaving" && !customer.isMoving() && !this.doorCell) {
        this.removeCustomer(uid);
      }
      if (
        customer.data.state === "leaving" &&
        !customer.isMoving() &&
        this.doorCell &&
        customer.col === this.doorCell.col &&
        customer.row === this.doorCell.row
      ) {
        this.removeCustomer(uid);
      }
    }
  }

  /** Force a customer spawn immediately (for testing). */
  debugSpawnCustomer(): void {
    this.customerSpawnTimer = 0;
  }

  private trySpawnCustomer(): void {
    if (!this.doorCell) {
      console.warn("[Restaurant] cannot spawn customer: no door");
      return;
    }
    const table = this.findFreeTable();
    if (!table) {
      // silently skip — no free table yet
      return;
    }
    const seatPos = this.findFreeSeatAtTable(table);
    if (!seatPos) return;
    const path = this.pathfinder.findPath(this.doorCell, seatPos);
    if (!path) {
      console.warn(
        `[Restaurant] no path from door (${this.doorCell.col},${this.doorCell.row}) to seat (${seatPos.col},${seatPos.row})`,
      );
      return;
    }
    const tint = pickCustomerTint();
    const customer: Customer = this.makeCustomer({
      uid: crypto.randomUUID(),
      col: this.doorCell.col,
      row: this.doorCell.row,
      state: "walking_in",
      patience: 60_000,
      maxPatience: 60_000,
      satAtCol: seatPos.col,
      satAtRow: seatPos.row,
      tint,
    });
    customer.setPath(path);
    this.occupySeat(table, seatPos.col, seatPos.row, customer.data.uid);
    console.info(
      `[Restaurant] customer spawned at (${this.doorCell.col},${this.doorCell.row}) walking to (${seatPos.col},${seatPos.row})`,
    );
  }

  private findFreeTable(): TableState | null {
    for (const t of this.state.tableStates) {
      if (t.dirty) continue;
      if (t.occupiedBy.length < t.seats) return t;
    }
    return null;
  }

  private findFreeSeatAtTable(t: TableState): GridPos | null {
    const placed = this.state.indoor.find((i) => i.uid === t.placedUid);
    if (!placed) return null;
    // Sit at the table tile itself for simplicity
    if (!t.occupiedBy.includes("taken")) {
      return { col: placed.col, row: placed.row };
    }
    return null;
  }

  private occupySeat(t: TableState, _col: number, _row: number, customerUid: string): void {
    if (!t.occupiedBy.includes(customerUid)) t.occupiedBy.push(customerUid);
    t.occupiedBy.push("taken");
  }

  private freeSeat(t: TableState, customerUid: string): void {
    t.occupiedBy = t.occupiedBy.filter((u) => u !== customerUid && u !== "taken");
  }

  private makeCustomer(data: CustomerData): Customer {
    const customer = new Customer(data);
    this.customers.set(data.uid, customer);
    this.state.customers.push(data);
    this.entityGroup.add(customer.mesh);
    return customer;
  }

  private removeCustomer(uid: string): void {
    const customer = this.customers.get(uid);
    if (customer) {
      this.entityGroup.remove(customer.mesh);
      this.customers.delete(uid);
    }
    this.state.customers = this.state.customers.filter((c) => c.uid !== uid);
    // Free any seats
    for (const t of this.state.tableStates) {
      if (t.occupiedBy.includes(uid)) this.freeSeat(t, uid);
    }
  }

  private updateCustomer(customer: Customer, deltaMs: number, deltaSeconds: number): void {
    const arrived = customer.updateMovement(deltaSeconds);
    const data = customer.data;
    if (data.state === "walking_in" && arrived) {
      data.state = "seated";
      const dish = this.pickRandomDish();
      if (dish) data.orderItemId = dish;
      this.createOrder(data);
    }
    if (data.state === "eating" && arrived) {
      data.patience -= deltaMs;
    }
    if (data.state === "eating" && data.patience <= 0) {
      data.state = "paying";
    }
    if (data.state === "paying") {
      const order = this.state.orders.find(
        (o) => o.customerUid === data.uid && o.status === "served",
      );
      if (order) {
        const recipe = getRecipe(order.dishId);
        if (recipe) {
          this.state.money += recipe.sellPrice;
          this.state.gourmetPoints += recipe.gourmetPoints;
        }
        order.status = "served";
        this.leaveRestaurant(customer);
      }
    }
  }

  private leaveRestaurant(customer: Customer): void {
    if (!this.doorCell) return;
    const data = customer.data;
    data.state = "leaving";
    const path = this.pathfinder.findPath({ col: data.col, row: data.row }, this.doorCell);
    if (path) customer.setPath(path);
    for (const t of this.state.tableStates) {
      if (t.occupiedBy.includes(data.uid)) t.dirty = true;
    }
  }

  private createOrder(data: CustomerData): void {
    if (!data.orderItemId) return;
    const order: OrderTicket = {
      uid: crypto.randomUUID(),
      customerUid: data.uid,
      dishId: data.orderItemId,
      createdAt: Date.now(),
      status: "pending",
    };
    this.state.orders.push(order);
  }

  private pickRandomDish(): string | null {
    const recipes = this.state.unlockedRecipes;
    if (recipes.length === 0) return null;
    return recipes[Math.floor(Math.random() * recipes.length)];
  }

  private updateWorker(worker: Worker, _deltaMs: number, deltaSeconds: number): void {
    const data = worker.data;
    const arrived = worker.updateMovement(deltaSeconds);
    if (data.role === "waiter") {
      this.updateWaiter(worker, arrived);
    } else if (data.role === "chef") {
      this.updateChef(worker, arrived);
    } else if (data.role === "cleaner") {
      this.updateCleaner(worker, arrived);
    }
    worker.syncData();
  }

  private updateWaiter(worker: Worker, arrived: boolean): void {
    const data = worker.data;
    if (data.state === "idle") {
      const order = this.state.orders.find(
        (o) => o.status === "ready" && !o.assignedWaiterUid,
      );
      if (order) {
        order.assignedWaiterUid = data.uid;
        data.state = "serving";
        const customer = this.state.customers.find((c) => c.uid === order.customerUid);
        if (customer) {
          const path = this.pathfinder.findPath(
            { col: data.col, row: data.row },
            { col: customer.col, row: customer.row },
          );
          if (path) worker.setPath(path);
        }
      }
    } else if (data.state === "serving" && arrived) {
      const order = this.state.orders.find((o) => o.assignedWaiterUid === data.uid);
      if (order) {
        const customer = this.state.customers.find((c) => c.uid === order.customerUid);
        if (customer) {
          order.status = "served";
          customer.state = "eating";
          customer.patience = 8000;
        }
      }
      data.state = "idle";
    }
  }

  private updateChef(worker: Worker, arrived: boolean): void {
    const data = worker.data;
    if (data.state === "idle") {
      const order = this.state.orders.find(
        (o) => o.status === "pending" && !o.assignedChefUid,
      );
      if (!order) return;
      // Find a free stove
      const stove = this.findFreeStove(order);
      if (!stove) return;
      // Check ingredients
      if (!this.hasIngredients(order.dishId)) return;
      order.assignedChefUid = data.uid;
      order.status = "cooking";
      stove.assignedChefUid = data.uid;
      stove.currentDishId = order.dishId;
      stove.cookStartedAt = Date.now();
      const recipe = getRecipe(order.dishId);
      const speed = this.getStoveSpeed(stove);
      stove.cookEndsAt = Date.now() + (recipe?.cookTime ?? 5000) / speed;
      data.state = "cooking";
      // Walk chef to the stove
      const path = this.pathfinder.findPath(
        { col: data.col, row: data.row },
        { col: stove.col, row: stove.row },
      );
      if (path) worker.setPath(path);
    } else if (data.state === "cooking" && arrived) {
      // Chef is at the stove; just wait for the cook timer
      const order = this.state.orders.find(
        (o) => o.assignedChefUid === data.uid && o.status === "cooking",
      );
      const stove = this.state.stoveStates.find(
        (s) => s.assignedChefUid === data.uid,
      );
      if (order && stove && stove.cookEndsAt && Date.now() >= stove.cookEndsAt) {
        this.consumeIngredients(order.dishId);
        order.status = "ready";
        stove.currentDishId = undefined;
        stove.cookStartedAt = undefined;
        stove.cookEndsAt = undefined;
        stove.assignedChefUid = undefined;
        data.state = "idle";
      }
    }
  }

  private updateCleaner(worker: Worker, arrived: boolean): void {
    const data = worker.data;
    if (data.state === "idle") {
      const dirtyTable = this.state.tableStates.find((t) => t.dirty);
      if (dirtyTable) {
        const placed = this.state.indoor.find((i) => i.uid === dirtyTable.placedUid);
        if (placed) {
          data.state = "cleaning";
          const path = this.pathfinder.findPath(
            { col: data.col, row: data.row },
            { col: placed.col, row: placed.row },
          );
          if (path) worker.setPath(path);
        }
      }
    } else if (data.state === "cleaning" && arrived) {
      // Clean the table we're on
      const table = this.state.tableStates.find((t) => {
        const p = this.state.indoor.find((i) => i.uid === t.placedUid);
        return p && p.col === data.col && p.row === data.row;
      });
      if (table) table.dirty = false;
      data.state = "idle";
    }
  }

  private updateOrders(_deltaMs: number): void {
    // orders are processed by chefs and waiters
  }

  private findFreeStove(_order: OrderTicket): (StoveState & { col: number; row: number }) | null {
    for (const s of this.state.stoveStates) {
      if (s.assignedChefUid) continue;
      if (s.currentDishId) continue;
      const placed = this.state.indoor.find((i) => i.uid === s.placedUid);
      if (!placed) continue;
      return Object.assign({}, s, { col: placed.col, row: placed.row });
    }
    return null;
  }

  private getStoveSpeed(stove: StoveState): number {
    const placed = this.state.indoor.find((i) => i.uid === stove.placedUid);
    if (!placed) return 1;
    const def = getItem(placed.itemId);
    return def?.cookSpeed ?? 1;
  }

  private hasIngredients(dishId: string): boolean {
    const recipe = getRecipe(dishId);
    if (!recipe) return false;
    for (const ing of recipe.ingredients) {
      const have = this.state.inventory[ing] ?? 0;
      if (have <= 0) {
        if (!this.outdoorRef?.consumeFromOutdoor(ing, 1)) return false;
      }
    }
    return true;
  }

  private consumeIngredients(dishId: string): void {
    const recipe = getRecipe(dishId);
    if (!recipe) return;
    for (const ing of recipe.ingredients) {
      const have = this.state.inventory[ing] ?? 0;
      if (have > 0) {
        this.state.inventory[ing] = have - 1;
      } else {
        this.outdoorRef?.consumeFromOutdoor(ing, 1);
      }
    }
  }

  private updateEntities3D(_deltaSeconds: number): void {
    for (const worker of this.workers.values()) {
      const { x, z } = worker.worldXZ(this.grid.cols, this.grid.rows, TILE_SIZE);
      worker.mesh.position.set(x, 0, z);
      if (worker.movement.isMoving()) {
        const m = worker.movement;
        const dx = m.toCol - m.fromCol;
        const dz = m.toRow - m.fromRow;
        if (dx !== 0 || dz !== 0) {
          worker.mesh.rotation.y = Math.atan2(dx, dz);
        }
      }
    }
    for (const customer of this.customers.values()) {
      const { x, z } = customer.worldXZ(this.grid.cols, this.grid.rows, TILE_SIZE);
      customer.mesh.position.set(x, 0, z);
      if (customer.movement.isMoving()) {
        const m = customer.movement;
        const dx = m.toCol - m.fromCol;
        const dz = m.toRow - m.fromRow;
        if (dx !== 0 || dz !== 0) {
          customer.mesh.rotation.y = Math.atan2(dx, dz);
        }
      }
    }
  }

  private rebuildStoveStates(): void {
    const valid = new Set(this.state.indoor.filter((i) => getItem(i.itemId)?.category === "stove").map((i) => i.uid));
    this.state.stoveStates = this.state.stoveStates.filter((s) => valid.has(s.placedUid));
    for (const placed of this.state.indoor) {
      const def = getItem(placed.itemId);
      if (def?.category === "stove" && !this.state.stoveStates.find((s) => s.placedUid === placed.uid)) {
        this.state.stoveStates.push({ uid: crypto.randomUUID(), placedUid: placed.uid });
      }
    }
  }

  private rebuildTableStates(): void {
    const valid = new Set(this.state.indoor.filter((i) => getItem(i.itemId)?.category === "table").map((i) => i.uid));
    this.state.tableStates = this.state.tableStates.filter((t) => valid.has(t.placedUid));
    for (const placed of this.state.indoor) {
      const def = getItem(placed.itemId);
      if (def?.category === "table" && !this.state.tableStates.find((t) => t.placedUid === placed.uid)) {
        this.state.tableStates.push({
          uid: crypto.randomUUID(),
          placedUid: placed.uid,
          seats: def.seats ?? 2,
          occupiedBy: [],
          dirty: false,
        });
      }
    }
  }

  /** Sync level-based grid size and unlocks. */
  applyLevel(): void {
    const cfg = getLevelConfig(this.state.level);
    this.grid.resize(cfg.indoorSize);
    this.outdoorGridResize?.(cfg.outdoorSize);
    for (const _id of cfg.unlocks) {
      // unlocks are handled by the item catalog (no per-player owned state yet)
    }
    for (const dishId of cfg.recipeUnlocks) {
      if (!this.state.unlockedRecipes.includes(dishId)) {
        this.state.unlockedRecipes.push(dishId);
      }
    }
    this.rebuildFloor();
  }

  outdoorGridResize?: (size: number) => void;
}

function pickCustomerTint(): number {
  const tints = [0x4a8acc, 0xcc4a4a, 0x4acc4a, 0xcccc4a, 0xcc4acc, 0x4acccc, 0xa05a4a];
  return tints[Math.floor(Math.random() * tints.length)];
}
