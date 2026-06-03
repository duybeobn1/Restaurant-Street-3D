import type { WorkerData } from "../types";
import { Entity } from "./Entity";
import { createCharacterMesh } from "../systems/MeshFactory";
import type { Restaurant } from "../world/Restaurant";

export class Worker extends Entity {
  data: WorkerData;
  restaurant: Restaurant;

  constructor(restaurant: Restaurant, data: WorkerData) {
    const mesh = createCharacterMesh(workerTint(data.role), hatColor(data.role));
    super(data.uid, mesh, data.col, data.row, 3);
    this.data = data;
    this.restaurant = restaurant;
  }

  syncData(): void {
    this.data.col = this.col;
    this.data.row = this.row;
  }
}

function workerTint(role: WorkerData["role"]): number {
  switch (role) {
    case "chef":
      return 0xffffff;
    case "waiter":
      return 0x6a4a8a;
    case "cleaner":
      return 0x4a6a4a;
  }
}

function hatColor(role: WorkerData["role"]): number {
  switch (role) {
    case "chef":
      return 0xff4444; // red chef hat
    case "waiter":
      return 0xffcc00; // yellow
    case "cleaner":
      return 0x44ff44; // green
  }
}
