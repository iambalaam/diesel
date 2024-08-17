import { Actor } from "./Actor.ts";
import { AnimationStates, Animator } from "./Animator.ts";
import { Engine } from "./engine.ts";
import { Spritesheet } from "./Spritesheet.ts";
import { Toggle } from "./Toggle.ts";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
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

    const forwards = new Array(spriteSheet.sprites - 1).fill(0).map((
        _,
        i,
    ) => i);
    const reverse = [...forwards].reverse();
    const animStates: AnimationStates = {
        cycles: {
            idle: {
                spriteSheet,
                looping: true,
                indexes: forwards,
            },
            reverse: {
                spriteSheet,
                looping: true,
                indexes: reverse,
            },
        },
    };

    let robot: Actor;
    new Engine(ctx, (e, time) => {
        if (robot === undefined) {
            robot = e.createActor("robot");
            robot.animator = new Animator(e, time, animStates);
            robot.behaviours.push(new Toggle());
        }
    });
})();
