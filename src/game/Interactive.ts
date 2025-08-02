import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { screen2World } from "../engine/Transform.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Conveyor } from "./Conveyor.ts";
import { Drill } from "./Drill.ts";
import { selector } from "./main.ts";
import { Pile } from "./Pile.ts";
import { World } from "./World.ts";

const ALL_INTERACTIVE: Actor[] = [];
const BLEND_SPEED = 0.5;
const HOVER_HEIGHT = 0.1;
const GRAB_HEIGHT = 0.5;

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
        const actors = ALL_INTERACTIVE.filter((a) => {
            const pos = a.position.translation;
            return pos.x === worldPos.x &&
                pos.y === worldPos.y;
        });

        if (Interactive.current?.grab) {
            Interactive.current.actor.position.translation = worldPos.add(
                new Vec3(0, 0, GRAB_HEIGHT),
            );
            const newActors = ALL_INTERACTIVE.filter((a) => {
                const pos = a.position.translation;
                return pos.x === worldPos.x &&
                    pos.y === worldPos.y;
            });
            if (
                Interactive.current?.dropping && newActors.length < 2
            ) {
                Interactive.current = undefined;
                canvas.style.cursor = "unset";
            }
            return;
        }
        if (!actors.length) {
            Interactive.current = undefined;
            canvas.style.cursor = "unset";
        } else {
            canvas.style.cursor = "grab";
            const interactive = actors[0].getBehaviour(Interactive);
            if (interactive) {
                Interactive.current = {
                    interactive,
                    actor: actors[0],
                    grab: false,
                    dropping: false,
                };
            }
        }
    });

    canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (!Interactive.current) return;
        const { interactive, actor } = Interactive.current;
        if (interactive) {
            Interactive.current = {
                interactive,
                actor,
                grab: false,
                dropping: false,
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
        canvas.style.cursor = "grabbing";
        if (interactive) {
            Interactive.current = {
                interactive,
                actor,
                grab: true,
                dropping: false,
            };
        }
    });

    document.addEventListener("mouseup", (e) => {
        e.preventDefault();
        if (Interactive.current) {
            const worldPos = screen2World(new Vec2(e.offsetX, e.offsetY))
                .floor();
            const actor = ALL_INTERACTIVE.find((a) => {
                const pos = a.position.translation;
                return a !== Interactive.current?.actor &&
                    pos.x === worldPos.x && pos.y === worldPos.y;
            });

            if (!actor) {
                canvas.style.cursor = "grab";
                Interactive.current.grab = false;
                return;
            }
            const grabbedPile = Interactive.current.actor.getBehaviour(Pile);
            if (grabbedPile) {
                const groundPile = actor.getBehaviour(Pile);
                if (groundPile) {
                    grabbedPile.getItems().forEach((item) =>
                        groundPile.addItem(item)
                    );
                    Interactive.current.actor.destroy();
                    Interactive.current = undefined;
                    return;
                }
                const groundConveyor = actor.getBehaviour(Conveyor);
                const pileItems = grabbedPile.getItems();
                if (groundConveyor && pileItems.length === 1) {
                    groundConveyor.setItem(pileItems[0]);
                    Interactive.current.actor.destroy();
                    Interactive.current = undefined;
                    return;
                }
                const groundDrill = actor.getBehaviour(Drill);
                if (groundDrill) {
                    groundDrill.addFuel();
                    Interactive.current.actor.destroy();
                    Interactive.current = undefined;
                    return;
                }
            }

            Interactive.current.dropping = true;
        }
    });
}

export class Interactive extends Behaviour {
    static current: {
        grab: boolean;
        dropping: boolean;
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

    override render(actor: Actor, _time: Time): void {
        if (!actor.renderer) return;
        if (Interactive.current?.grab && Interactive.current.actor === actor) {
            const groundPos = actor.position.translation.clone();
            groundPos.z = 0;
            actor.renderer.renderSprite(selector, 0, groundPos);
        }
    }

    override destroy(actor: Actor): void {
        const thisIndex = ALL_INTERACTIVE.findIndex((i) => i === actor);
        ALL_INTERACTIVE.splice(thisIndex, 1);
    }
}
