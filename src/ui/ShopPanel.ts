import type { ItemCategory, ItemDef } from "../types";
import { ITEMS, itemCatalog } from "../data/items";
import type { World } from "../core/World";

type View = "indoor" | "outdoor";

const CATEGORIES_INDOOR: ItemCategory[] = [
  "floor",
  "wall",
  "door",
  "table",
  "chair",
  "stove",
  "sink",
  "toilet",
  "trash",
  "decoration",
];

const CATEGORIES_OUTDOOR: ItemCategory[] = [
  "decoration",
  "plot",
  "pond",
];

export class ShopPanel {
  readonly world: World;
  readonly root: HTMLElement;
  private panelEl!: HTMLElement;
  private tabsEl!: HTMLElement;
  private gridEl!: HTMLElement;
  private currentCategory: ItemCategory = "floor";
  private view: View = "indoor";
  private open = false;

  constructor(world: World) {
    this.world = world;
    this.root = document.createElement("div");
    this.root.id = "shop";
    Object.assign(this.root.style, {
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      pointerEvents: "none",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#f2e8d8",
    } as Partial<CSSStyleDeclaration>);
  }

  init(): void {
    this.build();
    document.body.appendChild(this.root);
    this.world.input.on((e) => {
      if (e.type === "tile_hover") {
        if (this.world.currentView === "indoor") {
          this.world.restaurant.setSelectedTile(e.pos?.col ?? null, e.pos?.row ?? null);
        } else {
          this.world.outdoor.setSelectedTile(e.pos?.col ?? null, e.pos?.row ?? null);
        }
      } else if (e.type === "tile_click") {
        this.handleTileClick(e.pos.col, e.pos.row);
      } else if (e.type === "key" && e.code === "Escape") {
        this.world.state.selectedItemId = undefined;
        this.refresh();
        this.world.restaurant.hideGhost();
        this.world.outdoor.hideGhost();
      }
    });
  }

  toggle(): void {
    this.open = !this.open;
    this.panelEl.style.display = this.open ? "flex" : "none";
  }

  setView(view: View): void {
    this.view = view;
    this.world.setView(view);
    const cats = view === "indoor" ? CATEGORIES_INDOOR : CATEGORIES_OUTDOOR;
    this.currentCategory = cats[0];
    this.refresh();
  }

  refresh(): void {
    this.renderTabs();
    this.renderItems();
  }

  private build(): void {
    this.panelEl = document.createElement("div");
    Object.assign(this.panelEl.style, {
      position: "absolute",
      right: "18px",
      top: "80px",
      bottom: "80px",
      width: "320px",
      background: "rgba(31,26,23,0.95)",
      border: "1px solid #4a3a30",
      borderRadius: "10px",
      display: "none",
      flexDirection: "column",
      pointerEvents: "auto",
    } as Partial<CSSStyleDeclaration>);

    const header = document.createElement("div");
    Object.assign(header.style, {
      padding: "12px 16px",
      borderBottom: "1px solid #4a3a30",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    } as Partial<CSSStyleDeclaration>);
    const title = document.createElement("div");
    title.textContent = "Shop";
    Object.assign(title.style, { fontSize: "16px", fontWeight: "600" } as Partial<CSSStyleDeclaration>);
    const viewToggle = document.createElement("div");
    Object.assign(viewToggle.style, { display: "flex", gap: "4px" } as Partial<CSSStyleDeclaration>);
    const indoorBtn = document.createElement("button");
    indoorBtn.textContent = "Indoor";
    const outdoorBtn = document.createElement("button");
    outdoorBtn.textContent = "Outdoor";
    [indoorBtn, outdoorBtn].forEach((b) => {
      Object.assign(b.style, {
        background: "transparent",
        color: "#f2e8d8",
        border: "1px solid #4a3a30",
        borderRadius: "6px",
        padding: "4px 10px",
        fontSize: "12px",
        cursor: "pointer",
        fontFamily: "inherit",
      } as Partial<CSSStyleDeclaration>);
    });
    indoorBtn.addEventListener("click", () => this.setView("indoor"));
    outdoorBtn.addEventListener("click", () => this.setView("outdoor"));
    viewToggle.appendChild(indoorBtn);
    viewToggle.appendChild(outdoorBtn);
    header.appendChild(title);
    header.appendChild(viewToggle);
    this.panelEl.appendChild(header);

    this.tabsEl = document.createElement("div");
    Object.assign(this.tabsEl.style, {
      display: "flex",
      flexWrap: "wrap",
      gap: "4px",
      padding: "8px 12px",
      borderBottom: "1px solid #4a3a30",
    } as Partial<CSSStyleDeclaration>);
    this.panelEl.appendChild(this.tabsEl);

    this.gridEl = document.createElement("div");
    Object.assign(this.gridEl.style, {
      flex: "1",
      overflowY: "auto",
      padding: "12px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "8px",
    } as Partial<CSSStyleDeclaration>);
    this.panelEl.appendChild(this.gridEl);

    this.root.appendChild(this.panelEl);
    this.refresh();
  }

  private renderTabs(): void {
    this.tabsEl.innerHTML = "";
    const cats = this.view === "indoor" ? CATEGORIES_INDOOR : CATEGORIES_OUTDOOR;
    for (const cat of cats) {
      const btn = document.createElement("button");
      btn.textContent = this.catLabel(cat);
      const active = cat === this.currentCategory;
      Object.assign(btn.style, {
        background: active ? "rgba(242,182,90,0.3)" : "transparent",
        color: active ? "#f2b65a" : "#a89880",
        border: active ? "1px solid #f2b65a" : "1px solid #4a3a30",
        borderRadius: "6px",
        padding: "4px 10px",
        fontSize: "11px",
        cursor: "pointer",
        fontFamily: "inherit",
        textTransform: "capitalize",
      } as Partial<CSSStyleDeclaration>);
      btn.addEventListener("click", () => {
        this.currentCategory = cat;
        this.renderTabs();
        this.renderItems();
      });
      this.tabsEl.appendChild(btn);
    }
  }

  private renderItems(): void {
    this.gridEl.innerHTML = "";
    const items = ITEMS.filter(
      (i) =>
        i.category === this.currentCategory &&
        (i.area === this.view || i.area === "both"),
    );
    if (items.length === 0) {
      const empty = document.createElement("div");
      Object.assign(empty.style, {
        gridColumn: "1 / -1",
        textAlign: "center",
        color: "#a89880",
        fontSize: "12px",
        padding: "20px",
      } as Partial<CSSStyleDeclaration>);
      empty.textContent = "No items in this category";
      this.gridEl.appendChild(empty);
      return;
    }
    for (const item of items) {
      this.gridEl.appendChild(this.renderItemCard(item));
    }
  }

  private renderItemCard(item: ItemDef): HTMLElement {
    const card = document.createElement("div");
    const level = this.world.state.level;
    const unlocked = item.levelRequired <= level;
    const selected = this.world.state.selectedItemId === item.id;
    Object.assign(card.style, {
      background: selected
        ? "rgba(242,182,90,0.25)"
        : unlocked
          ? "rgba(60,50,40,0.5)"
          : "rgba(40,30,25,0.5)",
      border: selected
        ? "1px solid #f2b65a"
        : "1px solid #4a3a30",
      borderRadius: "8px",
      padding: "10px",
      cursor: unlocked ? "pointer" : "not-allowed",
      opacity: unlocked ? "1" : "0.5",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    } as Partial<CSSStyleDeclaration>);

    const swatch = document.createElement("div");
    Object.assign(swatch.style, {
      width: "100%",
      height: "40px",
      background: `#${item.color.toString(16).padStart(6, "0")}`,
      borderRadius: "4px",
    } as Partial<CSSStyleDeclaration>);
    card.appendChild(swatch);

    const name = document.createElement("div");
    Object.assign(name.style, { fontSize: "13px", fontWeight: "500" } as Partial<CSSStyleDeclaration>);
    name.textContent = item.name;
    card.appendChild(name);

    const meta = document.createElement("div");
    Object.assign(meta.style, {
      fontSize: "11px",
      color: "#a89880",
      display: "flex",
      justifyContent: "space-between",
    } as Partial<CSSStyleDeclaration>);
    meta.innerHTML = unlocked
      ? `<span>$${item.cost}</span><span>Lv ${item.levelRequired}</span>`
      : `<span style="color:#cc6a6a">Locked</span><span>Lv ${item.levelRequired}</span>`;
    card.appendChild(meta);

    if (unlocked) {
      card.addEventListener("click", () => this.selectItem(item));
    }
    return card;
  }

  private selectItem(item: ItemDef): void {
    if (this.world.state.selectedItemId === item.id) {
      this.world.state.selectedItemId = undefined;
      this.world.restaurant.hideGhost();
    } else {
      this.world.state.selectedItemId = item.id;
    }
    this.refresh();
  }

  private handleTileClick(col: number, row: number): void {
    if (this.world.state.mode !== "build") return;
    if (!this.world.state.selectedItemId) return;
    const grid = this.view === "indoor" ? this.world.grid : this.world.outdoorGrid;
    const def = itemCatalog.get(this.world.state.selectedItemId);
    if (!def) return;
    if (this.world.state.money < def.cost) return;
    if (!grid.canPlace(col, row, def.id, this.world.state.level)) return;
    this.world.state.money -= def.cost;
    if (this.view === "indoor") {
      this.world.restaurant.placeItem(def.id, col, row);
    } else {
      this.world.outdoor.placeItem(def.id, col, row);
    }
  }

  private catLabel(cat: ItemCategory): string {
    return cat;
  }
}
