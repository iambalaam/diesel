import { Animator } from "./Animator.ts";
import { Behaviour } from "./Behaviour.ts";
import { Time } from "./Engine.ts";
import { RenderReq, SpriteRenderer } from "./SpriteRenderer.ts";
import { Vec3 } from "./Vec3.ts";

export interface Position {
    translation: Vec3;
    forwards: Vec3;
    down: Vec3;
}

export const ZERO_POSITION = {
    translation: Vec3.Zero,
    forwards: Vec3.Zero,
    down: Vec3.Zero,
};

export class Actor {
    position: Position;
    animator?: Animator;
    renderer?: SpriteRenderer;
    private behaviours: Behaviour[];
    #destroy: () => void;

    constructor(public name: string, destroy: () => void) {
        this.position = {
            translation: new Vec3(0, 0, 0),
            forwards: new Vec3(0, -1, 0),
            down: new Vec3(0, 0, -1),
        };
        this.#destroy = destroy;
        this.behaviours = [];
    }

    addBehaviour<T extends Behaviour>(behaviour: T) {
        this.behaviours.push(behaviour);
        behaviour.init(this);
        return behaviour;
    }

    getBehaviour<T extends Behaviour>(
        ctr: new (...args: any[]) => T,
    ): T | undefined {
        return this.behaviours.find((b): b is T => b instanceof ctr);
    }

    getBehaviours<T extends Behaviour>(
        ctr: new (...args: any[]) => T,
    ): T[] {
        return this.behaviours.filter((b): b is T => b instanceof ctr);
    }

    render(time: Time): RenderReq[] {
        for (const behaviour of this.behaviours) {
            behaviour.render(this, time);
        }
        this.animator?.render(this, time);
        return this.renderer?.render() || [];
    }

    update(time: Time) {
        for (const behaviour of this.behaviours) {
            behaviour.update(this, time);
        }
    }

    destroy() {
        this.behaviours.forEach((b) => b.destroy(this));
        this.#destroy();
    }
}
