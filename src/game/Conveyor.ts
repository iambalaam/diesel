import { Actor } from "../engine/Actor.ts";
import { SPRITE_MS } from "../engine/Animator.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Drill, getDrillAt } from "./Drill.ts";
import { Pile } from "./Pile.ts";
import { conveyorItems, getCardinal } from "./main.ts";

export const CONVEYOR_SPEED = 0.004 / SPRITE_MS;
const ALL_CARRIERS: Actor[] = [];

export function getCarrierAt(pos: Vec2) {
    return ALL_CARRIERS.find((c) =>
        pos.x === c.position.translation.x && pos.y === c.position.translation.y
    );
}
export function addCarrier(actor: Actor) {
    ALL_CARRIERS.push(actor);
}
export function removeCarrier(actor: Actor) {
    const thisIndex = ALL_CARRIERS.findIndex((c) => c === actor);
    ALL_CARRIERS.splice(thisIndex, 1);
}

export type ConveyorItem = 0 | 1;

export class Conveyor extends Behaviour {
    protected currentProgress = 0;
    protected currentItem?: ConveyorItem = undefined;

    constructor(
        protected createPile: (pos: Vec3, item: ConveyorItem) => Actor,
    ) {
        super();
    }

    override init(actor: Actor): void {
        ALL_CARRIERS.push(actor);
        actor.animator?.startCycle(getCardinal(actor.position.forwards), {
            time: 0,
            deltaTime: 0,
        });
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
        const nextDrill = getDrillAt(nextPos);
        const nextCarrier = getCarrierAt(nextPos);
        if (nextDrill instanceof Actor) {
            nextDrill.getBehaviour(Drill)?.addFuel();
            this.currentItem = undefined;
            return;
        }
        if (nextCarrier instanceof Actor) {
            // Move onto next in line
            const nextConveyor = nextCarrier.getBehaviour(Conveyor);
            if (nextConveyor) {
                if (nextConveyor.getCurrentItem() === undefined) {
                    nextConveyor.setItem(this.currentItem);
                    this.currentItem = undefined;
                    return;
                } else {
                    this.currentProgress = 1;
                }
            }

            const nextPile = nextCarrier.getBehaviour(Pile);
            if (nextPile && nextPile.addItem(this.currentItem)) {
                this.currentItem = undefined;
                return;
            } else {
                this.currentProgress = 1;
            }
        } else {
            // Create a pile
            const pile = this.createPile(nextPos, this.currentItem);
            addCarrier(pile);
            this.currentItem = undefined;
        }
    }

    override render(actor: Actor, _time: Time): void {
        const { renderer, position } = actor;

        const cardinal = getCardinal(actor.position.forwards);
        actor.animator?.joinCycle(cardinal);

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

    getCurrentItem() {
        return this.currentItem;
    }

    setItem(item: ConveyorItem) {
        if (this.currentItem !== undefined) return false;
        this.currentProgress = 0;
        this.currentItem = item;
        return true;
    }

    override destroy(actor: Actor): void {
        removeCarrier(actor);
    }
}
