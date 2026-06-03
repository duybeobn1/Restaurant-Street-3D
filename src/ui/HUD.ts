import type { World } from "../core/World";

export class HUD {
  readonly world: World;
  readonly root: HTMLElement;
  private moneyEl!: HTMLElement;
  private levelEl!: HTMLElement;
  private xpEl!: HTMLElement;
  private timeEl!: HTMLElement;
  private modeBtn!: HTMLButtonElement;
  private shopBtn!: HTMLButtonElement;
  private saveBtn!: HTMLButtonElement;
  private resetBtn!: HTMLButtonElement;
  private statusEl!: HTMLElement;
  private inventoryEl!: HTMLElement;
  private outdoorBtn!: HTMLButtonElement;
  private viewLabel!: HTMLElement;

  constructor(world: World) {
    this.world = world;
    this.root = document.createElement("div");
    this.root.id = "hud";
    Object.assign(this.root.style, {
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      pointerEvents: "none",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#f2e8d8",
      userSelect: "none",
    } as Partial<CSSStyleDeclaration>);
  }

  init(): void {
    this.buildTopBar();
    this.buildBottomBar();
    this.buildStatusPanel();
    document.body.appendChild(this.root);
    this.world.input.on((e) => {
      if (e.type === "key") {
        if (e.code === "KeyB") this.toggleMode();
        if (e.code === "KeyS") this.save();
        if (e.code === "KeyO") this.world.shop.toggle();
        if (e.code === "KeyI") this.world.setView("indoor");
        if (e.code === "KeyP") this.world.setView("outdoor");
        if (e.code === "KeyT") this.world.restaurant.debugSpawnCustomer();
      }
    });
  }

  private buildTopBar(): void {
    const bar = document.createElement("div");
    Object.assign(bar.style, {
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      padding: "12px 18px",
      display: "flex",
      gap: "16px",
      alignItems: "center",
      background: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0))",
      pointerEvents: "auto",
    } as Partial<CSSStyleDeclaration>);

    const makeStat = (label: string) => {
      const wrap = document.createElement("div");
      Object.assign(wrap.style, {
        background: "rgba(31,26,23,0.85)",
        border: "1px solid #4a3a30",
        borderRadius: "8px",
        padding: "6px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
      } as Partial<CSSStyleDeclaration>);
      const lbl = document.createElement("div");
      Object.assign(lbl.style, {
        fontSize: "10px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        color: "#a89880",
      } as Partial<CSSStyleDeclaration>);
      lbl.textContent = label;
      const val = document.createElement("div");
      Object.assign(val.style, {
        fontSize: "16px",
        fontWeight: "600",
        color: "#f2e8d8",
      } as Partial<CSSStyleDeclaration>);
      wrap.appendChild(lbl);
      wrap.appendChild(val);
      bar.appendChild(wrap);
      return val;
    };

    this.moneyEl = makeStat("Money");
    this.levelEl = makeStat("Level");
    this.xpEl = makeStat("XP");
    this.timeEl = makeStat("Time");

    this.viewLabel = document.createElement("div");
    Object.assign(this.viewLabel.style, {
      marginLeft: "auto",
      background: "rgba(242,182,90,0.2)",
      border: "1px solid #f2b65a",
      borderRadius: "8px",
      padding: "6px 12px",
      fontSize: "14px",
      color: "#f2b65a",
    } as Partial<CSSStyleDeclaration>);
    this.viewLabel.textContent = "INDOOR";
    bar.appendChild(this.viewLabel);

    this.root.appendChild(bar);
  }

  private buildBottomBar(): void {
    const bar = document.createElement("div");
    Object.assign(bar.style, {
      position: "absolute",
      bottom: "0",
      left: "0",
      right: "0",
      padding: "12px 18px",
      display: "flex",
      gap: "8px",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
      pointerEvents: "auto",
    } as Partial<CSSStyleDeclaration>);

    this.modeBtn = this.makeButton("Build Mode", () => this.toggleMode());
    this.shopBtn = this.makeButton("Shop (O)", () => this.world.shop.toggle());
    this.outdoorBtn = this.makeButton("Outdoor", () => this.world.setView("outdoor"));
    this.saveBtn = this.makeButton("Save (S)", () => this.save());
    this.resetBtn = this.makeButton("Reset", () => {
      if (confirm("Reset all progress?")) this.world.resetSave();
    });

    const testCustomerBtn = this.makeButton("Test Customer (T)", () =>
      this.world.restaurant.debugSpawnCustomer(),
    );
    bar.appendChild(this.modeBtn);
    bar.appendChild(this.shopBtn);
    bar.appendChild(this.outdoorBtn);
    bar.appendChild(this.saveBtn);
    bar.appendChild(this.resetBtn);
    bar.appendChild(testCustomerBtn);

    this.root.appendChild(bar);
  }

  private buildStatusPanel(): void {
    const panel = document.createElement("div");
    Object.assign(panel.style, {
      position: "absolute",
      top: "80px",
      left: "18px",
      width: "240px",
      background: "rgba(31,26,23,0.92)",
      border: "1px solid #4a3a30",
      borderRadius: "10px",
      padding: "12px",
      pointerEvents: "auto",
      fontSize: "12px",
    } as Partial<CSSStyleDeclaration>);

    const title = document.createElement("div");
    Object.assign(title.style, {
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "1px",
      color: "#a89880",
      marginBottom: "6px",
    } as Partial<CSSStyleDeclaration>);
    title.textContent = "Status";
    panel.appendChild(title);

    this.statusEl = document.createElement("div");
    Object.assign(this.statusEl.style, { lineHeight: "1.6" } as Partial<CSSStyleDeclaration>);
    panel.appendChild(this.statusEl);

    const invTitle = document.createElement("div");
    Object.assign(invTitle.style, {
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "1px",
      color: "#a89880",
      marginTop: "12px",
      marginBottom: "6px",
    } as Partial<CSSStyleDeclaration>);
    invTitle.textContent = "Ingredients";
    panel.appendChild(invTitle);

    this.inventoryEl = document.createElement("div");
    Object.assign(this.inventoryEl.style, { lineHeight: "1.6" } as Partial<CSSStyleDeclaration>);
    panel.appendChild(this.inventoryEl);

    this.root.appendChild(panel);
  }

  private makeButton(label: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.textContent = label;
    Object.assign(btn.style, {
      background: "rgba(31,26,23,0.92)",
      color: "#f2e8d8",
      border: "1px solid #4a3a30",
      borderRadius: "8px",
      padding: "8px 14px",
      fontSize: "13px",
      cursor: "pointer",
      fontFamily: "inherit",
    } as Partial<CSSStyleDeclaration>);
    btn.addEventListener("mouseenter", () => {
      btn.style.background = "rgba(60,50,40,0.95)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = "rgba(31,26,23,0.92)";
    });
    btn.addEventListener("click", onClick);
    return btn;
  }

  toggleMode(): void {
    this.world.state.mode = this.world.state.mode === "build" ? "play" : "build";
    this.world.shop.refresh();
  }

  save(): void {
    this.world.save();
    this.flashStatus("Saved!");
  }

  setView(view: "indoor" | "outdoor"): void {
    this.viewLabel.textContent = view.toUpperCase();
  }

  private flashStatus(msg: string): void {
    const old = this.statusEl.textContent;
    this.statusEl.textContent = msg;
    setTimeout(() => {
      if (this.statusEl.textContent === msg) this.statusEl.textContent = old;
    }, 1500);
  }

  update(): void {
    const s = this.world.state;
    this.moneyEl.textContent = `$${s.money.toLocaleString()}`;
    this.levelEl.textContent = String(s.level);
    const xpTable = [0, 70, 160, 285, 535, 1160, 2410, 4910, 9910, 17410];
    const next = xpTable[Math.min(s.level, xpTable.length - 1)] ?? 0;
    this.xpEl.textContent = `${s.gourmetPoints.toLocaleString()} / ${next.toLocaleString()}`;
    const hh = String(s.hour).padStart(2, "0");
    const mm = String(Math.floor(s.minute)).padStart(2, "0");
    this.timeEl.textContent = `Day ${s.day} ${hh}:${mm}`;

    this.modeBtn.textContent = `${s.mode === "build" ? "Build" : "Play"} Mode (B)`;

    const orderCount = s.orders.length;
    const customerCount = s.customers.length;
    const workerCount = s.workers.length;
    const workerInfo = s.workers
      .map((w) => `${w.name}(${w.role[0].toUpperCase()}) @ ${w.col},${w.row}`)
      .join("<br>");
    this.statusEl.innerHTML =
      `Workers: <b>${workerCount}</b><br>` +
      `<div style="font-size:10px;color:#a89880;margin:2px 0 6px">${workerInfo || "<i>none</i>"}</div>` +
      `Customers: <b>${customerCount}</b><br>` +
      `Active orders: <b>${orderCount}</b><br>` +
      `Recipes: <b>${s.unlockedRecipes.length}</b>`;

    const ingEntries = Object.entries(s.inventory)
      .filter(([_, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    this.inventoryEl.innerHTML = ingEntries.length === 0
      ? '<i style="color:#a89880">empty</i>'
      : ingEntries
          .map(([id, qty]) => {
            const def = this.world.grid["catalog"]?.get?.(id) as { name: string } | undefined;
            return `<div style="display:flex;justify-content:space-between"><span>${def?.name ?? id}</span><b>${qty}</b></div>`;
          })
          .join("");
  }
}
