import { Actor } from "../engine/Actor.ts";
import { AnimationStates, Animator } from "../engine/Animator.ts";
import { Background } from "../engine/Background.ts";
import { Engine } from "../engine/Engine.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { PlayerController } from "./PlayerController.ts";

export const CANVAS_WIDTH = self.innerWidth;
export const CANVAS_HEIGHT = self.innerHeight;
const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;

const createRange = (n: number) => new Array(n).fill(0).map((_, i) => i);

(async () => {
    const assetPaths = [
        "tiles.png",
        "Idle0.1/NE.png",
        "Idle0.1/NW.png",
        "Idle0.1/SE.png",
        "Idle0.1/SW.png",
        "Jump0.1/NE.png",
        "Jump0.1/NW.png",
        "Jump0.1/SE.png",
        "Jump0.1/SW.png",
        "Walk0.1/NE.png",
        "Walk0.1/NW.png",
        "Walk0.1/SE.png",
        "Walk0.1/SW.png",
    ] as const;

    const assets: {
        "tiles.png": HTMLImageElement;
        "Idle0.1/NE.png": HTMLImageElement;
        "Idle0.1/NW.png": HTMLImageElement;
        "Idle0.1/SE.png": HTMLImageElement;
        "Idle0.1/SW.png": HTMLImageElement;
        "Jump0.1/NE.png": HTMLImageElement;
        "Jump0.1/NW.png": HTMLImageElement;
        "Jump0.1/SE.png": HTMLImageElement;
        "Jump0.1/SW.png": HTMLImageElement;
        "Walk0.1/NE.png": HTMLImageElement;
        "Walk0.1/NW.png": HTMLImageElement;
        "Walk0.1/SE.png": HTMLImageElement;
        "Walk0.1/SW.png": HTMLImageElement;
    } = {} as any;

    const assetPromises = assetPaths.map((path) =>
        new Promise((resolve) => {
            const img = new Image();
            assets[path] = img;
            img.src = path;
            img.onload = resolve;
        })
    );
    await Promise.all(assetPromises);

    const spritesheets: {
        "Idle0.1/NE.png": Spritesheet;
        "Idle0.1/NW.png": Spritesheet;
        "Idle0.1/SE.png": Spritesheet;
        "Idle0.1/SW.png": Spritesheet;
        "Jump0.1/NE.png": Spritesheet;
        "Jump0.1/NW.png": Spritesheet;
        "Jump0.1/SE.png": Spritesheet;
        "Jump0.1/SW.png": Spritesheet;
        "Walk0.1/NE.png": Spritesheet;
        "Walk0.1/NW.png": Spritesheet;
        "Walk0.1/SE.png": Spritesheet;
        "Walk0.1/SW.png": Spritesheet;
    } = {} as any;

    Object.entries(assets).forEach(([name, img]) => {
        if (name.startsWith("tiles")) return;
        (spritesheets as any)[name] = new Spritesheet(img, {
            spriteSize: new Vec2(128, 128),
            spriteAnchor: new Vec2(64, 128),
            rows: true,
        });
    });
    const tileSheet = new Spritesheet(assets["tiles.png"], {
        spriteSize: new Vec2(64, 64),
        spriteAnchor: new Vec2(32, 64),
        rows: true,
    });

    const animStates: AnimationStates = {
        cycles: {
            idle: {
                spriteSheet: spritesheets["Idle0.1/SE.png"],
                looping: true,
                indexes: createRange(spritesheets["Idle0.1/SE.png"].sprites),
            },
            "idle-ne": {
                spriteSheet: spritesheets["Idle0.1/NE.png"],
                looping: true,
                indexes: createRange(spritesheets["Idle0.1/NE.png"].sprites),
            },
            "idle-nw": {
                spriteSheet: spritesheets["Idle0.1/NW.png"],
                looping: true,
                indexes: createRange(spritesheets["Idle0.1/NW.png"].sprites),
            },
            "idle-se": {
                spriteSheet: spritesheets["Idle0.1/SE.png"],
                looping: true,
                indexes: createRange(spritesheets["Idle0.1/SE.png"].sprites),
            },
            "idle-sw": {
                spriteSheet: spritesheets["Idle0.1/SW.png"],
                looping: true,
                indexes: createRange(spritesheets["Idle0.1/SW.png"].sprites),
            },
            "jump-ne": {
                spriteSheet: spritesheets["Jump0.1/NE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Jump0.1/NE.png"].sprites - 1,
                ),
            },
            "jump-nw": {
                spriteSheet: spritesheets["Jump0.1/NW.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Jump0.1/NW.png"].sprites - 1,
                ),
            },
            "jump-se": {
                spriteSheet: spritesheets["Jump0.1/SE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Jump0.1/SE.png"].sprites - 1,
                ),
            },
            "jump-sw": {
                spriteSheet: spritesheets["Jump0.1/SW.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Jump0.1/SW.png"].sprites - 1,
                ),
            },
            "walk-ne": {
                spriteSheet: spritesheets["Walk0.1/NE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Walk0.1/NE.png"].sprites,
                ),
            },
            "walk-nw": {
                spriteSheet: spritesheets["Walk0.1/NW.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Walk0.1/NW.png"].sprites,
                ),
            },
            "walk-se": {
                spriteSheet: spritesheets["Walk0.1/SE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Walk0.1/SE.png"].sprites,
                ),
            },
            "walk-sw": {
                spriteSheet: spritesheets["Walk0.1/SW.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Walk0.1/SW.png"].sprites,
                ),
            },
        },
    };

    let robot: Actor;
    let floor: Actor;
    new Engine(ctx, {
        onInit: (e, time) => {
            floor = e.createActor("floor");
            floor.position = new Vec3(0, 0, 0);
            floor.background = new Background(
                e,
                15,
                15,
                tileSheet,
                0,
            );

            robot = e.createActor("robot");
            robot.animator = new Animator(e, time, animStates);
            robot.behaviours.push(new PlayerController());
            robot.position = new Vec3(0, 0, 1);
        },
        onEarlyRender: (e) => {
            // Background
            e.ctx.fillStyle = "grey";
            e.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        },
    });
})();
