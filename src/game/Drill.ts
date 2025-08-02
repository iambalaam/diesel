import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Container, getContainerAt } from "./Container.ts";
import { ConveyorItem } from "./Conveyor.ts";
import { getCardinal } from "./main.ts";

const EMIT_EVERY_MS = 3_000;
const OUTPUT_MULTIPLIER = 3;

export class Drill extends Behaviour {
    promoteItem: ((item: ConveyorItem) => void) | undefined;
    promoteTo: Actor | undefined;
    private progress = 0;
    private fuel = 0;

    private item: ConveyorItem = 0;

    constructor(private createPile: (pos: Vec3, item: ConveyorItem) => void) {
        super();
    }

    override init(actor: Actor): void {
        actor.addBehaviour(new Container(Infinity)).onItem = (_item) => {
            this.fuel = OUTPUT_MULTIPLIER;
        };
    }

    override update(actor: Actor, time: Time): void {
        if (this.fuel <= 0) {
            actor.getBehaviour(Container)?.empty();
            return;
        }

        const target = actor.position.translation.add(actor.position.forwards);
        const targetActor = getContainerAt(target);
        const targetContainer = targetActor?.getBehaviour(Container);

        if (targetContainer?.isFull) {
            this.progress = 0;
            return;
        }

        this.progress += time.deltaTime;

        if (this.promoteItem && this.promoteTo === targetActor) {
            // Put on something
            if (this.promoteTo !== targetActor) {
                this.promoteItem = undefined;
                this.promoteTo = undefined;
            }
            if (this.progress >= EMIT_EVERY_MS) {
                this.promoteItem!(this.item);
                this.fuel--;
                this.progress = 0;
            }
        }

        if (!targetActor && this.progress >= EMIT_EVERY_MS) {
            // Creating a pile
            this.createPile(target, this.item);
            this.progress = 0;
            this.fuel--;
        }

        if (targetContainer) {
            const req = targetContainer.requestSpace(time);
            if (!req) return;
            this.promoteItem = req;
            this.promoteTo = targetActor;
        }
    }

    override render(actor: Actor, _time: Time): void {
        const cardinal = getCardinal(actor.position.forwards);
        actor.animator?.joinCycle(
            this.fuel > 0 ? cardinal : `${cardinal}-idle`,
        );
    }
}
