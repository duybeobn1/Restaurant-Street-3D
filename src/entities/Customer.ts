import type { CustomerData } from "../types";
import { Entity } from "./Entity";
import { createCharacterMesh } from "../systems/MeshFactory";

export class Customer extends Entity {
  data: CustomerData;

  constructor(data: CustomerData) {
    const mesh = createCharacterMesh(data.tint, 0xffffff);
    super(data.uid, mesh, data.col, data.row, 2.4);
    this.data = data;
  }

  syncData(): void {
    this.data.col = this.col;
    this.data.row = this.row;
  }
}
