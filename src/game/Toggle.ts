import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";

export class Toggle extends Behaviour {
    lastToggled = 0;
    nextCycle = "idle";

    render(actor: Actor, time: Time): void {
        if (time.time - this.lastToggled > 3_000) {
            console.debug("TOGGLE");
            this.lastToggled = time.time;
            actor.animator?.start(this.nextCycle, time);
            this.nextCycle = this.nextCycle === "idle" ? "reverse" : "idle";
        }
    }
}
