import { Actor } from "../engine/Actor.ts";
import { Time } from "../engine/Engine.ts";
import { Container, getContainerAt } from "./Container.ts";
import { Conveyor, CONVEYOR_SPEED } from "./Conveyor.ts";

export class Splitter extends Conveyor {
    override update(actor: Actor, time: Time): void {
        const { position: pos } = actor;
        if (this.currentItem === undefined) {
            this.currentProgress = 0;
            return;
        }

        const nextPos = pos.translation.add(pos.forwards);
        const nextActor = getContainerAt(nextPos);

        if (nextActor === undefined) {
            /// Nothing infront
            this.currentProgress += CONVEYOR_SPEED * time.deltaTime;
            if (this.currentProgress >= 1) {
                this.createPile(nextPos, this.currentItem);
                actor.getBehaviour(Container)?.empty();
                this.currentItem = undefined;
                this.currentProgress = 0;
                actor.position.forwards = actor.position.forwards.scale(-1);
            }
            return;
        }

        const nextContainer = nextActor?.getBehaviour(Container);
        if (!nextContainer) throw new Error("?");

        if (nextContainer?.isFull) {
            actor.position.forwards = actor.position.forwards.scale(-1);
            this.currentProgress = 0;
            return;
        }

        if (this.promoteItem) {
            if (this.promoteTo !== nextActor) {
                this.promoteItem = undefined;
                this.promoteTo = undefined;
            }
            this.currentProgress += CONVEYOR_SPEED * time.deltaTime;
            if (this.currentProgress >= 1) {
                this.promoteItem!(this.currentItem);
                actor.position.forwards = actor.position.forwards.scale(-1);
                actor.getBehaviour(Container)?.empty();
                this.currentItem = undefined;
                this.currentProgress = 0;
            }
        }

        const req = nextContainer.requestSpace(time);
        if (!req) return;

        this.promoteTo = nextActor;
        this.promoteItem = req;
    }
}
