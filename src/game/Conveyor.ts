import { Actor } from "../engine/Actor.ts";
import { SPRITE_MS } from "../engine/Animator.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Pile } from "./Pile.ts";
import { World } from "./World.ts";
import { conveyorItems } from "./main.ts";

const CONVEYOR_SPEED = 0.004 / SPRITE_MS;
const ALL_CARRIERS: Actor[] = [];

function getConveyorAt(pos: Vec2) {
    return ALL_CARRIERS.find((c) =>
        pos.x === c.position.translation.x && pos.y === c.position.translation.y
    );
}

export type ConveyorItem = 0 | 1;

export class Conveyor extends Behaviour {
    private currentProgress = 0;
    private currentItem?: ConveyorItem = undefined;

    constructor(
        private world: World,
        private createPile: (pos: Vec3, item: ConveyorItem) => Actor,
    ) {
        super();
    }

    override init(actor: Actor): void {
        ALL_CARRIERS.push(actor);
    }

    override update(actor: Actor, time: Time): void {
        const { position: pos } = actor;
        if (this.currentItem === undefined) {
            this.currentProgress = 0;
            return;
        }
        this.currentProgress += CONVEYOR_SPEED * time.deltaTime;
        if (this.currentProgress < 1) return;

        const nextPos = pos.translation.add(pos.forwards);
        const next = getConveyorAt(nextPos);
        if (next instanceof Actor) {
            // Move onto next in line
            const nextConveyor = next.getBehaviour(Conveyor);
            if (nextConveyor) {
                if (nextConveyor.currentItem === undefined) {
                    nextConveyor.setItem(this.currentItem);
                    this.currentItem = undefined;
                    return;
                } else {
                    this.currentProgress = 1;
                }
            }

            const nextPile = next.getBehaviour(Pile);
            if (nextPile && nextPile.addItem(this.currentItem)) {
                this.currentItem = undefined;
                return;
            } else {
                this.currentProgress = 1;
            }
        } else {
            // Create a pile
            const pile = this.createPile(nextPos, this.currentItem);
            ALL_CARRIERS.push(pile);
            this.currentItem = undefined;
        }
    }

    override render(actor: Actor, _time: Time): void {
        const { renderer, position } = actor;
        if (this.currentItem !== undefined && renderer) {
            renderer.renderSprite(
                conveyorItems,
                this.currentItem,
                position.translation
                    .add(position.forwards.scale(this.currentProgress))
                    .add(new Vec3(0, 0, 0.3)),
            );
        }
    }

    setItem(item: ConveyorItem) {
        if (this.currentItem !== undefined) return false;
        this.currentProgress = 0;
        this.currentItem = item;
        return true;
    }
}
