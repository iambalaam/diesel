import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Container } from "./Container.ts";
import { ConveyorItem } from "./Conveyor.ts";
import { conveyorItems } from "./main.ts";

const ITEM_HEIGHT = 0.1;
const MAX_ITEMS = 5;

const itemPositions: Vec3[] = [
    new Vec3(-0.25, 0.25, 0),
    new Vec3(0.25, 0.25, 0),
    new Vec3(0.25, -0.25, 0),
    new Vec3(-0.25, -0.25, 0),
    new Vec3(0, 0, 0.25),
];

export class Pile extends Behaviour {
    container?: Container;
    constructor(item: ConveyorItem) {
        super();
    }

    override init(actor: Actor): void {
        this.container = actor.addBehaviour(new Container(5));
    }

    override render(actor: Actor, _time: Time): void {
        const { renderer, position } = actor;
        if (!renderer) return;

        this.container?.items.forEach((item, index) => {
            const pos = itemPositions[index];
            if (pos) {
                renderer.renderSprite(
                    conveyorItems,
                    item,
                    position.translation.add(pos),
                );
            }
        });
    }
}
