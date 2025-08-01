import { Spritesheet } from "./Spritesheet.ts";
import { worldToScreen } from "./Transform.ts";
import { Vec2 } from "./Vec2.ts";
import { Vec3 } from "./Vec3.ts";

export interface RenderReq {
    zIndex: number;
    draw: (ctx: CanvasRenderingContext2D) => void;
}

export class SpriteRenderer {
    renderReqs: RenderReq[] = [];

    renderSprite(sheet: Spritesheet, index: number, world: Vec3) {
        const zIndex = 2 * world.z - world.x - world.y;
        const screen = worldToScreen(world);
        const spriteLoc = sheet.sprites[index];
        if (!spriteLoc) return;

        const { size, position } = spriteLoc;
        const width = size.x;
        const height = size.y;
        const topLeft = new Vec2(
            screen.x - sheet.cfg.spriteAnchor.x,
            screen.y - sheet.cfg.spriteAnchor.y,
        );

        this.renderReqs.push({
            zIndex,
            draw: (ctx) => {
                ctx.drawImage(
                    sheet.img,
                    position.x,
                    position.y,
                    size.x,
                    size.y,
                    topLeft.x,
                    topLeft.y,
                    width,
                    height,
                );
            },
        });
    }

    render() {
        const reqs = this.renderReqs;
        this.renderReqs = [];
        return reqs;
    }
}
