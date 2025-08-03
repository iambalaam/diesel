import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { World } from "./World.ts";

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

        for (let x = 0; x < this.world.size.x; x += 1) {
            for (let y = 0; y < this.world.size.y; y += 1) {
                // for (let z = -1; z < this.world.grid[x][y].length; z++) {
                const block = this.world.grid[x][y][-1];
                if (block) {
                    if (block instanceof Actor) {
                        //
                    } else {
                        renderer.renderSprite(
                            this.tiles,
                            block.spriteIndex,
                            new Vec3(x, y, -1),
                        );
                    }
                }
                // }
            }
        }
    }
}
