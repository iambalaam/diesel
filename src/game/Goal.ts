import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { getPosPrefix } from "./PlayerController.ts";

const BOUNCE_SPEED = 0.001;
const BOUNCE_AMOUNT = 0.25;

export class Goal extends Behaviour {
    constructor(private target: Actor, private sheet: Spritesheet) {
        super();
    }

    hasWon = false;
    floatAmount = 0;

    update(actor: Actor, time: Time): void {
        if (
            !this.hasWon &&
            actor.position.translation.equals(this.target.position.translation)
        ) {
            // WIN
            this.hasWon = true;
            this.target.position.forwards = new Vec3(0, -1, 0);
            this.target.position.down = new Vec3(0, 0, -1);
            this.target.animator?.start(
                `${getPosPrefix(this.target.position)}/win`,
                time,
            );
        }
    }

    render(actor: Actor, time: Time): void {
        const jiggle = (Math.sin(time.time * BOUNCE_SPEED)) * BOUNCE_AMOUNT;

        if (this.hasWon) {
            this.floatAmount = this.floatAmount * 0.95 + 2 * 0.05;
        } else {
            this.floatAmount = 0.25;
        }
        actor.renderer?.renderSprite(
            this.sheet,
            12,
            actor.position.translation.add(
                new Vec3(0, 0, this.floatAmount + jiggle),
            ),
        );
    }
}
