import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { screen2World } from "../engine/Transform.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { World } from "./World.ts";

const ALL_INTERACTIVE: Actor[] = [];
const BLEND_SPEED = 0.5;
const HOVER_HEIGHT = 0.2;
const GRAB_HEIGHT = 0.9;

const rotate90Deg = (v: Vec3) => {
    if (v.x === 1 && v.y === 0) return new Vec3(0, -1, 0);
    if (v.x === 0 && v.y === -1) return new Vec3(-1, 0, 0);
    if (v.x === -1 && v.y === 0) return new Vec3(0, 1, 0);
    if (v.x === 0 && v.y === 1) return new Vec3(1, 0, 0);
    throw new Error(`Cannot rotate ${v}`);
};

export function addInteraction(canvas: HTMLCanvasElement, world: World) {
    canvas.addEventListener("mousemove", ({ offsetX, offsetY }) => {
        const worldPos = screen2World(new Vec2(offsetX, offsetY)).floor();
        if (Interactive.current?.grab) {
            Interactive.current.actor.position.translation = worldPos.add(
                new Vec3(0, 0, GRAB_HEIGHT),
            );
            return;
        }
        const actor = ALL_INTERACTIVE.find((a) => {
            const pos = a.position.translation;
            return pos.x === worldPos.x && pos.y === worldPos.y;
        });
        if (!actor) {
            Interactive.current = undefined;
        } else {
            const interactive = actor.getBehaviour(Interactive);
            if (interactive) {
                Interactive.current = {
                    interactive,
                    actor,
                    grab: false,
                };
            }
        }
    });

    canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const worldPos = screen2World(new Vec2(e.offsetX, e.offsetY)).floor();
        const actor = ALL_INTERACTIVE.find((a) => {
            const pos = a.position.translation;
            return pos.x === worldPos.x && pos.y === worldPos.y;
        });
        if (!actor) return;
        const interactive = actor.getBehaviour(Interactive);
        if (interactive) {
            Interactive.current = {
                interactive,
                actor,
                grab: false,
            };
        }
        actor.position.forwards = rotate90Deg(actor.position.forwards);
    });

    canvas.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const worldPos = screen2World(new Vec2(e.offsetX, e.offsetY)).floor();
        const actor = ALL_INTERACTIVE.find((a) => {
            const pos = a.position.translation;
            return pos.x === worldPos.x && pos.y === worldPos.y;
        });
        if (!actor) return;
        const interactive = actor.getBehaviour(Interactive);
        if (interactive) {
            Interactive.current = {
                interactive,
                actor,
                grab: true,
            };
        }
    });

    document.addEventListener("mouseup", (e) => {
        e.preventDefault();
        if (Interactive.current) {
            Interactive.current.grab = false;
        }
    });
}

export class Interactive extends Behaviour {
    static current: {
        grab: boolean;
        interactive: Interactive;
        actor: Actor;
    } | undefined = undefined;
    override init(actor: Actor): void {
        ALL_INTERACTIVE.push(actor);
    }

    override update(actor: Actor, _time: Time): void {
        const { translation } = actor.position;
        if (Interactive.current?.actor === actor) {
            const height = Interactive.current.grab
                ? GRAB_HEIGHT
                : HOVER_HEIGHT;
            translation.z = BLEND_SPEED * height +
                (1 - BLEND_SPEED) * translation.z;
        } else {
            translation.z = BLEND_SPEED * 0 + (1 - BLEND_SPEED) * translation.z;
        }
    }
}
