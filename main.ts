import { Actor } from "./Actor.ts";
import { AnimationStates, Animator } from "./Animator.ts";
import { Engine } from "./engine.ts";
import { Spritesheet } from "./Spritesheet.ts";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;

(async () => {
    const img = new Image();
    const imgPromise = new Promise((resolve) => {
        img.src = "robot0.4.png";
        img.onload = resolve;
    });

    await imgPromise;

    const spriteSheet = new Spritesheet(img, {
        spriteWidth: 128,
        spriteHeight: 128,
        rows: true,
    });

    const robot = new Actor();
    const animStates: AnimationStates = {
        cycles: {
            idle: {
                spriteSheet,
                looping: true,
                indexes: new Array(spriteSheet.sprites).fill(0).map((_, i) =>
                    i
                ),
            },
        },
    };

    new Engine(ctx, (ctx, time) => {
        if (robot.animator === undefined) {
            robot.animator = new Animator(ctx, time, animStates);
        }
        ctx.fillStyle = "grey";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        robot.animator.update(time);
    });
})();
