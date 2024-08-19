import { Animator } from "./Animator.ts";
import { Background } from "./Background.ts";
import { Behaviour } from "./Behaviour.ts";
import { Time } from "./Engine.ts";
import { RenderReq, SpriteRenderer } from "./SpriteRenderer.ts";
import { Vec3 } from "./Vec3.ts";

export class Actor {
  position: Vec3;
  animator?: Animator;
  background?: Background;
  renderer?: SpriteRenderer;
  #behaviours: Behaviour[];

  constructor(public name: string) {
    this.position = new Vec3(0, 0, 0);
    this.#behaviours = [];
  }

  addBehaviour(behaviour: Behaviour) {
    this.#behaviours.push(behaviour);
    behaviour.init(this);
  }

  render(time: Time): RenderReq[] {
    for (const behaviour of this.#behaviours) {
      behaviour.render(this, time);
    }
    this.background?.render(this);
    this.animator?.render(this, time);
    return this.renderer?.render() || [];
  }

  update(time: Time) {
    for (const behaviour of this.#behaviours) {
      behaviour.update(this, time);
    }
  }
}
