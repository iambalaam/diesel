export const SPRITE_FPS = 30;
export const SPRITE_MS = 1000 / SPRITE_FPS;
export interface SpriteSheetConfig {
    spriteWidth: number;
    spriteHeight: number;
    rows: boolean;
}

export type SpriteLocation = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export class Spritesheet {
    #spriteSheet: HTMLImageElement;
    #sprites: SpriteLocation[] = [];

    constructor(spriteSheet: HTMLImageElement, cfg: SpriteSheetConfig) {
        if (!spriteSheet.complete) {
            throw new Error(`Spritesheet ${spriteSheet.src} has not loaded`);
        }

        this.#spriteSheet = spriteSheet;
        const spritesWide = Math.floor(spriteSheet.width / cfg.spriteWidth);
        const spritesHigh = Math.floor(spriteSheet.height / cfg.spriteHeight);

        if (cfg.rows) {
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
        } else {
            for (let x = 0; x < spritesWide; x++) {
                for (let y = 0; y < spritesHigh; y++) {
                    this.#sprites.push({
                        x: x * cfg.spriteWidth,
                        y: y * cfg.spriteHeight,
                        width: cfg.spriteWidth,
                        height: cfg.spriteHeight,
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
        dx: number,
        dy: number,
        scale = 1,
    ) {
        const sprite = this.#sprites[index]!;
        if (!sprite) return;
        const { x: sx, y: sy, width, height } = sprite;
        ctx.drawImage(
            this.#spriteSheet,
            sx,
            sy,
            width,
            height,
            dx,
            dy,
            width * scale,
            height * scale,
        );
    }
}
