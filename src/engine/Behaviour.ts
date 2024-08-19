import { Actor } from "./Actor.ts";
import { Time } from "./Engine.ts";

export class Behaviour {
    init(_actor: Actor) {}
    render(_actor: Actor, _time: Time) {}
    update(_actor: Actor, _time: Time) {}
}
