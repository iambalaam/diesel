import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { ConveyorItem } from "./Conveyor.ts";

const MAX_REQUEST_TIME = 5_000;
export const ALL_CONTAINERS: Actor[] = [];

export function getContainerAt(pos: Vec2) {
    return ALL_CONTAINERS.find((c) =>
        pos.x === c.position.translation.x && pos.y === c.position.translation.y
    );
}
export function addContainer(actor: Actor) {
    ALL_CONTAINERS.push(actor);
}
export function removeContainer(actor: Actor) {
    const thisIndex = ALL_CONTAINERS.findIndex((c) => c === actor);
    ALL_CONTAINERS.splice(thisIndex, 1);
}

export class Container extends Behaviour {
    items: ConveyorItem[] = [];
    requests: Time[] = [];
    public onItem: (item: ConveyorItem) => void = () => {};

    constructor(private maxItems: number) {
        super();
    }

    override init(actor: Actor): void {
        addContainer(actor);
    }

    get isFull() {
        return this.items.length + this.requests.length >= this.maxItems;
    }

    requestSpace(time: Time): ((item: ConveyorItem) => void) | undefined {
        if (this.isFull) return;
        this.requests.push(time);
        return (item: ConveyorItem) => {
            this.items.push(item);
            this.requests = this.requests.filter((t) => t !== time);
            this.onItem(item);
        };
    }

    empty() {
        this.items = [];
        this.requests = [];
    }

    override update(_actor: Actor, time: Time): void {
        this.requests = this.requests.filter((t) =>
            time.time > t.time + MAX_REQUEST_TIME
        );
    }

    override destroy(actor: Actor): void {
        removeContainer(actor);
    }
}
