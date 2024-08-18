import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Input } from "../engine/Input.ts";

const SPEED = 3;

export class PlayerController extends Behaviour {
    update(actor: Actor, time: Time): void {
        let inputX = 0;
        let inputY = 0;
        if (Input.Keyboard.D) inputX++;
        if (Input.Keyboard.A) inputX--;
        if (Input.Keyboard.W) inputY--;
        if (Input.Keyboard.S) inputY++;
        inputX += Input.Gamepad.axes[0] || 0;
        inputY += Input.Gamepad.axes[1] || 0;
        const targetX = inputX * SPEED;
        const targetY = inputY * SPEED;

        if (Input.Keyboard[" "] || Input.Gamepad.buttons[0]) {
            actor.animator?.start("jump-up", time);
        }

        actor.position.x += targetX;
        actor.position.y += targetY;
    }
}
