import { Actor } from "./Actor.ts";
import { Component } from "./Component.ts";
import { Time } from "./Engine.ts";

export class Behaviour extends Component {
    init(_actor: Actor) {}
    render(_actor: Actor, _time: Time) {}
    update(_actor: Actor, _time: Time) {}
}
