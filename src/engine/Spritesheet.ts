import { DEBUG } from "./Engine.ts";
import { worldToScreen } from "./Transform.ts";
import { Vec2 } from "./Vec2.ts";
import { Vec3 } from "./Vec3.ts";

export interface SpriteSheetConfig {
    spriteSize: Vec2;
    spriteAnchor: Vec2;
    rows: boolean;
}

export type SpriteLocation = {
    position: Vec2;
    size: Vec2;
};

export class Spritesheet {
    #cfg: SpriteSheetConfig;
    #spriteSheet: HTMLImageElement;
    #sprites: SpriteLocation[] = [];

    constructor(spriteSheet: HTMLImageElement, cfg: SpriteSheetConfig) {
        if (!spriteSheet.complete) {
            throw new Error(`Spritesheet ${spriteSheet.src} has not loaded`);
        }

        this.#cfg = cfg;
        this.#spriteSheet = spriteSheet;
        const spritesWide = Math.floor(spriteSheet.width / cfg.spriteSize.x);
        const spritesHigh = Math.floor(spriteSheet.height / cfg.spriteSize.y);

        if (cfg.rows) {
            for (let y = 0; y < spritesHigh; y++) {
                for (let x = 0; x < spritesWide; x++) {
                    this.#sprites.push({
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
                    this.#sprites.push({
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

    get sprites() {
        return this.#sprites.length;
    }

    draw(
        ctx: CanvasRenderingContext2D,
        index: number,
        world: Vec3,
        scale = 1,
    ) {
        const screen = worldToScreen(world);
        const sprite = this.#sprites[index]!;
        if (!sprite) return;
        const { size, position } = sprite;
        const width = size.x * scale;
        const height = size.y * scale;
        const topLeft = new Vec2(
            screen.x - this.#cfg.spriteAnchor.x * scale,
            screen.y - this.#cfg.spriteAnchor.y * scale,
        );

        ctx.drawImage(
            this.#spriteSheet,
            position.x,
            position.y,
            size.x,
            size.y,
            topLeft.x,
            topLeft.y,
            width,
            height,
        );

        if (DEBUG) {
            ctx.strokeStyle = "green";
            ctx.lineWidth = 2;
            ctx.strokeRect(
                topLeft.x,
                topLeft.y,
                width,
                height,
            );
            ctx.beginPath();
            ctx.arc(
                screen.x,
                screen.y,
                5,
                0,
                Math.PI * 2,
            );
            ctx.stroke();
        }
    }
}
