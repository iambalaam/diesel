import { Engine } from "../engine/Engine.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { SpriteRenderer } from "../engine/SpriteRenderer.ts";
import { Animator } from "../engine/Animator.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";

import { World } from "./World.ts";
import { WorldRenderer } from "./WorldRenderer.ts";
import { loadSpritesheet } from "./assets.ts";
import { Conveyor } from "./Conveyor.ts";
import { Pile } from "./Pile.ts";
import { addInteraction, Interactive } from "./Interactive.ts";

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;

function dir2Cardinal(v: Vec2) {
    if (v.x === 1 && v.y === 0) return "NE";
    if (v.x === -1 && v.y === 0) return "SW";
    if (v.x === 0 && v.y === 1) return "NW";
    if (v.x === 0 && v.y === -1) return "SE";
}

/**
 * Load all assets
 */
const assetFilenames = [
    ...["NE", "SE", "SW", "NW"].map((dir) => `Belt_${dir}.png`),
    "debug-roof.png",
    "debug-ball.png",
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

new Engine(ctx, {
    onInit: (e, time) => {
        /**
         * Setup world
         */
        const world = new World(new Vec2(3, 3));
        const w = e.createActor("world");
        w.renderer = new SpriteRenderer();
        w.addBehaviour(
            new WorldRenderer(
                world,
                sheets["/static/debug-roof.png"],
            ),
        );
        addInteraction(ctx.canvas, world); // Event listeners

        /**
         * Setup conveyors
         */
        [
            { pos: new Vec3(0, 0, 0), dir: new Vec3(1, 0, 0) },
            { pos: new Vec3(1, 0, 0), dir: new Vec3(1, 0, 0) },
            { pos: new Vec3(2, 0, 0), dir: new Vec3(0, 1, 0) },
            { pos: new Vec3(2, 1, 0), dir: new Vec3(0, 1, 0) },
            { pos: new Vec3(2, 2, 0), dir: new Vec3(-1, 0, 0) },
            { pos: new Vec3(1, 2, 0), dir: new Vec3(-1, 0, 0) },
            // { pos: new Vec3(0, 2, 0), dir: new Vec3(0, -1, 0) },
            // { pos: new Vec3(0, 1, 0), dir: new Vec3(0, -1, 0) },
        ].forEach(
            ({ pos, dir }, i) => {
                const cardinal = dir2Cardinal(dir);
                const actor = e.createActor(`belt-${i}`);
                const sheet = sheets[`/static/Belt_${cardinal}.png`];
                actor.animator = new Animator(e, time, {
                    cycles: {
                        idle: {
                            looping: true,
                            spriteSheet: sheet,
                            indexes: sheet.sprites.map((_, i) => i),
                        },
                    },
                });
                actor.renderer = new SpriteRenderer();
                actor.position.translation = pos;
                actor.position.forwards = dir;
                const conveyor = new Conveyor(world, (pos, item) => {
                    const pile = e.createActor(`pile-${i}`);
                    pile.position.translation = pos;
                    pile.addBehaviour(new Pile(item));
                    pile.renderer = new SpriteRenderer();
                    return pile;
                });
                actor.addBehaviour(conveyor);
                actor.addBehaviour(new Interactive());
                conveyor.setItem(0);
            },
        );
    },

    onEarlyRender: (e) => {
        // Background
        e.ctx.fillStyle = "grey";
        e.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    },
});
