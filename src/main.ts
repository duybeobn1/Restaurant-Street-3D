import { World } from "./core/World";
import { GAME_WIDTH, GAME_HEIGHT } from "./config";

const canvas = document.createElement("canvas");
canvas.id = "game-canvas";
const app = document.getElementById("app")!;
app.appendChild(canvas);

const world = new World(canvas);

world
  .init()
  .then(() => {
    world.start();
    console.info(
      `[Restaurant Streets] 3D world booted — viewport ${GAME_WIDTH}x${GAME_HEIGHT}`,
    );
  })
  .catch((err) => {
    console.error("[Restaurant Streets] failed to start:", err);
  });
