# Restaurant Streets

A web-based restaurant management sim inspired by the classic Restaurant City / Restaurant Streets.

## Stack
- **Vite** — dev server and bundler
- **TypeScript** — strict mode
- **Phaser 3** — 2D game framework (tile-based, sprite-based)
- **Howler.js** — audio
- **LocalStorage** — save data (single-player)

## Quick start
```bash
npm install
npm run dev
```
Then open http://localhost:5173.

## Scripts
- `npm run dev` — start dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview production build
- `npm run typecheck` — TypeScript only

## Project layout
```
src/
├── main.ts              # Phaser bootstrap
├── config.ts            # Game-wide constants
├── types.ts             # Shared types
├── data/                # Static catalogs (items, recipes, levels)
├── scenes/              # Phaser scenes (Boot, Preload, Game)
├── systems/             # Grid, save/load, pathfinding, economy, etc.
├── entities/            # Entity, Worker, Customer, Furniture
├── ui/                  # HUD, panels
└── utils/               # Math, helpers
```

## Architecture notes
- The restaurant is a top-down 2D grid. Each tile is `TILE_SIZE` pixels.
- Workers and customers use A* pathfinding on the occupancy grid.
- Game state is serializable JSON; save/load round-trips through the `SaveSystem`.
- All catalog data lives in `src/data/` and is referenced by id from the world state.
