import { Actor } from "../engine/Actor.ts";
import { AnimationStates, Animator } from "../engine/Animator.ts";
import { Engine } from "../engine/Engine.ts";
import { SpriteRenderer } from "../engine/SpriteRenderer.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { PlayerController } from "./PlayerController.ts";
import { World } from "./World.ts";
import { WorldRenderer } from "./WorldRenderer.ts";

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
        "Idle/NE.png",
        "Idle/NW.png",
        "Idle/SE.png",
        "Idle/SW.png",
        "ClimbUp/NE.png",
        "ClimbUp/NW.png",
        "JumpVert/NE.png",
        "JumpVert/NW.png",
        "JumpVert/SE.png",
        "JumpVert/SW.png",
        "JumpForward/NE.png",
        "JumpForward/NW.png",
        "JumpForward/SE.png",
        "JumpForward/SW.png",
        "Walk/NE.png",
        "Walk/NW.png",
        "Walk/SE.png",
        "Walk/SW.png",
    ] as const;

    const assets: {
        "tiles.png": HTMLImageElement;
        "Idle/NE.png": HTMLImageElement;
        "Idle/NW.png": HTMLImageElement;
        "Idle/SE.png": HTMLImageElement;
        "Idle/SW.png": HTMLImageElement;
        "ClimbUp/NE.png": HTMLImageElement;
        "ClimbUp/NW.png": HTMLImageElement;
        "JumpVert/NE.png": HTMLImageElement;
        "JumpVert/NW.png": HTMLImageElement;
        "JumpVert/SE.png": HTMLImageElement;
        "JumpVert/SW.png": HTMLImageElement;
        "JumpForward/NE.png": HTMLImageElement;
        "JumpForward/NW.png": HTMLImageElement;
        "JumpForward/SE.png": HTMLImageElement;
        "JumpForward/SW.png": HTMLImageElement;
        "Walk/NE.png": HTMLImageElement;
        "Walk/NW.png": HTMLImageElement;
        "Walk/SE.png": HTMLImageElement;
        "Walk/SW.png": HTMLImageElement;
    } = {} as any;

    const assetPromises = assetPaths.map(
        (path) =>
            new Promise((resolve) => {
                const img = new Image();
                assets[path] = img;
                img.src = path;
                img.onload = resolve;
            }),
    );
    await Promise.all(assetPromises);

    const spritesheets: {
        "Idle/NE.png": Spritesheet;
        "Idle/NW.png": Spritesheet;
        "Idle/SE.png": Spritesheet;
        "Idle/SW.png": Spritesheet;
        "ClimbUp/NE.png": Spritesheet;
        "ClimbUp/NW.png": Spritesheet;
        "JumpVert/NE.png": Spritesheet;
        "JumpVert/NW.png": Spritesheet;
        "JumpVert/SE.png": Spritesheet;
        "JumpVert/SW.png": Spritesheet;
        "JumpForward/NE.png": Spritesheet;
        "JumpForward/NW.png": Spritesheet;
        "JumpForward/SE.png": Spritesheet;
        "JumpForward/SW.png": Spritesheet;
        "Walk/NE.png": Spritesheet;
        "Walk/NW.png": Spritesheet;
        "Walk/SE.png": Spritesheet;
        "Walk/SW.png": Spritesheet;
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
        spriteSize: new Vec2(128, 128),
        spriteAnchor: new Vec2(64, 128),
        rows: true,
    });

    const animStates: AnimationStates = {
        cycles: {
            idle: {
                spriteSheet: spritesheets["Idle/SE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Idle/SE.png"].sprites.length,
                ),
            },
            "idle-ne": {
                spriteSheet: spritesheets["Idle/NE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Idle/NE.png"].sprites.length,
                ),
            },
            "idle-nw": {
                spriteSheet: spritesheets["Idle/NW.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Idle/NW.png"].sprites.length,
                ),
            },
            "idle-se": {
                spriteSheet: spritesheets["Idle/SE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Idle/SE.png"].sprites.length,
                ),
            },
            "idle-sw": {
                spriteSheet: spritesheets["Idle/SW.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Idle/SW.png"].sprites.length,
                ),
            },
            "climb-up-ne": {
                spriteSheet: spritesheets["ClimbUp/NE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["ClimbUp/NE.png"].sprites.length,
                ),
            },
            "climb-up-nw": {
                spriteSheet: spritesheets["ClimbUp/NW.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["ClimbUp/NW.png"].sprites.length,
                ),
            },
            "jump-vert-ne": {
                spriteSheet: spritesheets["JumpVert/NE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["JumpVert/NE.png"].sprites.length - 1,
                ),
            },
            "jump-vert-nw": {
                spriteSheet: spritesheets["JumpVert/NW.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["JumpVert/NW.png"].sprites.length - 1,
                ),
            },
            "jump-vert-se": {
                spriteSheet: spritesheets["JumpVert/SE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["JumpVert/SE.png"].sprites.length - 1,
                ),
            },
            "jump-vert-sw": {
                spriteSheet: spritesheets["JumpVert/SW.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["JumpVert/SW.png"].sprites.length - 1,
                ),
            },
            "jump-forward-ne": {
                spriteSheet: spritesheets["JumpForward/NE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["JumpForward/NE.png"].sprites.length - 1,
                ),
            },
            "jump-forward-nw": {
                spriteSheet: spritesheets["JumpForward/NW.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["JumpForward/NW.png"].sprites.length - 1,
                ),
            },
            "jump-forward-se": {
                spriteSheet: spritesheets["JumpForward/SE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["JumpForward/SE.png"].sprites.length - 1,
                ),
            },
            "jump-forward-sw": {
                spriteSheet: spritesheets["JumpForward/SW.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["JumpForward/SW.png"].sprites.length - 1,
                ),
            },
            "walk-ne": {
                spriteSheet: spritesheets["Walk/NE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Walk/NE.png"].sprites.length,
                ),
            },
            "walk-nw": {
                spriteSheet: spritesheets["Walk/NW.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Walk/NW.png"].sprites.length,
                ),
            },
            "walk-se": {
                spriteSheet: spritesheets["Walk/SE.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Walk/SE.png"].sprites.length,
                ),
            },
            "walk-sw": {
                spriteSheet: spritesheets["Walk/SW.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["Walk/SW.png"].sprites.length,
                ),
            },
        },
    };

    let robot: Actor;
    let worldRenderer: Actor;
    const world = new World(new Vec2(5, 5));
    world.addBox(new Vec3(2, 2, 0), new Vec3(1, 1, 1), {
        isClimbable: true,
        spriteIndex: 0,
    });

    new Engine(ctx, {
        onInit: (e, time) => {
            worldRenderer = e.createActor("world");
            worldRenderer.position.translation = new Vec3(0, 0, -1);
            worldRenderer.renderer = new SpriteRenderer();
            worldRenderer.addBehaviour(new WorldRenderer(world, tileSheet));

            robot = e.createActor("robot");
            robot.animator = new Animator(e, time, animStates);
            robot.renderer = new SpriteRenderer();
            robot.addBehaviour(new PlayerController(world));
            robot.position.translation = new Vec3(0, 0, 0);
        },
        onEarlyRender: (e) => {
            // Background
            e.ctx.fillStyle = "grey";
            e.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        },
    });
})();
