import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { loadSpritesheet } from "./assets.ts";
import { sheets } from "./main.ts";
import { World } from "./World.ts";

const ground = await loadSpritesheet(
    `/static/Ground.png`,
    new Vec2(384, 192),
    new Vec2(384 / 2, 192),
);

export class WorldRenderer extends Behaviour {
    constructor(
        public world: World,
        private tiles: Spritesheet,
    ) {
        super();
    }

    override render(actor: Actor, _time: Time): void {
        const { renderer } = actor;
        if (!renderer) return;

        for (let x = -6; x < this.world.size.x + 6; x += 2) {
            for (let y = -6; y < this.world.size.y + 6; y += 2) {
                renderer.renderSprite(
                    ground,
                    0,
                    new Vec3(x, y, -1),
                );
            }
        }

        [
            new Vec3(0, 0, 0),
            new Vec3(0, 1, 0),
            new Vec3(1, 0, 0),
            new Vec3(1, 1, 0),
        ].map((v) => {
            renderer.renderSprite(
                sheets["/static/Coal_2D.png"],
                0,
                this.world.halfCoal.scale(2).add(v),
            );
            renderer.renderSprite(
                sheets["/static/Gold_2D.png"],
                0,
                this.world.halfGold.scale(2).add(v),
            );
            renderer.renderSprite(
                sheets["/static/Steel_2D.png"],
                0,
                this.world.halfSteel.scale(2).add(v),
            );
        });
    }
}
