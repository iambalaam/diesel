import { Animator } from "./Animator.ts";
import { Behaviour } from "./Behaviour.ts";
import { Time } from "./engine.ts";
import { Position } from "./Position.ts";

export class Actor {
    position: Position;
    animator?: Animator;
    behaviours: Behaviour[];

    constructor(public name: string) {
        this.position = new Position(0, 0);
        this.behaviours = [];
    }

    render(time: Time) {
        for (const behaviour of this.behaviours) {
            behaviour.render(this, time);
        }
        this.animator?.render(time);
    }

    update(time: Time) {
        for (const behaviour of this.behaviours) {
            behaviour.update(this, time);
        }
    }
}
