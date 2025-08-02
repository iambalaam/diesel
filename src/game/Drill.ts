import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Conveyor, ConveyorItem, getCarrierAt } from "./Conveyor.ts";
import { getCardinal } from "./main.ts";
import { Pile } from "./Pile.ts";

const EMIT_EVERY_MS = 3_000;
const OUTPUT_MULTIPLIER = 3;

const ALL_DRILLS: Actor[] = [];
export function getDrillAt(pos: Vec2) {
    return ALL_DRILLS.find((c) =>
        pos.x === c.position.translation.x && pos.y === c.position.translation.y
    );
}
export function addDrill(actor: Actor) {
    ALL_DRILLS.push(actor);
}
export function removeDrill(actor: Actor) {
    const thisIndex = ALL_DRILLS.findIndex((c) => c === actor);
    ALL_DRILLS.splice(thisIndex, 1);
}
export class Drill extends Behaviour {
    private nextEmitTime?: number;
    private fuel = 0;

    private item: ConveyorItem = 0;

    constructor(private createPile: (pos: Vec3, item: ConveyorItem) => void) {
        super();
    }

    override init(actor: Actor): void {
        addDrill(actor);
    }

    addFuel() {
        if (this.fuel <= 0) {
            this.nextEmitTime = undefined;
        }
        this.fuel = OUTPUT_MULTIPLIER;
    }

    override update(actor: Actor, time: Time): void {
        if (!this.nextEmitTime) {
            this.nextEmitTime = time.time + EMIT_EVERY_MS;
            return;
        }
        if (time.time >= this.nextEmitTime && this.fuel > 0) {
            const { translation, forwards } = actor.position;
            const targetPos = translation.add(forwards);

            const drill = getDrillAt(targetPos);
            if (drill instanceof Actor) {
                drill.getBehaviour(Drill)?.addFuel();
                return;
            }

            const carrier = getCarrierAt(targetPos);
            if (carrier) {
                const conveyor = carrier.getBehaviour(Conveyor);
                if (conveyor) {
                    if (conveyor.setItem(this.item)) {
                        this.fuel--;
                        this.nextEmitTime = time.time + EMIT_EVERY_MS;
                        return;
                    }
                }

                const pile = carrier.getBehaviour(Pile);
                if (pile) {
                    if (pile.addItem(this.item)) {
                        this.fuel--;
                        this.nextEmitTime = time.time + EMIT_EVERY_MS;
                    }
                    return;
                }
            } else {
                this.createPile(targetPos, this.item);
                this.fuel--;
                this.nextEmitTime = time.time + EMIT_EVERY_MS;
            }
        }
    }

    override render(actor: Actor, _time: Time): void {
        const cardinal = getCardinal(actor.position.forwards);
        actor.animator?.joinCycle(
            this.fuel > 0 ? cardinal : `${cardinal}-idle`,
        );
    }

    override destroy(actor: Actor): void {
        removeDrill(actor);
    }
}
