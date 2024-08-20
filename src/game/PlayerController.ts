import { Actor, Position, ZERO_POSITION } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Input } from "../engine/Input.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Action, ClimbOver, ClimbUp, Jump, Walk } from "./Action.ts";
import { World } from "./World.ts";

const DEAD_ZONE = 0.1;

const getVecPrefix = (v: Vec3) => {
  let prefix = "";
  if (v.x > 0) prefix += "+x";
  if (v.x < 0) prefix += "-x";
  if (v.y > 0) prefix += "+y";
  if (v.y < 0) prefix += "-y";
  if (v.z > 0) prefix += "+z";
  if (v.z < 0) prefix += "-z";
  return prefix;
};

export const getPosPrefix = (pos: Position) => {
  return `${getVecPrefix(pos.down)}/${getVecPrefix(pos.forwards)}`;
};

type State = "idle" | "walk" | "jump-forward" | "climb-up";

export class PlayerController extends Behaviour {
  constructor(private world: World) {
    super();
  }

  canJump(p: Position): boolean {
    const currentBlock = p.translation;
    const floor = currentBlock.add(p.down);
    if (!this.world.hasBlock(floor)) return false;
    const forward = currentBlock.add(p.forwards);
    if (this.world.hasBlock(forward)) return false;
    const forwardTwice = currentBlock.add(p.forwards.scale(2));
    if (this.world.hasBlock(forwardTwice)) return false;
    const landing = floor.add(p.forwards.scale(2));
    if (!this.world.hasBlock(landing)) return false;
    if (!this.world.isInsideWorld(landing)) return false;

    return true;
  }

  canWalk(p: Position, dir: Vec3): boolean {
    if (dir.equals(new Vec3(0, 0, -1))) return false;
    const currentBlock = p.translation;
    const floor = currentBlock.add(p.down);
    if (!this.world.hasBlock(floor)) return false;
    const landing = floor.add(dir);
    if (!this.world.hasBlock(landing)) return false;
    if ((p.down.z !== -1) && !this.world.isClimbable(landing)) return false;
    const forward = currentBlock.add(dir);
    if (this.world.hasBlock(forward)) return false;
    if (!this.world.isInsideWorld(landing)) return false;

    return true;
  }

  canClimbUp(p: Position, dir: Vec3): boolean {
    if (!p.down.equals(new Vec3(0, 0, -1))) return false;
    if (dir.z !== 0) return false;
    if (dir.x < 0 || dir.y < 0) return false;
    const currentBlock = p.translation;
    const floor = currentBlock.add(p.down);
    if (!this.world.hasBlock(floor)) return false;
    const landing = currentBlock.add(dir);
    if (!this.world.hasBlock(landing)) return false;
    if (!this.world.isInsideWorld(landing)) return false;
    if (!this.world.isClimbable(landing)) return false;

    return true;
  }

  canClimbOver(p: Position, dir: Vec3) {
    if (p.down.z !== 0) return false;
    if (dir.z !== 1) return false;
    const currentBlock = p.translation;
    const floor = currentBlock.add(p.down);
    if (!this.world.hasBlock(floor)) return false;
    const forward = currentBlock.add(dir);
    if (this.world.hasBlock(forward)) return false;
    const around = forward.add(p.down);
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

  isoToWorldSpace(iso: Vec2, grounded: boolean): Vec3 {
    if (grounded) {
      // ISO Controls on the ground
      if (iso.x > 0 && iso.y < 0) return new Vec3(1, 0, 0);
      if (iso.x < 0 && iso.y < 0) return new Vec3(0, 1, 0);
      if (iso.x > 0 && iso.y > 0) return new Vec3(0, -1, 0);
      if (iso.x < 0 && iso.y > 0) return new Vec3(-1, 0, 0);
      return new Vec3(0, 0, 0);
    } else {
      if (iso.y < 0) return new Vec3(0, 0, 1);
      if (iso.y > 0) return new Vec3(0, 0, -1);
      return new Vec3(0, 0, 0);
    }
  }

  currentAction?: Action;
  update(actor: Actor, time: Time): void {
    if (!this.enabled) return;
    // Maybe complete last action
    if (
      this.currentAction && time.time > this.currentAction.endTime
    ) {
      this.currentAction.finishAction(actor, time);
      this.currentAction = undefined;
      actor?.animator?.start(`${getPosPrefix(actor.position)}/idle`, time);
    }

    // Update current action
    if (this.currentAction) {
      this.currentAction.updateAction(actor, time);
    }

    // Maybe set new action
    if (!this.currentAction) {
      if (this.pollJumping() && this.canJump(actor.position)) {
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
          `${getPosPrefix(actor.position)}/jump`,
          time,
        );
      } else {
        const grounded = actor.position.down.z === -1;
        const orthInput = this.isoToWorldSpace(
          this.pollIsometricInput(),
          grounded,
        );
        if (orthInput.sqrMag() === 0) {
          // newState = "idle";
        } else if (this.canWalk(actor.position, orthInput)) {
          const walk = new Walk();
          const targetPos = {
            translation: actor.position.translation.add(orthInput),
            forwards: orthInput,
            down: actor.position.down,
          };
          walk.startAction(
            actor.position,
            targetPos,
            actor,
            time,
          );
          this.currentAction = walk;
          actor?.animator?.start(`${getPosPrefix(targetPos)}/walk`, time);
        } else if (this.canClimbUp(actor.position, orthInput)) {
          actor.position.forwards = orthInput;
          const targetPos = {
            translation: actor.position.translation,
            down: orthInput,
            forwards: actor.position.down.scale(-1),
          };
          const climbUp = new ClimbUp();
          climbUp.startAction(
            actor.position,
            targetPos,
            actor,
            time,
          );
          this.currentAction = climbUp;

          actor?.animator?.start(
            `${getPosPrefix(actor.position)}/climb-up`,
            time,
          );
        } else if (this.canClimbOver(actor.position, orthInput)) {
          const targetPos = {
            translation: actor.position.translation
              .add(orthInput)
              .add(actor.position.down),
            down: actor.position.forwards.scale(-1),
            forwards: actor.position.down,
          };
          const climbOver = new ClimbOver();
          climbOver.startAction(actor.position, targetPos, actor, time);
          this.currentAction = climbOver;
          actor?.animator?.start(
            `${getPosPrefix(actor.position)}/climb-over`,
            time,
          );
        }
      }
    }
  }
}
