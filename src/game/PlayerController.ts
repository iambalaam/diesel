import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Input } from "../engine/Input.ts";

const SPEED = 3;

export class PlayerController extends Behaviour {
    update(actor: Actor, time: Time): void {
        let inputX = 0;
        let inputY = 0;
        if (Input.D) inputX++;
        if (Input.A) inputX--;
        if (Input.W) inputY--;
        if (Input.S) inputY++;
        const targetX = inputX * SPEED;
        const targetY = inputY * SPEED;

        if (inputX === 0 && inputY === -1) actor.animator?.start("N", time);
        if (inputX === 1 && inputY === -1) actor.animator?.start("NE", time);
        if (inputX === 1 && inputY === 0) actor.animator?.start("E", time);
        if (inputX === 1 && inputY === 1) actor.animator?.start("SE", time);
        if (inputX === 0 && inputY === 1) actor.animator?.start("S", time);
        if (inputX === -1 && inputY === 1) actor.animator?.start("SW", time);
        if (inputX === -1 && inputY === 0) actor.animator?.start("W", time);
        if (inputX === -1 && inputY === -1) actor.animator?.start("NW", time);

        actor.position.x += targetX;
        actor.position.y += targetY;
    }
}
