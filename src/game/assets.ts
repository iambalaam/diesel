import { AnimationStates } from "../engine/Animator.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { Vec2 } from "../engine/Vec2.ts";

export async function loadSpritesheet(
    url: string,
    spriteSize: Vec2,
    spriteAnchor: Vec2,
): Promise<Spritesheet> {
    const img = new Image();
    img.src = url;
    const loadingPromise = new Promise((res, rej) => {
        img.addEventListener("load", res);
        img.addEventListener("load", rej);
    });
    await loadingPromise;
    const sheet = new Spritesheet(img, {
        direction: "rows",
        spriteSize,
        spriteAnchor,
    });
    return sheet;
}

const ANIMATION_LENGTH = 30;
const SPRITE_INDEXES = new Array(ANIMATION_LENGTH).fill(0).map((_, i) => i);

export async function loadAllAnimations(): Promise<{
    conveyor: AnimationStates;
    splitter: AnimationStates;
    drill: AnimationStates;
}> {
    const conveyorSheets = await ["NE", "SE", "SW", "NW"]
        .map((dir) => `Belt_${dir}.png`)
        .map((name) => `/static/${name}`)
        .map((url) =>
            loadSpritesheet(url, new Vec2(192, 192), new Vec2(192 / 2, 192))
        );
    const splitterSheets = await ["NE", "SE"]
        .map((dir) => `Splitter_${dir}.png`)
        .map((name) => `/static/${name}`)
        .map((url) =>
            loadSpritesheet(url, new Vec2(192, 192), new Vec2(192 / 2, 192))
        );
    const drillSheets = await ["NE", "SE", "SW", "NW"]
        .map((dir) => `Drill_${dir}.png`)
        .map((name) => `/static/${name}`)
        .map((url) =>
            loadSpritesheet(url, new Vec2(192, 384), new Vec2(192 / 2, 384))
        );

    return {
        conveyor: {
            cycles: {
                idle: {
                    looping: true,
                    spriteSheet: await conveyorSheets[0],
                    indexes: SPRITE_INDEXES,
                },
                ne: {
                    looping: true,
                    spriteSheet: await conveyorSheets[0],
                    indexes: SPRITE_INDEXES,
                },
                se: {
                    looping: true,
                    spriteSheet: await conveyorSheets[1],
                    indexes: SPRITE_INDEXES,
                },
                sw: {
                    looping: true,
                    spriteSheet: await conveyorSheets[2],
                    indexes: SPRITE_INDEXES,
                },
                nw: {
                    looping: true,
                    spriteSheet: await conveyorSheets[3],
                    indexes: SPRITE_INDEXES,
                },
            },
        },
        splitter: {
            cycles: {
                idle: {
                    looping: true,
                    spriteSheet: await splitterSheets[0],
                    indexes: SPRITE_INDEXES,
                },
                ne: {
                    looping: true,
                    spriteSheet: await splitterSheets[0],
                    indexes: SPRITE_INDEXES,
                },
                se: {
                    looping: true,
                    spriteSheet: await splitterSheets[1],
                    indexes: SPRITE_INDEXES,
                },
                sw: {
                    looping: true,
                    spriteSheet: await splitterSheets[0],
                    indexes: SPRITE_INDEXES,
                },
                nw: {
                    looping: true,
                    spriteSheet: await splitterSheets[1],
                    indexes: SPRITE_INDEXES,
                },
            },
        },
        drill: {
            cycles: {
                idle: {
                    looping: true,
                    spriteSheet: await drillSheets[0],
                    indexes: SPRITE_INDEXES,
                },
                ne: {
                    looping: true,
                    spriteSheet: await drillSheets[0],
                    indexes: SPRITE_INDEXES,
                },
                se: {
                    looping: true,
                    spriteSheet: await drillSheets[1],
                    indexes: SPRITE_INDEXES,
                },
                sw: {
                    looping: true,
                    spriteSheet: await drillSheets[2],
                    indexes: SPRITE_INDEXES,
                },
                nw: {
                    looping: true,
                    spriteSheet: await drillSheets[3],
                    indexes: SPRITE_INDEXES,
                },
            },
        },
    };
}
