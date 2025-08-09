import { Vec2 } from "./Vec2.ts";

export interface SpritesheetConfig {
    spriteSize: Vec2;
    spriteAnchor: Vec2;
    direction: "rows" | "columns";
}

export type SpriteLocation = {
    position: Vec2;
    size: Vec2;
};

export class Spritesheet {
    cfg: SpritesheetConfig;
    img: HTMLImageElement;
    sprites: SpriteLocation[] = [];

    constructor(spriteSheet: HTMLImageElement, cfg: SpritesheetConfig) {
        if (!spriteSheet.complete) {
            throw new Error(`Spritesheet ${spriteSheet.src} has not loaded`);
        }

        this.cfg = cfg;
        this.img = spriteSheet;
        const spritesWide = Math.floor(spriteSheet.width / cfg.spriteSize.x);
        const spritesHigh = Math.floor(spriteSheet.height / cfg.spriteSize.y);

        if (cfg.direction === "rows") {
            for (let y = 0; y < spritesHigh; y++) {
                for (let x = 0; x < spritesWide; x++) {
                    this.sprites.push({
                        position: new Vec2(
                            x * cfg.spriteSize.x,
                            y * cfg.spriteSize.y,
                        ),
                        size: new Vec2(cfg.spriteSize.x, cfg.spriteSize.y),
                    });
                }
            }
        } else {
            for (let x = 0; x < spritesWide; x++) {
                for (let y = 0; y < spritesHigh; y++) {
                    this.sprites.push({
                        position: new Vec2(
                            x * cfg.spriteSize.x,
                            y * cfg.spriteSize.y,
                        ),
                        size: new Vec2(cfg.spriteSize.x, cfg.spriteSize.y),
                    });
                }
            }
        }
    }
}
