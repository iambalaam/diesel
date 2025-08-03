import { Engine } from "../engine/Engine.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { SpriteRenderer } from "../engine/SpriteRenderer.ts";
import { AnimationStates, Animator } from "../engine/Animator.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";

import { getRandomEmptyLocation, World } from "./World.ts";
import { WorldRenderer } from "./WorldRenderer.ts";
import { loadAllAnimations, loadSpritesheet } from "./assets.ts";
import { Conveyor, ConveyorItem } from "./Conveyor.ts";
import { Pile } from "./Pile.ts";
import { addInteraction, Interactive } from "./Interactive.ts";
import { Drill } from "./Drill.ts";
import { Shop, shopAnimStates } from "./Shop.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Splitter } from "./Splitter.ts";
import { ALL_CONTAINERS, Container } from "./Container.ts";
import { worldToScreen } from "../engine/Transform.ts";

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
    "materials.png",
    "debug-roof.png",
    "debug-selector.png",
].map((name) => `/static/${name}`);

const ground = await loadSpritesheet(
    "/static/Ground.png",
    new Vec2(384, 192),
    new Vec2(384 / 2, 192),
);

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

export const conveyorItems = sheets["/static/materials.png"];
export const selector = sheets["/static/debug-selector.png"];

let undoingSoftLock = false;

new Engine(ctx, {
    onInit: (e, t) => {
        /**
         * Setup world
         */
        const world = new World(new Vec2(7, 7));
        const w = e.createActor("world");
        w.renderer = new SpriteRenderer();
        w.addBehaviour(
            new WorldRenderer(
                world,
                sheets["/static/Coal_2D.png"],
            ),
        );
        addInteraction(ctx.canvas, world); // Event listeners

        const createPile = (pos: Vec3, item: ConveyorItem) => {
            const pile = e.createActor(`pile`);
            pile.position.translation = pos;
            pile.addBehaviour(new Pile(item)).container!.items = [item];
            pile.addBehaviour(new Interactive());
            pile.renderer = new SpriteRenderer();
            return pile;
        };

        const createItem =
            (factory: () => Behaviour, animStates: AnimationStates) =>
            (pos: Vec3) => {
                const actor = e.createActor("");
                actor.position.translation = pos;
                actor.position.forwards = new Vec3(-1, 0, 0);
                actor.addBehaviour(factory());
                actor.animator = new Animator(e, t, animStates);
                actor.renderer = new SpriteRenderer();
            };

        const conveyorShop = e.createActor("Conveyor shop");
        conveyorShop.addBehaviour(
            new Shop(
                [2, 1, 0],
                createItem(() => new Conveyor(createPile), conveyorAnimStates),
            ),
        );
        conveyorShop.position.translation = new Vec3(6, 5, 0);
        conveyorShop.animator = new Animator(e, t, shopAnimStates);
        conveyorShop.renderer = new SpriteRenderer();

        const splitterShop = e.createActor("Splitter shop");
        splitterShop.addBehaviour(
            new Shop(
                [2, 1, 1],
                createItem(() => new Splitter(createPile), splitterAnimStates),
            ),
        );
        splitterShop.position.translation = new Vec3(6, 3, 0);
        splitterShop.animator = new Animator(e, t, shopAnimStates);
        splitterShop.renderer = new SpriteRenderer();

        const drillShop = e.createActor("Drill shop");
        drillShop.addBehaviour(
            new Shop(
                [0, 2, 3],
                createItem(() => new Drill(world, createPile), drillAnimStates),
            ),
        );
        drillShop.position.translation = new Vec3(6, 1, 0);
        drillShop.animator = new Animator(e, t, shopAnimStates);
        drillShop.renderer = new SpriteRenderer();

        const drill = e.createActor("drill");
        drill.addBehaviour(new Drill(world, createPile));
        drill.addBehaviour(new Interactive());
        drill.position.translation = new Vec3(0, 0, 0);
        drill.position.forwards = new Vec3(0, -1, 0);
        drill.renderer = new SpriteRenderer();
        drill.animator = new Animator(e, t, drillAnimStates);

        // Create coal
        createPile(new Vec3(2, 4, 0), 0);
    },

    onEarlyRender: (e) => {
        // Background
        e.ctx.fillStyle = "grey";
        e.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    },

    onUpdate(e, t) {
        if (undoingSoftLock) return;

        const thereIsCoal = ALL_CONTAINERS.some((a) =>
            a.getBehaviour(Shop) === undefined &&
            a.getBehaviour(Container)?.items.includes(0)
        );

        if (!thereIsCoal) {
            undoingSoftLock = true;
            setTimeout(() => {
                undoingSoftLock = false;
                const pile = e.createActor(`pile`);
                pile.position.translation = getRandomEmptyLocation(
                    new Vec2(6, 6),
                );
                pile.addBehaviour(new Pile()).container!.items = [0];
                pile.addBehaviour(new Interactive());
                pile.renderer = new SpriteRenderer();
                return pile;
            }, 5_000);
        }
    },
});
