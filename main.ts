import { Engine } from "./engine.ts";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext("2d")!;

(async () => {
    const img = new Image();
    const imgPromise = new Promise((resolve) => {
        img.src = "earth.png";
        img.onload = resolve;
    });

    await imgPromise;

    new Engine(ctx, (ctx, _time) => {
        ctx.drawImage(img, 0, 0, 64, 64, 0, 0, 64, 64);
    });
})();
