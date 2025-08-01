import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { screen2World } from "../engine/Transform.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { World } from "./World.ts";

const ALL_INTERACTIVE: Actor[] = [];
const BLEND = 0.5;

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
        // TODO: Raytrace from the highest possible z-index downwards...

        if (Interactive.current) {
            Interactive.current.interactive.isActive = false;
        }
        const actor = ALL_INTERACTIVE.find((a) => {
            const pos = a.position.translation;
            return pos.x === worldPos.x && pos.y === worldPos.y;
        });
        if (!actor) return;
        const interactive = actor.getBehaviour(Interactive);
        if (interactive) {
            Interactive.current = { interactive, actor };
            interactive.isActive = true;
        }
    });
    canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const worldPos = screen2World(new Vec2(e.offsetX, e.offsetY)).floor();
        if (Interactive.current) {
            Interactive.current.interactive.isActive = false;
        }
        const actor = ALL_INTERACTIVE.find((a) => {
            const pos = a.position.translation;
            return pos.x === worldPos.x && pos.y === worldPos.y;
        });
        if (!actor) return;
        const interactive = actor.getBehaviour(Interactive);
        if (interactive) {
            Interactive.current = { interactive, actor };
            interactive.isActive = true;
        }
        actor.position.forwards = rotate90Deg(actor.position.forwards);
    });
}

export class Interactive extends Behaviour {
    static current: { interactive: Interactive; actor: Actor } | undefined =
        undefined;
    public isActive = false;
    override init(actor: Actor): void {
        ALL_INTERACTIVE.push(actor);
    }

    override update(actor: Actor, _time: Time): void {
        const { translation } = actor.position;
        if (this.isActive) {
            translation.z = BLEND * 0.3 + (1 - BLEND) * translation.z;
        } else {
            translation.z = BLEND * 0 + (1 - BLEND) * translation.z;
        }
    }
}
