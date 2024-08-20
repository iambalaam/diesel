import { Actor } from "../engine/Actor.ts";
import { AnimationStates, Animator } from "../engine/Animator.ts";
import { Engine } from "../engine/Engine.ts";
import { SpriteRenderer } from "../engine/SpriteRenderer.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Goal } from "./Goal.ts";
import { PlayerController } from "./PlayerController.ts";
import { World } from "./World.ts";
import { WorldRenderer } from "./WorldRenderer.ts";

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;

const createRange = (n: number) => new Array(n).fill(0).map((_, i) => i);
const createBoomerang = (half: number) => {
    const fwd = createRange(half).slice(0, -1);
    const bkwd = createRange(half).reverse();
    return [...fwd, ...bkwd];
};

(async () => {
    const assetPaths = [
        "tiles.png",

        "-z/-x/idle.png",
        "-z/-x/walk.png",
        "-z/-x/jump.png",

        "-z/+x/idle.png",
        "-z/+x/walk.png",
        "-z/+x/jump.png",
        "-z/+x/climb-up.png",

        "-z/-y/idle.png",
        "-z/-y/walk.png",
        "-z/-y/jump.png",
        "-z/-y/win.png",

        "-z/+y/idle.png",
        "-z/+y/walk.png",
        "-z/+y/jump.png",
        "-z/+y/climb-up.png",

        "+x/+z/idle.png",
        "+x/+z/walk.png",
        "+x/+z/climb-over.png",

        "+y/+z/idle.png",
        "+y/+z/walk.png",
        "+y/+z/climb-over.png",
    ] as const;

    const assets: {
        "tiles.png": HTMLImageElement;

        "-z/-x/idle.png": HTMLImageElement;
        "-z/-x/walk.png": HTMLImageElement;
        "-z/-x/jump.png": HTMLImageElement;

        "-z/+x/idle.png": HTMLImageElement;
        "-z/+x/walk.png": HTMLImageElement;
        "-z/+x/jump.png": HTMLImageElement;
        "-z/+x/climb-up.png": HTMLImageElement;

        "-z/-y/idle.png": HTMLImageElement;
        "-z/-y/walk.png": HTMLImageElement;
        "-z/-y/jump.png": HTMLImageElement;
        "-z/-y/win.png": HTMLImageElement;

        "-z/+y/idle.png": HTMLImageElement;
        "-z/+y/walk.png": HTMLImageElement;
        "-z/+y/jump.png": HTMLImageElement;
        "-z/+y/climb-up.png": HTMLImageElement;

        "+x/+z/idle.png": HTMLImageElement;
        "+x/+z/walk.png": HTMLImageElement;
        "+x/+z/climb-over.png": HTMLImageElement;

        "+y/+z/idle.png": HTMLImageElement;
        "+y/+z/walk.png": HTMLImageElement;
        "+y/+z/climb-over.png": HTMLImageElement;
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

        "-z/-x/idle.png": Spritesheet;
        "-z/-x/walk.png": Spritesheet;
        "-z/-x/jump.png": Spritesheet;

        "-z/+x/idle.png": Spritesheet;
        "-z/+x/walk.png": Spritesheet;
        "-z/+x/jump.png": Spritesheet;
        "-z/+x/climb-up.png": Spritesheet;

        "-z/-y/idle.png": Spritesheet;
        "-z/-y/walk.png": Spritesheet;
        "-z/-y/jump.png": Spritesheet;
        "-z/-y/win.png": Spritesheet;

        "-z/+y/idle.png": Spritesheet;
        "-z/+y/walk.png": Spritesheet;
        "-z/+y/jump.png": Spritesheet;
        "-z/+y/climb-up.png": Spritesheet;

        "+x/+z/idle.png": Spritesheet;
        "+x/+z/walk.png": Spritesheet;
        "+x/+z/climb-over.png": Spritesheet;

        "+y/+z/idle.png": Spritesheet;
        "+y/+z/walk.png": Spritesheet;
        "+y/+z/climb-over.png": Spritesheet;
    } = {} as any;

    Object.entries(assets).forEach(([name, img]) => {
        if (name.startsWith("tiles")) return;

        if (name === "+y/+z/climb-over.png") {
            (spritesheets as any)[name] = new Spritesheet(img, {
                spriteSize: new Vec2(192, 192),
                spriteAnchor: new Vec2(128, 200),
                rows: true,
            });
            return;
        }

        if (name === "+x/+z/climb-over.png") {
            (spritesheets as any)[name] = new Spritesheet(img, {
                spriteSize: new Vec2(192, 192),
                spriteAnchor: new Vec2(64, 200),
                rows: true,
            });
            return;
        }
        if (name === "-z/-y/win.png") {
            (spritesheets as any)[name] = new Spritesheet(img, {
                spriteSize: new Vec2(128, 128),
                spriteAnchor: new Vec2(64, 128),
                rows: true,
            });
            return;
        }
        if (name.includes("+z/idle")) {
            (spritesheets as any)[name] = new Spritesheet(img, {
                spriteSize: new Vec2(128, 128),
                spriteAnchor: new Vec2(64, 132),
                rows: true,
            });
            return;
        }

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
            "-z/+x/climb-up": {
                spriteSheet: spritesheets["-z/+x/climb-up.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/+x/climb-up.png"].sprites.length,
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

            "-z/-y/win": {
                spriteSheet: spritesheets["-z/-y/win.png"],
                looping: true,
                indexes: createBoomerang(
                    spritesheets["-z/-y/win.png"].sprites.length - 3,
                ).map((index) => index + 2),
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
            "-z/+y/climb-up": {
                spriteSheet: spritesheets["-z/+y/climb-up.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["-z/+y/climb-up.png"].sprites.length,
                ),
            },

            "+x/+z/idle": {
                spriteSheet: spritesheets["+x/+z/idle.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["+x/+z/idle.png"].sprites.length,
                ),
            },
            "+x/+z/walk": {
                spriteSheet: spritesheets["+x/+z/walk.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["+x/+z/walk.png"].sprites.length,
                ),
            },
            "+x/+z/climb-over": {
                spriteSheet: spritesheets["+x/+z/climb-over.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["+x/+z/climb-over.png"].sprites.length,
                ),
            },

            "+y/+z/idle": {
                spriteSheet: spritesheets["+y/+z/idle.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["+y/+z/idle.png"].sprites.length,
                ),
            },
            "+y/+z/walk": {
                spriteSheet: spritesheets["+y/+z/walk.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["+y/+z/walk.png"].sprites.length,
                ),
            },
            "+y/+z/climb-over": {
                spriteSheet: spritesheets["+y/+z/climb-over.png"],
                looping: true,
                indexes: createRange(
                    spritesheets["+y/+z/climb-over.png"].sprites.length,
                ),
            },
        },
    };

    let robot: Actor;
    let worldRenderer: Actor;
    const world = new World(new Vec2(5, 5));
    // climbable start
    world.addBox(new Vec3(1, 1, 0), new Vec3(2, 2, 1), {
        isClimbable: true,
        spriteIndex: 1,
    });

    // first building to jump to
    world.addBox(new Vec3(1, 4, 0), new Vec3(2, 1, 1), {
        isClimbable: false,
        spriteIndex: 3,
    });
    world.addBox(new Vec3(2, 4, 1), new Vec3(1, 1, 1), {
        isClimbable: true,
        spriteIndex: 5,
    });

    // final tower
    world.addBox(new Vec3(4, 4, 0), new Vec3(1, 1, 2), {
        isClimbable: false,
        spriteIndex: 2,
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

            const goal = e.createActor("goal");
            goal.renderer = new SpriteRenderer();
            goal.position.translation = new Vec3(4, 4, 2);
            goal.addBehaviour(new Goal(robot, tileSheet));
        },
        onEarlyRender: (e) => {
            // Background
            e.ctx.fillStyle = "grey";
            e.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        },
    });
})();
