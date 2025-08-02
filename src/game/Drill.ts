import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Conveyor, ConveyorItem, getCarrierAt } from "./Conveyor.ts";
import { getCardinal } from "./main.ts";
import { Pile } from "./Pile.ts";

const EMIT_EVERY_MS = 3_000;

export class Drill extends Behaviour {
    private lastEmittedAt: Time = {
        time: 0,
        deltaTime: 0,
    };

    private item: ConveyorItem = 0;

    constructor(private createPile: (pos: Vec3, item: ConveyorItem) => void) {
        super();
    }

    override update(actor: Actor, time: Time): void {
        if (time.time >= this.lastEmittedAt.time + EMIT_EVERY_MS) {
            const { translation, forwards } = actor.position;
            const targetPos = translation.add(forwards);

            const carrier = getCarrierAt(targetPos);
            if (carrier) {
                const conveyor = carrier.getBehaviour(Conveyor);
                if (conveyor) {
                    if (conveyor.setItem(this.item)) {
                        this.lastEmittedAt.time += EMIT_EVERY_MS;
                        return;
                    }
                }

                const pile = carrier.getBehaviour(Pile);
                if (pile) {
                    if (pile.addItem(this.item)) {
                        this.lastEmittedAt.time += EMIT_EVERY_MS;
                    }
                    return;
                }
            } else {
                this.createPile(targetPos, this.item);
                this.lastEmittedAt.time += EMIT_EVERY_MS;
            }
        }
    }

    override render(actor: Actor, _time: Time): void {
        const cardinal = getCardinal(actor.position.forwards);
        actor.animator?.joinCycle(cardinal);
    }
}
