import { Engine } from "./engine.ts";
import { Sprite } from "./Sprite.ts";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext("2d")!;

const RADIUS = 100;
const SPEED = 0.001;

(async () => {
    const img = new Image();
    const imgPromise = new Promise((resolve) => {
        img.src = "earth.png";
        img.onload = resolve;
    });

    await imgPromise;

    const sprite = new Sprite(img, {
        fps: 60,
        spriteWidth: 64,
        spriteHeight: 64,
    });

    new Engine(ctx, (ctx, time) => {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        const x = (CANVAS_WIDTH - RADIUS) / 2 +
            Math.sin(time.time * SPEED) * RADIUS;
        const y = (CANVAS_HEIGHT - RADIUS) / 2 +
            Math.cos(time.time * SPEED) * RADIUS;

        sprite.draw(ctx, time, x, y);
    });
})();
