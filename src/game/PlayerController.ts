import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Input } from "../engine/Input.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";

const SPEED = 0.1;
const DEAD_ZONE = 0.1;

const NE = new Vec3(1, 0, 0);
const SE = new Vec3(0, -1, 0);
const SW = new Vec3(-1, 0, 0);
const NW = new Vec3(0, 1, 0);
const getCardinal = (v: Vec3) => {
    if (v.equals(NE)) return "ne";
    if (v.equals(NW)) return "nw";
    if (v.equals(SW)) return "sw";
    return "se";
};

type State = "idle" | "walk" | "jump";

export class PlayerController extends Behaviour {
    state: State = "idle";
    orientation = new Vec3(0, -1, 0);
    movement = new Vec2(0, 0);

    update(actor: Actor, time: Time): void {
        //
        let isoInput = new Vec2(0, 0);
        if (Input.Keyboard.D) isoInput.x++;
        if (Input.Keyboard.A) isoInput.x--;
        if (Input.Keyboard.W) isoInput.y--;
        if (Input.Keyboard.S) isoInput.y++;
        isoInput.x += Input.Gamepad.axes[0] || 0;
        isoInput.y += Input.Gamepad.axes[1] || 0;

        if (isoInput.sqrMag() < DEAD_ZONE) {
            isoInput = new Vec2(0, 0);
        }

        let orthInput = new Vec3(0, 0, 0);

        if (isoInput.x > 0 && isoInput.y < 0) {
            orthInput = new Vec3(1, 0, 0);
        } else if (isoInput.x < 0 && isoInput.y < 0) {
            orthInput = new Vec3(0, 1, 0);
        } else if (isoInput.x > 0 && isoInput.y > 0) {
            orthInput = new Vec3(0, -1, 0);
        } else if (isoInput.x < 0 && isoInput.y > 0) {
            orthInput = new Vec3(-1, 0, 0);
        } else orthInput = new Vec3(0, 0, 0);

        const newState = orthInput.sqrMag() === 0 ? "idle" : "walk";
        const newOrientation = orthInput.sqrMag() === 0
            ? this.orientation
            : orthInput;
        if (
            !newOrientation.equals(this.orientation) || newState !== this.state
        ) {
            this.state = newState;
            this.orientation = newOrientation;
            const newCycle = `${newState}-${getCardinal(newOrientation)}`;
            actor.animator?.start(newCycle, time);
        }

        const target = orthInput.scale(SPEED);
        const targetV3 = new Vec3(target.x, target.y, 0);

        actor.position = actor.position.add(targetV3);
    }
}
