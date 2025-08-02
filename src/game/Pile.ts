import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { addCarrier, ConveyorItem, removeCarrier } from "./Conveyor.ts";
import { conveyorItems } from "./main.ts";

const ITEM_HEIGHT = 0.1;
const MAX_ITEMS = 5;

export class Pile extends Behaviour {
    private items: ConveyorItem[];

    constructor(item: ConveyorItem) {
        super();
        this.items = [item];
    }

    override init(actor: Actor): void {
        addCarrier(actor);
    }

    getItems = () => [...this.items];

    addItem(item: ConveyorItem): boolean {
        if (this.items.length < MAX_ITEMS) {
            this.items.push(item);
            return true;
        } else {
            return false;
        }
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

    override destroy(actor: Actor): void {
        removeCarrier(actor);
    }
}
