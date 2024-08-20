import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { getPosPrefix } from "./PlayerController.ts";

export class Goal extends Behaviour {
    constructor(private target: Actor) {
        super();
    }

    hasWon = false;

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
}
