import { Animator } from "./Animator.ts";
import { Position } from "./Position.ts";

export class Actor {
    position: Position;
    animator?: Animator;

    constructor() {
        this.position = new Position(0, 0);
    }
}
