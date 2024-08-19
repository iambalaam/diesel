import { Actor, Position, ZERO_POSITION } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { MS, Time } from "../engine/Engine.ts";
import { Input } from "../engine/Input.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Action, ClimbUp, Jump, Walk } from "./Action.ts";
import { World } from "./World.ts";

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

type State = "idle" | "walk" | "jump-forward" | "climb-up";

export class PlayerController extends Behaviour {
  constructor(private world: World) {
    super();
  }

  current: Position = ZERO_POSITION;
  init(actor: Actor): void {
    this.current = actor.position;
  }

  canJump(): boolean {
    const currentBlock = this.current.translation;
    const floor = currentBlock.add(this.current.down);
    if (!this.world.hasBlock(floor)) return false;
    const forward = currentBlock.add(this.current.forwards);
    if (this.world.hasBlock(forward)) return false;
    const forwardTwice = currentBlock.add(this.current.forwards.scale(2));
    if (this.world.hasBlock(forwardTwice)) return false;
    const landing = floor.add(this.current.forwards.scale(2));
    if (!this.world.hasBlock(landing)) return false;
    if (!this.world.isInsideWorld(landing)) return false;

    return true;
  }

  canWalk(dir: Vec3): boolean {
    const currentBlock = this.current.translation;
    const floor = currentBlock.add(this.current.down);
    if (!this.world.hasBlock(floor)) return false;
    const landing = floor.add(dir);
    if (!this.world.hasBlock(landing)) return false;
    const forward = currentBlock.add(dir);
    if (this.world.hasBlock(forward)) return false;
    if (!this.world.isInsideWorld(landing)) return false;

    return true;
  }

  canClimbUp(dir: Vec3): boolean {
    if (!this.current.down.equals(new Vec3(0, 0, -1))) return false;
    if (dir.z !== 0) return false;
    const currentBlock = this.current.translation;
    const floor = currentBlock.add(this.current.down);
    if (!this.world.hasBlock(floor)) return false;
    const landing = currentBlock.add(dir);
    if (!this.world.hasBlock(landing)) return false;
    if (!this.world.isInsideWorld(landing)) return false;

    return true;
  }

  canClimbOver(dir: Vec3) {
    if (this.current.down.z === 0) return false;
    const currentBlock = this.current.translation;
    const floor = currentBlock.add(this.current.down);
    if (!this.world.hasBlock(floor)) return false;
    const forward = currentBlock.add(dir);
    if (this.world.hasBlock(forward)) return false;
    const around = forward.add(this.current.down);
    if (this.world.hasBlock(around)) return false;
    if (!this.world.isInsideWorld(floor)) return false;

    return true;
  }

  isJumping = false;
  isWalking = false;

  state: State = "idle";

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

  currentAction?: Action;
  update(actor: Actor, time: Time): void {
    // Maybe complete last action
    if (
      this.currentAction && time.time > this.currentAction.endTime
    ) {
      this.currentAction.finishAction(actor, time);
      this.currentAction = undefined;
      actor?.animator?.start(
        `idle-${getCardinal(actor.position.forwards)}`,
        time,
      );
    }

    // Update current action
    if (this.currentAction) {
      this.currentAction.updateAction(actor, time);
    } // Maybe set new action
    else {
      if (this.pollJumping() && this.canJump()) {
        console.log("start jump");
        const jump = new Jump();
        jump.startAction(
          actor.position,
          {
            translation: actor.position.translation.add(
              actor.position.forwards.scale(2),
            ),
            forwards: actor.position.forwards,
            down: actor.position.down,
          },
          actor,
          time,
        );
        this.currentAction = jump;
        actor?.animator?.start(
          `jump-forward-${getCardinal(actor.position.forwards)}`,
          time,
        );
      } else {
        const orthInput = this.isoToWorldSpace(this.pollIsometricInput());
        if (orthInput.sqrMag() === 0) {
          // newState = "idle";
        } else if (this.canWalk(orthInput)) {
          const walk = new Walk();
          walk.startAction(
            actor.position,
            {
              translation: actor.position.translation.add(orthInput),
              forwards: orthInput,
              down: actor.position.down,
            },
            actor,
            time,
          );
          this.currentAction = walk;
          actor?.animator?.start(`walk-${getCardinal(orthInput)}`, time);
        } else if (this.canClimbUp(orthInput)) {
          const climbUp = new ClimbUp();
          climbUp.startAction(
            actor.position,
            {
              translation: actor.position.translation,
              down: actor.position.forwards,
              forwards: actor.position.down.scale(-1),
            },
            actor,
            time,
          );
          this.currentAction = climbUp;
          actor?.animator?.start(`climb-up-${getCardinal(orthInput)}`, time);
        }
      }
    }
  }
}
