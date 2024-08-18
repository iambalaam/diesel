import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Input } from "../engine/Input.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";

const WALK_SPEED = 0.002;
const JUMP_SPEED = 0.0015;
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

type State = "idle" | "walk" | "jump-forward";

export class PlayerController extends Behaviour {
    isJumping = false;
    isWalking = false;

    targetPos?: Vec3;
    state: State = "idle";
    orientation = new Vec3(0, -1, 0);

    pollJumping(): boolean {
        return Input.Keyboard[" "] || !!Input.Gamepad.buttons[0];
    }

    pollIsometricInput(): Vec2 {
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
        return isoInput;
    }

    isoToWorldSpace(iso: Vec2): Vec3 {
        if (iso.x > 0 && iso.y < 0) {
            return new Vec3(1, 0, 0);
        } else if (iso.x < 0 && iso.y < 0) {
            return new Vec3(0, 1, 0);
        } else if (iso.x > 0 && iso.y > 0) {
            return new Vec3(0, -1, 0);
        } else if (iso.x < 0 && iso.y > 0) {
            return new Vec3(-1, 0, 0);
        } else return new Vec3(0, 0, 0);
    }

    update(actor: Actor, time: Time): void {
        // Maybe achieved goal
        if (this.targetPos) {
            const distanceLeft = this.targetPos.subtract(actor.position);
            if (distanceLeft.dot(this.orientation) <= 0) {
                actor.position = this.targetPos;
                this.targetPos = undefined;
                this.isJumping = false;
                this.isWalking = false;
            }
        }

        // Set goal
        if (!this.targetPos) {
            let newState: State = this.state;
            let newOrientation: Vec3 = this.orientation;

            if (this.pollJumping()) {
                this.isJumping = true;
                newState = "jump-forward";
                this.targetPos = actor.position.add(this.orientation.scale(4));
            } else {
                const orthInput = this.isoToWorldSpace(
                    this.pollIsometricInput(),
                );
                const walking = orthInput.sqrMag() > 0;
                if (walking) {
                    this.isWalking = true;
                    newState = "walk";
                    newOrientation = orthInput;
                    this.targetPos = actor.position.add(
                        orthInput.scale(2),
                    );
                } else {
                    newState = "idle";
                }
            }

            if (
                !newOrientation.equals(this.orientation) ||
                newState !== this.state
            ) {
                this.state = newState;
                this.orientation = newOrientation;
                const newCycle = `${newState}-${getCardinal(newOrientation)}`;
                actor.animator?.start(newCycle, time);
            }
        }

        // Attempt to update position
        if (this.targetPos) {
            const speed = this.isJumping ? JUMP_SPEED : WALK_SPEED;
            actor.position = actor.position.add(
                this.orientation.scale(speed * time.deltaTime),
            );
        }
    }
}
