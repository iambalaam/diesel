import { Engine } from "../engine/Engine.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { SpriteRenderer } from "../engine/SpriteRenderer.ts";
import { AnimationStates, Animator } from "../engine/Animator.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";

import { World } from "./World.ts";
import { WorldRenderer } from "./WorldRenderer.ts";
import { loadAllAnimations, loadSpritesheet } from "./assets.ts";
import { Conveyor, ConveyorItem } from "./Conveyor.ts";
import { Pile } from "./Pile.ts";
import { addInteraction, Interactive } from "./Interactive.ts";
import { Splitter } from "./Splitter.ts";
import { Drill } from "./Drill.ts";

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;

export const getCardinal = (dir: Vec3) => {
    if (dir.x === 1 && dir.y === 0) return "ne";
    if (dir.x === 0 && dir.y === -1) return "se";
    if (dir.x === -1 && dir.y === 0) return "sw";
    if (dir.x === 0 && dir.y === 1) return "nw";
    throw new Error(`Could not find cardinal for ${dir}`);
};

/**
 * Load all assets
 */

const {
    conveyor: conveyorAnimStates,
    splitter: splitterAnimStates,
    drill: drillAnimStates,
} = await loadAllAnimations();
const assetFilenames = [
    "debug-roof.png",
    "debug-ball.png",
    "debug-selector.png",
].map((name) => `/static/${name}`);

const sheets: Record<string, Spritesheet> = {};
const sheetPromises = await Promise.all(
    assetFilenames.map(async (
        filename,
    ) => [
        filename,
        await loadSpritesheet(
            filename,
            new Vec2(192, 192),
            new Vec2(192 / 2, 192),
        ),
    ] as [string, Spritesheet]),
);
sheetPromises.forEach(([filename, spritesheet]) => {
    sheets[filename] = spritesheet;
});

export const conveyorItems = sheets["/static/debug-ball.png"];
export const selector = sheets["/static/debug-selector.png"];

new Engine(ctx, {
    onInit: (e, time) => {
        /**
         * Setup world
         */
        const world = new World(new Vec2(8, 8));
        const w = e.createActor("world");
        w.renderer = new SpriteRenderer();
        w.addBehaviour(
            new WorldRenderer(
                world,
                sheets["/static/debug-roof.png"],
            ),
        );
        addInteraction(ctx.canvas, world); // Event listeners

        const createPile = (pos: Vec3, item: ConveyorItem) => {
            const pile = e.createActor(`pile`);
            pile.position.translation = pos;
            pile.addBehaviour(new Pile(item));
            pile.addBehaviour(new Interactive());
            pile.renderer = new SpriteRenderer();
            return pile;
        };

        /**
         * Setup conveyors
         */
        [
            { pos: new Vec3(0, 0, 0), dir: new Vec3(1, 0, 0), type: Drill },
            { pos: new Vec3(1, 0, 0), dir: new Vec3(1, 0, 0), type: Conveyor },
            { pos: new Vec3(2, 0, 0), dir: new Vec3(0, 1, 0), type: Conveyor },
            { pos: new Vec3(2, 1, 0), dir: new Vec3(0, 1, 0), type: Conveyor },
            { pos: new Vec3(2, 2, 0), dir: new Vec3(-1, 0, 0), type: Conveyor },
            { pos: new Vec3(1, 2, 0), dir: new Vec3(-1, 0, 0), type: Conveyor },
            {
                pos: new Vec3(0, 2, 0),
                dir: new Vec3(0, 1, 0),
                type: Splitter,
            },
        ].forEach(
            ({ pos, dir, type }, i) => {
                const actor = e.createActor(
                    `${type.name}-${i}`,
                );
                actor.animator = new Animator(
                    e,
                    time,
                    type === Conveyor
                        ? conveyorAnimStates
                        : type === Splitter
                        ? splitterAnimStates
                        : drillAnimStates,
                );
                actor.renderer = new SpriteRenderer();
                actor.position.translation = pos;
                actor.position.forwards = dir;

                actor.addBehaviour(new type(createPile));
                actor.addBehaviour(
                    new Interactive(),
                );
            },
        );
    },

    onEarlyRender: (e) => {
        // Background
        e.ctx.fillStyle = "grey";
        e.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    },
});
