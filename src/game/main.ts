import { Actor } from "../engine/Actor.ts";
import { AnimationStates, Animator } from "../engine/Animator.ts";
import { Engine } from "../engine/Engine.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { PlayerController } from "./PlayerController.ts";

export const CANVAS_WIDTH = self.innerWidth;
export const CANVAS_HEIGHT = self.innerHeight;
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

    const animStates: AnimationStates = {
        cycles: {
            idle: {
                spriteSheet,
                looping: true,
                indexes: [45],
            },
            N: {
                spriteSheet,
                looping: true,
                indexes: [45],
            },
            NE: {
                spriteSheet,
                looping: true,
                indexes: [60],
            },
            E: {
                spriteSheet,
                looping: true,
                indexes: [75],
            },
            SE: {
                spriteSheet,
                looping: true,
                indexes: [90],
            },
            S: {
                spriteSheet,
                looping: true,
                indexes: [105],
            },
            SW: {
                spriteSheet,
                looping: true,
                indexes: [120],
            },
            W: {
                spriteSheet,
                looping: true,
                indexes: [15],
            },
            NW: {
                spriteSheet,
                looping: true,
                indexes: [30],
            },
        },
    };

    let robot: Actor;
    new Engine(ctx, {
        onInit: (e, time) => {
            robot = e.createActor("robot");
            robot.animator = new Animator(e, time, animStates);
            robot.behaviours.push(new PlayerController());
        },
        onEarlyRender: (e) => {
            // Background
            e.ctx.fillStyle = "grey";
            e.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        },
    });
})();
