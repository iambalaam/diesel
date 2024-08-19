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
        "ClimbUp/NE.png",
        "ClimbUp/NW.png",
        "JumpVert/NE.png",
        "JumpVert/NW.png",
        "JumpVert/SE.png",
        "JumpVert/SW.png",
        "-z/-x/idle.png",
        "-z/-x/walk.png",
        "-z/-x/jump.png",
        "-z/+x/idle.png",
        "-z/+x/walk.png",
        "-z/+x/jump.png",
        "-z/-y/idle.png",
        "-z/-y/walk.png",
        "-z/-y/jump.png",
        "-z/+y/idle.png",
        "-z/+y/walk.png",
        "-z/+y/jump.png",
    ] as const;

    const assets: {
        "tiles.png": HTMLImageElement;
        "ClimbUp/NE.png": HTMLImageElement;
        "ClimbUp/NW.png": HTMLImageElement;
        "JumpVert/NE.png": HTMLImageElement;
        "JumpVert/NW.png": HTMLImageElement;
        "JumpVert/SE.png": HTMLImageElement;
        "JumpVert/SW.png": HTMLImageElement;

        "-z/-x/idle.png": HTMLImageElement;
        "-z/-x/walk.png": HTMLImageElement;
        "-z/-x/jump.png": HTMLImageElement;

        "-z/+x/idle.png": HTMLImageElement;
        "-z/+x/walk.png": HTMLImageElement;
        "-z/+x/jump.png": HTMLImageElement;

        "-z/-y/idle.png": HTMLImageElement;
        "-z/-y/walk.png": HTMLImageElement;
        "-z/-y/jump.png": HTMLImageElement;

        "-z/+y/idle.png": HTMLImageElement;
        "-z/+y/walk.png": HTMLImageElement;
        "-z/+y/jump.png": HTMLImageElement;
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
        "ClimbUp/NE.png": Spritesheet;
        "ClimbUp/NW.png": Spritesheet;
        "JumpVert/NE.png": Spritesheet;
        "JumpVert/NW.png": Spritesheet;
        "JumpVert/SE.png": Spritesheet;
        "JumpVert/SW.png": Spritesheet;

        "-z/-x/idle.png": Spritesheet;
        "-z/-x/walk.png": Spritesheet;
        "-z/-x/jump.png": Spritesheet;

        "-z/+x/idle.png": Spritesheet;
        "-z/+x/walk.png": Spritesheet;
        "-z/+x/jump.png": Spritesheet;

        "-z/-y/idle.png": Spritesheet;
        "-z/-y/walk.png": Spritesheet;
        "-z/-y/jump.png": Spritesheet;

        "-z/+y/idle.png": Spritesheet;
        "-z/+y/walk.png": Spritesheet;
        "-z/+y/jump.png": Spritesheet;
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
                spriteSheet: spritesheets["-z/-y/idle.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/-y/idle.png"].sprites.length,
                ),
            },
            //
            "-z/-x/idle": {
                spriteSheet: spritesheets["-z/-x/idle.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/-x/idle.png"].sprites.length,
                ),
            },
            "-z/-x/walk": {
                spriteSheet: spritesheets["-z/-x/walk.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/-x/walk.png"].sprites.length,
                ),
            },
            "-z/-x/jump": {
                spriteSheet: spritesheets["-z/-x/jump.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/-x/jump.png"].sprites.length,
                ),
            },

            //
            "-z/+x/idle": {
                spriteSheet: spritesheets["-z/+x/idle.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/+x/idle.png"].sprites.length,
                ),
            },
            "-z/+x/walk": {
                spriteSheet: spritesheets["-z/+x/walk.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/+x/walk.png"].sprites.length,
                ),
            },
            "-z/+x/jump": {
                spriteSheet: spritesheets["-z/+x/jump.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/+x/jump.png"].sprites.length,
                ),
            },

            //
            "-z/-y/idle": {
                spriteSheet: spritesheets["-z/-y/idle.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/-y/idle.png"].sprites.length,
                ),
            },
            "-z/-y/walk": {
                spriteSheet: spritesheets["-z/-y/walk.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/-y/walk.png"].sprites.length,
                ),
            },
            "-z/-y/jump": {
                spriteSheet: spritesheets["-z/-y/jump.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/-y/jump.png"].sprites.length,
                ),
            },

            //
            "-z/+y/idle": {
                spriteSheet: spritesheets["-z/+y/idle.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/+y/idle.png"].sprites.length,
                ),
            },
            "-z/+y/walk": {
                spriteSheet: spritesheets["-z/+y/walk.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/+y/walk.png"].sprites.length,
                ),
            },
            "-z/+y/jump": {
                spriteSheet: spritesheets["-z/+y/jump.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/+y/jump.png"].sprites.length,
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
