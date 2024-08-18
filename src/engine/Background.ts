import { Actor } from "./Actor.ts";
import { Engine } from "./Engine.ts";
import { Spritesheet } from "./Spritesheet.ts";
import { Vec3 } from "./Vec3.ts";

export class Background {
    constructor(
        private engine: Engine,
        public width: number,
        public height: number,
        public spriteSheet: Spritesheet,
        public index: number,
    ) {
    }

    render(actor: Actor) {
        for (let x = this.width - 1; x >= 0; x--) {
            for (let y = this.height - 1; y >= 0; y--) {
                this.spriteSheet.draw(
                    this.engine.ctx,
                    this.index,
                    actor.position.add(new Vec3(x, y, 0)),
                );
            }
        }
    }
}
