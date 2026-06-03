import { SAVE_KEY, SAVE_VERSION } from "../config";
import type { SaveData, WorldState } from "../types";

export class SaveSystem {
  save(state: WorldState): void {
    try {
      const data: SaveData = { version: SAVE_VERSION, state };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("[SaveSystem] save failed:", e);
    }
  }

  load(): WorldState | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as SaveData;
      if (data.version !== SAVE_VERSION) {
        console.warn(`[SaveSystem] save version ${data.version} != ${SAVE_VERSION}, ignoring`);
        return null;
      }
      return data.state;
    } catch (e) {
      console.error("[SaveSystem] load failed:", e);
      return null;
    }
  }

  exists(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  clear(): void {
    localStorage.removeItem(SAVE_KEY);
  }
}
