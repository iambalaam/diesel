import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Engine, Time } from "../engine/Engine.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Block } from "./World.ts";
import { World } from "./World.ts";

interface BlockRenderReq {
    block: Block;
    position: Vec3;
    zIndex: number;
}

export class WorldRenderer extends Behaviour {
    constructor(
        private engine: Engine,
        private world: World,
        private tiles: Spritesheet,
    ) {
        super();
    }

    render(_actor: Actor, _time: Time): void {
        const renderReqs: BlockRenderReq[] = [];

        for (let x = 0; x < this.world.size.x; x++) {
            for (let y = 0; y < this.world.size.y; y++) {
                for (let z = -1; z < this.world.grid[x][y].length; z++) {
                    const block = this.world.grid[x][y][z];
                    const zIndex = 2 * z - x - y;
                    if (block) {
                        renderReqs.push({
                            block,
                            position: new Vec3(x, y, z),
                            zIndex,
                        });
                    }
                }
            }
        }

        renderReqs.sort((b1, b2) => b1.zIndex - b2.zIndex);
        renderReqs.forEach((req) => {
            console.log(req);
            this.tiles.draw(
                this.engine.ctx,
                req.block.spriteIndex,
                req.position,
            );
        });
    }
}
