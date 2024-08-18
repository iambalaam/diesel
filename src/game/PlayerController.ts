import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Input } from "../engine/Input.ts";
import { Vec2 } from "../engine/Vec2.ts";

const SPEED = 3;
const DEAD_ZONE = 0.1;

const SE = new Vec2(1, 1);
const SW = new Vec2(-1, 1);
const NE = new Vec2(1, -1);
const NW = new Vec2(-1, -1);
const getCardinal = (v: Vec2) => {
    if (v.equals(NE)) return "ne";
    if (v.equals(NW)) return "nw";
    if (v.equals(SW)) return "sw";
    return "se";
};

type State = "idle" | "walk" | "jump";

export class PlayerController extends Behaviour {
    state: State = "idle";
    orientation = new Vec2(1, 1);
    movement = new Vec2(0, 0);

    update(actor: Actor, time: Time): void {
        let input = new Vec2(0, 0);
        if (Input.Keyboard.D) input.x++;
        if (Input.Keyboard.A) input.x--;
        if (Input.Keyboard.W) input.y--;
        if (Input.Keyboard.S) input.y++;
        input.x += Input.Gamepad.axes[0] || 0;
        input.y += Input.Gamepad.axes[1] || 0;

        if (input.sqrMag() < DEAD_ZONE) {
            input = new Vec2(0, 0);
        }

        if (input.x > 0 && input.y < 0) input = new Vec2(1, -1);
        else if (input.x < 0 && input.y < 0) input = new Vec2(-1, -1);
        else if (input.x > 0 && input.y > 0) input = new Vec2(1, 1);
        else if (input.x < 0 && input.y > 0) input = new Vec2(-1, 1);
        else input = new Vec2(0, 0);

        const state = input.sqrMag() === 0 ? "idle" : "walk";
        if (!input.equals(this.orientation) || state !== this.state) {
            this.orientation = input;
            this.state = state;
            const newCycle = `${state}-${getCardinal(input)}`;
            actor.animator?.start(newCycle, time);
        }

        const target = input.scale(SPEED);

        actor.position = actor.position.add(target);
    }
}
