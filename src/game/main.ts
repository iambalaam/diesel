import { Engine } from "../engine/Engine.ts";

export const CANVAS_WIDTH = self.innerWidth;
export const CANVAS_HEIGHT = self.innerHeight;
const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;

new Engine(ctx, {
    onInit: (e, time) => {
        // Game logic
    },
    onEarlyRender: (e) => {
        // Background
        e.ctx.fillStyle = "grey";
        e.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    },
});
