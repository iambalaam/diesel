import { Actor } from "../engine/Actor.ts";
import { SPRITE_MS } from "../engine/Animator.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Container, getContainerAt } from "./Container.ts";
import { conveyorItems, getCardinal } from "./main.ts";

export const CONVEYOR_SPEED = 0.0145 / SPRITE_MS;

export type ConveyorItem = 0 | 1 | 2;

export class Conveyor extends Behaviour {
    protected currentProgress = 0;
    protected currentItem?: ConveyorItem = undefined;
    protected promoteTo: Actor | undefined;
    protected promoteItem?: (item: ConveyorItem) => void;

    constructor(
        protected createPile: (pos: Vec3, item: ConveyorItem) => Actor,
    ) {
        super();
    }

    override init(actor: Actor): void {
        actor.addBehaviour(new Container(1)).onItem = (item) => {
            this.currentItem = item;
            this.currentProgress = 0;
        };
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

        const nextPos = pos.translation.add(pos.forwards);
        const nextActor = getContainerAt(nextPos);

        if (nextActor === undefined) {
            // Nothing infront
            this.currentProgress += CONVEYOR_SPEED * time.deltaTime;
            if (this.currentProgress >= 1) {
                this.createPile(nextPos, this.currentItem);
                actor.getBehaviour(Container)?.empty();
                this.currentItem = undefined;
                this.currentProgress = 0;
            }
            return;
        }

        const nextContainer = nextActor?.getBehaviour(Container);
        if (!nextContainer) throw new Error("?");

        if (nextContainer?.isFull) {
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
}
