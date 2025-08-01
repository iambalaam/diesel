import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { ConveyorItem } from "./Conveyor.ts";
import { conveyorItems } from "./main.ts";

const ITEM_HEIGHT = 0.1;

export class Pile extends Behaviour {
    private items: ConveyorItem[];

    constructor(item: ConveyorItem) {
        super();
        this.items = [item];
    }

    getItems = () => [...this.items];

    addItem(item: ConveyorItem) {
        this.items.push(item);
    }

    override render(actor: Actor, _time: Time): void {
        const { renderer, position } = actor;
        if (!renderer) return;

        this.items.forEach((item, index) => {
            renderer.renderSprite(
                conveyorItems,
                item,
                position.translation.add(
                    new Vec3(0, 0, 1).scale(index * ITEM_HEIGHT),
                ),
            );
        });
    }
}
