import { Actor } from "./Actor.ts";
import { Behaviour } from "./Behaviour.ts";
import { Time } from "./engine.ts";

export class Toggle extends Behaviour {
    lastToggled = 0;
    nextCycle = "idle";

    render(actor: Actor, time: Time): void {
        if (time.time - this.lastToggled > 1_000) {
            this.lastToggled = time.time;
            actor.animator?.start(this.nextCycle, time);
            this.nextCycle = this.nextCycle === "idle" ? "reverse" : "idle";
        }
    }
}
