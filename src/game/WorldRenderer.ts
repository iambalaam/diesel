import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { World } from "./World.ts";

export class WorldRenderer extends Behaviour {
    constructor(
        private world: World,
        private tiles: Spritesheet,
    ) {
        super();
    }

    render(actor: Actor, _time: Time): void {
        const { renderer } = actor;
        if (!renderer) return;

        for (let x = 0; x < this.world.size.x; x++) {
            for (let y = 0; y < this.world.size.y; y++) {
                for (let z = -1; z < this.world.grid[x][y].length; z++) {
                    const block = this.world.grid[x][y][z];
                    if (block) {
                        renderer.renderSprite(this.tiles, 0, new Vec3(x, y, z));
                    }
                }
            }
        }
    }
}
