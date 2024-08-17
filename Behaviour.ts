import { Actor } from "./Actor.ts";
import { Time } from "./engine.ts";

export class Behaviour {
    render(_actor: Actor, _time: Time) {}
    update(_actor: Actor, _time: Time) {}
}
