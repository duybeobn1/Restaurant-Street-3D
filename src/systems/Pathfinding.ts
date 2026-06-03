import type { GridPos, PathNode } from "../types";
import type { Grid } from "./Grid";

export class Pathfinding {
  readonly grid: Grid;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  /**
   * A* on the grid. Returns a list of cells from start to end (inclusive),
   * or null if no path is found. The start may be a blocked cell (you
   * start inside a wall); in that case the path will be one step long.
   */
  findPath(start: GridPos, end: GridPos): GridPos[] | null {
    if (!this.grid.inBounds(start.col, start.row)) return null;
    if (!this.grid.inBounds(end.col, end.row)) return null;
    if (start.col === end.col && start.row === end.row) return [];

    const heuristic = (a: GridPos, b: GridPos): number =>
      Math.abs(a.col - b.col) + Math.abs(a.row - b.row);

    const open: PathNode[] = [];
    const closed = new Set<string>();
    const gScore = new Map<string, number>();

    const startNode: PathNode = {
      col: start.col,
      row: start.row,
      g: 0,
      h: heuristic(start, end),
      f: 0,
    };
    startNode.f = startNode.g + startNode.h;
    open.push(startNode);
    gScore.set(`${start.col},${start.row}`, 0);

    const neighbors: [number, number][] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];

    let iterations = 0;
    const maxIterations = this.grid.cols * this.grid.rows * 4;

    while (open.length > 0) {
      if (++iterations > maxIterations) return null;
      let bestIdx = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i].f < open[bestIdx].f) bestIdx = i;
      }
      const current = open.splice(bestIdx, 1)[0];
      const key = `${current.col},${current.row}`;
      if (closed.has(key)) continue;
      closed.add(key);

      if (current.col === end.col && current.row === end.row) {
        const path: GridPos[] = [];
        let node: PathNode | undefined = current;
        while (node) {
          path.unshift({ col: node.col, row: node.row });
          node = node.parent;
        }
        return path;
      }

      for (const [dCol, dRow] of neighbors) {
        const nCol = current.col + dCol;
        const nRow = current.row + dRow;
        if (!this.grid.inBounds(nCol, nRow)) continue;
        // Allow start to be unwalkable (we're starting in a wall), but disallow otherwise
        if (
          !(current.col === start.col && current.row === start.row) &&
          !this.grid.isWalkable(nCol, nRow)
        ) {
          continue;
        }
        const nKey = `${nCol},${nRow}`;
        if (closed.has(nKey)) continue;
        const tentativeG = current.g + 1;
        const prevG = gScore.get(nKey) ?? Infinity;
        if (tentativeG >= prevG) continue;
        gScore.set(nKey, tentativeG);
        const h = heuristic({ col: nCol, row: nRow }, end);
        const f = tentativeG + h;
        open.push({ col: nCol, row: nRow, g: tentativeG, h, f, parent: current });
      }
    }
    return null;
  }

  /**
   * Returns a path to the nearest walkable cell adjacent to `target`.
   * Useful when the target tile is itself blocked.
   */
  findPathAdjacent(start: GridPos, target: GridPos): GridPos[] | null {
    if (this.grid.isWalkable(target.col, target.row)) {
      return this.findPath(start, target);
    }
    const candidates: GridPos[] = [
      { col: target.col + 1, row: target.row },
      { col: target.col - 1, row: target.row },
      { col: target.col, row: target.row + 1 },
      { col: target.col, row: target.row - 1 },
    ];
    let best: GridPos[] | null = null;
    let bestLen = Infinity;
    for (const c of candidates) {
      if (!this.grid.isWalkable(c.col, c.row)) continue;
      const p = this.findPath(start, c);
      if (p && p.length < bestLen) {
        bestLen = p.length;
        best = p;
      }
    }
    return best;
  }
}
