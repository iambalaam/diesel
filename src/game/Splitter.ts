import { Actor } from "../engine/Actor.ts";
import { Time } from "../engine/Engine.ts";
import {
    ALL_CARRIERS,
    Conveyor,
    CONVEYOR_SPEED,
    getCarrierAt,
} from "./Conveyor.ts";
import { Pile } from "./Pile.ts";

export class Splitter extends Conveyor {
    override update(actor: Actor, time: Time): void {
        const { position: pos } = actor;
        if (this.currentItem === undefined) {
            this.currentProgress = 0;
            return;
        }
        this.currentProgress += CONVEYOR_SPEED * time.deltaTime;
        if (this.currentProgress < 1) return;

        const nextPos = pos.translation.add(pos.forwards);
        actor.position.forwards = actor.position.forwards.scale(-1);
        const next = getCarrierAt(nextPos);
        if (next instanceof Actor) {
            // Move onto next in line
            const nextConveyor = next.getBehaviour(Conveyor);
            if (nextConveyor) {
                if (nextConveyor.getCurrentItem() === undefined) {
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
}
