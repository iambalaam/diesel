import { Animator } from "./Animator.ts";
import { Behaviour } from "./Behaviour.ts";
import { Time } from "./Engine.ts";
import { Vec2 } from "./Vec2.ts";

export class Actor {
    position: Vec2;
    animator?: Animator;
    behaviours: Behaviour[];

    constructor(public name: string) {
        this.position = new Vec2(0, 0);
        this.behaviours = [];
    }

    render(time: Time) {
        for (const behaviour of this.behaviours) {
            behaviour.render(this, time);
        }
        this.animator?.render(this, time);
    }

    update(time: Time) {
        for (const behaviour of this.behaviours) {
            behaviour.update(this, time);
        }
    }
}
