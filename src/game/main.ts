import { Actor } from "../engine/Actor.ts";
import { AnimationStates, Animator } from "../engine/Animator.ts";
import { Engine } from "../engine/Engine.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { PlayerController } from "./PlayerController.ts";

export const CANVAS_WIDTH = self.innerWidth;
export const CANVAS_HEIGHT = self.innerHeight;
const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;

(async () => {
    const idleImg = new Image();
    const jumpImg = new Image();
    const idlePromise = new Promise((resolve) => {
        idleImg.src = "robot-idle0.1.png";
        idleImg.onload = resolve;
    });
    const jumpPromise = new Promise((resolve) => {
        jumpImg.src = "robot-jump0.1.png";
        jumpImg.onload = resolve;
    });

    await idlePromise;
    await jumpPromise;

    const idleSheet = new Spritesheet(idleImg, {
        spriteSize: new Vec2(128, 128),
        spriteAnchor: new Vec2(64, 128),
        rows: true,
    });
    const jumpSheet = new Spritesheet(jumpImg, {
        spriteSize: new Vec2(128, 128),
        spriteAnchor: new Vec2(64, 128),
        rows: true,
    });

    const idleIndexes = new Array(idleSheet.sprites - 1).fill(0).map((_, i) =>
        i
    );
    const jumpUpIndexes = new Array(jumpSheet.sprites - 1).fill(0).map((_, i) =>
        i
    );
    const jupmDownIndexes = [...jumpUpIndexes].reverse();
    const animStates: AnimationStates = {
        cycles: {
            idle: {
                spriteSheet: idleSheet,
                looping: true,
                indexes: idleIndexes,
            },
            "jump-up": {
                spriteSheet: jumpSheet,
                looping: false,
                indexes: jumpUpIndexes,
                end: "jump-down",
            },
            "jump-down": {
                spriteSheet: jumpSheet,
                looping: false,
                indexes: jupmDownIndexes,
                end: "idle",
            },
        },
    };

    let robot: Actor;
    new Engine(ctx, {
        onInit: (e, time) => {
            robot = e.createActor("robot");
            robot.animator = new Animator(e, time, animStates);
            robot.behaviours.push(new PlayerController());
            robot.position = new Vec2(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        },
        onEarlyRender: (e) => {
            // Background
            e.ctx.fillStyle = "grey";
            e.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        },
    });
})();
