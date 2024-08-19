import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Input } from "../engine/Input.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { World } from "./World.ts";

const WALK_SPEED = 0.001;
const JUMP_SPEED = 0.00075;
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
type Pos = {
  pos: Vec3;
  forward: Vec3;
  down: Vec3;
};

export class PlayerController extends Behaviour {
  constructor(private world: World) {
    super();
  }

  current: Pos = {
    pos: new Vec3(0, 0, 0),
    forward: new Vec3(0, -1, 0),
    down: new Vec3(0, 0, -1),
  };
  target?: Pos = undefined;

  init(actor: Actor): void {
    this.current.pos = actor.position.clone();
  }

  canJump(): boolean {
    const currentBlock = this.current.pos;
    const floor = currentBlock.add(this.current.down);
    if (!this.world.hasBlock(floor)) return false;
    const forward = currentBlock.add(this.current.forward);
    if (this.world.hasBlock(forward)) return false;
    const forwardTwice = currentBlock.add(this.current.forward.scale(2));
    if (this.world.hasBlock(forwardTwice)) return false;
    const landing = floor.add(this.current.forward.scale(2));
    if (!this.world.hasBlock(landing)) return false;
    if (!this.world.isInsideWorld(landing)) return false;

    return true;
  }

  canWalk(dir: Vec3): boolean {
    const currentBlock = this.current.pos;
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
    if (!this.current.down.equals(new Vec3(0, 0, 1))) return false;
    if (dir.z !== 0) return false;
    const currentBlock = this.current.pos;
    const floor = currentBlock.add(this.current.down);
    if (!this.world.hasBlock(floor)) return false;
    const landing = currentBlock.add(dir);
    if (!this.world.hasBlock(landing)) return false;
    if (!this.world.isInsideWorld(landing)) return false;

    return true;
  }

  canClimbOver(dir: Vec3) {
    if (this.current.down.z === 0) return false;
    const currentBlock = this.current.pos;
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
    // Maybe complete last action
    if (this.target) {
      const distanceLeft = this.target.pos.subtract(actor.position);
      if (distanceLeft.dot(this.orientation) <= 0) {
        actor.position = this.target.pos;
        this.current.pos = this.target.pos;
        this.current.forward = this.target.forward;
        this.current.down = this.target.down;
        this.target = undefined;
        this.isJumping = false;
        this.isWalking = false;
      }
    }

    // Maybe set new action
    if (!this.target) {
      let newState: State = this.state;
      let newOrientation: Vec3 = this.orientation;

      if (this.pollJumping()) {
        if (this.canJump()) {
          this.isJumping = true;
          newState = "jump-forward";
          this.target = {
            pos: actor.position.add(this.orientation.scale(2)),
            down: this.current.down,
            forward: this.current.forward,
          };
        }
      } else {
        const orthInput = this.isoToWorldSpace(this.pollIsometricInput());
        const walking = orthInput.sqrMag() > 0 && this.canWalk(orthInput);
        if (walking) {
          this.isWalking = true;
          newState = "walk";
          newOrientation = orthInput;
          this.target = {
            pos: actor.position.add(orthInput),
            down: this.current.down,
            forward: orthInput,
          };
        } else {
          newState = "idle";
        }
      }

      if (!newOrientation.equals(this.orientation) || newState !== this.state) {
        this.state = newState;
        this.orientation = newOrientation;
        const newCycle = `${newState}-${getCardinal(newOrientation)}`;
        actor.animator?.start(newCycle, time);
      }
    }

    // Set state
    if (this.target) {
      const speed = this.isJumping ? JUMP_SPEED : WALK_SPEED;
      actor.position = actor.position.add(
        this.orientation.scale(speed * time.deltaTime)
      );
    }
  }
}
