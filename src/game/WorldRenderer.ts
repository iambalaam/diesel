import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { loadSpritesheet } from "./assets.ts";
import { World } from "./World.ts";

const [ground, coal, gold, steel] = await Promise.all(
    ["Ground", "Coal_2D", "Gold_2D", "Steel_2D"]
        .map(async (n) =>
            await loadSpritesheet(
                `/static/${n}.png`,
                new Vec2(384, 192),
                new Vec2(384 / 2, 192),
            )
        ),
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

        for (let x = 0; x < this.world.size.x; x += 2) {
            for (let y = 0; y < this.world.size.y; y += 2) {
                const block = this.world.grid[x][y][-1];
                renderer.renderSprite(
                    ground,
                    0,
                    new Vec3(x, y, -1),
                );
            }
        }
    }
}
