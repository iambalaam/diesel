import { Time } from "./engine.ts";
export interface SpriteSheetConfig {
    spriteWidth: number;
    spriteHeight: number;
    fps: number;
}

type SpriteLocation = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export class Sprite {
    #spriteSheet: HTMLImageElement;
    #sprites: SpriteLocation[] = [];
    #animationMs: number;
    #duration: number;
    constructor(spriteSheet: HTMLImageElement, cfg: SpriteSheetConfig) {
        if (!spriteSheet.complete) {
            throw new Error(`Spritesheet ${spriteSheet.src} has not loaded`);
        }

        this.#spriteSheet = spriteSheet;
        this.#animationMs = 1000 / cfg.fps;
        const spritesWide = Math.floor(spriteSheet.width / cfg.spriteWidth);
        const spritesHigh = Math.floor(spriteSheet.height / cfg.spriteHeight);

        for (let y = 0; y < spritesHigh; y++) {
            for (let x = 0; x < spritesWide; x++) {
                this.#sprites.push({
                    x: x * cfg.spriteWidth,
                    y: y * cfg.spriteHeight,
                    width: cfg.spriteWidth,
                    height: cfg.spriteHeight,
                });
            }
        }
        this.#duration = this.#sprites.length * this.#animationMs;
    }

    draw(ctx: CanvasRenderingContext2D, time: Time, dx: number, dy: number) {
        const quot = time.time % this.#duration;
        const index = Math.floor(quot / this.#animationMs);
        const { x: sx, y: sy, width, height } = this.#sprites[index]!;
        ctx.drawImage(
            this.#spriteSheet,
            sx,
            sy,
            width,
            height,
            dx,
            dy,
            width,
            height,
        );
    }
}
