# Restaurant Streets — v1

Idle/tycoon restaurant management game. You're the **general manager**: hire chef + waiters, design your restaurant, and earn. No cooking minigame.

## Stack
- **Engine:** Vite + TypeScript + Three.js (orthographic 2.5D)
- **Assets:** glTF + baked hand-painted/cel textures
- **Saves:** localStorage (versioned)
- **Deploy:** Vercel + custom domain
- **Platform:** Web browser, single-player offline

## Core Design
- Player = GM; hires chef (auto-cooks) + waiters (auto-serve)
- No cooking interaction — full idle/tycoon
- Time scale: 1 real hour = 8 game hours (8×) → 12-hr day ≈ 90 min real
- Stamina: 1 shift drains full stamina; 1 rest shift refills
- Offline earnings on v1
- AI/fake neighbors on street (real multiplayer deferred)

---

## Month 1 — Foundation & Pipeline

### Code
- [ ] Scaffold Vite + TS + Three.js project
- [ ] Folder structure (`/scenes`, `/entities`, `/systems`, `/ui`, `/data`)
- [ ] Orthographic camera at fixed iso angle; pan/zoom
- [ ] Tile-grid placement system (snap, rotate, remove)
- [ ] Save skeleton (money, day, level, owned items, staff) + versioned localStorage
- [ ] glTF asset loader + texture cache
- [ ] Build mode UI shell (DOM overlay): place/rotate/remove
- [ ] Shop panel placeholder
- [ ] Top HUD: money, day, level, reputation

### Art
- [ ] Lock art bible (camera angle, light dir, tile unit, palette, tex res, export rules)
- [ ] Floor tile
- [ ] Wall set (4 orientations)
- [ ] Door
- [ ] Counter
- [ ] 1 table + 1 chair
- [ ] 1 stove
- [ ] 3 customer variants
- [ ] Validate pipeline: 1 test glTF (baked AO + cel ramp)

**Exit:** Place furniture on a styled grid; persists on reload.

---

## Month 2 — Tycoon Core

### Code
- [ ] Game clock (8× scale; 12-hr day + rest period; shift boundaries)
- [ ] Customer flow: enter → queue → seat → order → wait → eat → pay → leave
- [ ] Mood decay system
- [ ] Staff system — Chef role (auto-cook, tier-based speed/capacity)
- [ ] Staff system — Waiter role (auto-deliver + clear, tier-based speed)
- [ ] Hire/fire UI; staff slots gated by level
- [ ] Stamina/energy: 1 shift = full drain; rest shift refills; penalty if no rest
- [ ] Kitchen logic: order queue → chef → staging → waiter → table
- [ ] Economy: coins per dish, wages per shift, shop spend
- [ ] Level/XP gating
- [ ] Day/clock: open → close → day summary (revenue, wages, tips, rep)
- [ ] Balance constants in `data/` (dishes, staff tiers, timings, wages, stamina)

### Art
- [ ] Chef model + cook/carry clips
- [ ] Waiter model + walk/carry clips
- [ ] Stove variations
- [ ] Counter / staging counter / fridge
- [ ] 8–10 dish plates + UI icons
- [ ] Customer variants (≥6): idle / walk / sit / eat

**Exit:** Open day → staff auto-cook & serve → earn → close → summary → reinvest. Loop complete.

---

## Month 3 — Progression, Polish & Juice

### Code
- [ ] Upgrades: equipment tiers (stove speed, fridge capacity, table count)
- [ ] Decor → ambiance score
- [ ] Unlock curve: dishes + decor + staff slots by level
- [ ] Reputation/demand: reviews → arrival rate; fails drop it
- [ ] Offline earnings: calc on load
- [ ] "While you were away" summary UI
- [ ] Seasonal/holiday decor set toggle by date in `data/`
- [ ] Audio system (Howler.js): BGM + SFX hooks
- [ ] Juice: tween library (GSAP/tween.js) — bounces, coin pops
- [ ] Particle pool: steam, sparks, coins
- [ ] Emote bubbles above customers
- [ ] Tutorial: guided first day (build kitchen → hire chef → open)

### Art
- [ ] Holiday decor set (1 season)
- [ ] Upgraded-tier stove/table/fridge variants
- [ ] UI art: HUD frame, buttons, shop panel, hire panel
- [ ] UI art: order tickets, day-end summary
- [ ] Title screen art
- [ ] Loading screen art
- [ ] Particle/emote sprites

**Exit:** Polished vertical slice with progression, offline earnings, audio, tutorial.

---

## Month 4 — Hardening, Deploy & Launch

### Code
- [ ] Save robustness: corruption recovery
- [ ] Save export/import
- [ ] Quota-safe localStorage writes
- [ ] Settings: volume
- [ ] Settings: quality toggle (shadows/post vs perf)
- [ ] Settings: reduced motion
- [ ] Perf: instancing for tiles/customers
- [ ] Perf: frustum culling
- [ ] Perf: texture atlas
- [ ] Perf: lazy-load scene assets
- [ ] Offline-earnings UI polish
- [ ] Balance pass from 5+ play sessions
- [ ] Crash logging (Sentry free tier)
- [ ] SEO/OG meta on landing
- [ ] Favicon
- [ ] PWA manifest (installable)

### Deploy
- [ ] Vercel project from repo
- [ ] Preview deploys per branch
- [ ] Custom domain DNS (A/CNAME)
- [ ] Auto HTTPS via Vercel
- [ ] Rollback plan
- [ ] One-click prod deploy from `main`

### Launch
- [ ] 30–60s gameplay trailer
- [ ] 4–5 screenshots
- [ ] Landing copy
- [ ] Post to Telegram (existing brand)
- [ ] Post to Instagram (existing brand)
- [ ] Post to itch.io
- [ ] Post to r/webgames
- [ ] Privacy analytics (Plausible or Vercel Analytics)
- [ ] Tag v1.0

**Exit:** Live at your domain; v1.0 tagged; patch cadence ready.

---

## Locked Decisions
- [x] Engine: Vite + TS + Three.js
- [x] Platform: Web browser, single-player offline
- [x] Multiplayer: deferred (AI neighbors in v1)
- [x] Art: 3D models + ortho cam + baked cel/hand-painted textures
- [x] MVP scope: Lean
- [x] Tooling: Vite + TypeScript
- [x] Saves: localStorage (versioned)
- [x] Assets: glTF + baked textures
- [x] Hosting: Vercel + custom domain
- [x] Player = GM, hires chef + waiters
- [x] No cooking minigame — chef auto-cooks
- [x] Time: 1 real hr = 8 game hrs; 12-hr day ≈ 90 min real
- [x] Stamina: 1 shift drains, 1 rest refills
- [x] Offline earnings: v1

## Deferred to v1.1+
- [ ] Real multiplayer / visiting other streets
- [ ] More cuisine types
- [ ] Cloud saves / cross-device
- [ ] Mobile native packaging
- [ ] Additional seasonal sets beyond 1

## Risks
- **Artist is the long-pole** — lock art bible Week 1; placeholders→finals so code never blocks.
- **Save versioning** — start at v1; bump on every breaking state change.
- **8× clock + stamina balance** — playtest early in Month 3; misbalance kills the idle feel.