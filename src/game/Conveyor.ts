import { Actor } from "../engine/Actor.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Spritesheet } from "../engine/Spritesheet.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { World } from "./World.ts";

const ALL_CONVEYORS: Actor[] = [];

function getConveyorAt(pos: Vec2) {
    return ALL_CONVEYORS.find((c) =>
        pos.x === c.position.translation.x && pos.y === c.position.translation.y
    );
}

const CONVEYOR_SPEED = 0.00018;

export type ConveyorItem = 0 | 1;

export class Conveyor extends Behaviour {
    private currentProgress = 0;
    private currentItem?: ConveyorItem = undefined;

    constructor(private conveyorItems: Spritesheet, private world: World) {
        super();
    }

    override init(actor: Actor): void {
        ALL_CONVEYORS.push(actor);
    }

    override update(actor: Actor, time: Time): void {
        const { position: pos } = actor;
        if (this.currentItem !== undefined) {
            this.currentProgress += CONVEYOR_SPEED * time.deltaTime;

            if (this.currentProgress >= 1) {
                const next = getConveyorAt(pos.translation.add(pos.forwards));
                if (next instanceof Actor) {
                    console.log("ACTOR");

                    const nextConveyor = next.getBehaviour(Conveyor);
                    if (nextConveyor) {
                        console.log("NEXT");
                        if (nextConveyor.currentItem === undefined) {
                            nextConveyor.setItem(this.currentItem);
                            this.currentItem = undefined;
                        } else {
                            this.currentProgress = 1;
                        }
                    }
                }
            }
        } else {
            this.currentProgress = 0;
        }
    }

    override render(actor: Actor, _time: Time): void {
        const { renderer, position } = actor;
        if (this.currentItem !== undefined && renderer) {
            renderer.renderSprite(
                this.conveyorItems,
                this.currentItem,
                position.translation
                    .add(position.forwards.scale(this.currentProgress))
                    .add(new Vec3(0, 0, 0.3)),
            );
        }
    }

    setItem(item: ConveyorItem) {
        if (this.currentItem !== undefined) return false;
        this.currentProgress = 0;
        this.currentItem = item;
        return true;
    }
}
