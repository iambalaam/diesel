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

    renderSprite(sheet: Spritesheet, index: number, world: Vec2 | Vec3) {
        const world3 = world instanceof Vec3
            ? world
            : new Vec3(world.x, world.y, 0);
        const zIndex = 2 * world3.z - world3.x - world3.y;
        const screen = worldToScreen(world3);
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
