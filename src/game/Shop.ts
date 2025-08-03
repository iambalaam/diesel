import { Actor } from "../engine/Actor.ts";
import { AnimationStates } from "../engine/Animator.ts";
import { Behaviour } from "../engine/Behaviour.ts";
import { Time } from "../engine/Engine.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { loadSpritesheet } from "./assets.ts";
import { Container } from "./Container.ts";
import { ALL_SHOPS } from "./Interactive.ts";

export type Costs = [number, number, number];

export class Shop extends Behaviour {
    current: Costs = [0, 0, 0];
    constructor(
        private costs: Costs,
        private createItem: (world: Vec3) => void,
    ) {
        super();
    }

    override init(actor: Actor) {
        ALL_SHOPS.push(actor);
        const totalCost = this.costs[0] + this.costs[1] + this.costs[2];
        actor.addBehaviour(new Container(Infinity)).onItem = (item) => {
            if (this.current[item] < this.costs[item]) {
                this.current[item]++;
            }

            if (
                this.current.every((cost, index) => cost >= this.costs[index])
            ) {
                this.current = [0, 0, 0];
                // SPAWN THING
            }
        };
    }

    override render(actor: Actor, _time: Time): void {
        if (!actor.animator) return;
        actor.animator.joinCycle(this.current.join(","));
    }
}

const shopSprites = await loadSpritesheet(
    "/static/Shop_Con.png",
    new Vec2(192, 192),
    new Vec2(192 / 2, 192),
);

export const shopAnimStates: AnimationStates = {
    cycles: {
        idle: {
            spriteSheet: shopSprites,
            indexes: [0],
            looping: true,
        },
        "0,0,0": {
            spriteSheet: shopSprites,
            indexes: [0],
            looping: true,
        },
        "1,0,0": {
            spriteSheet: shopSprites,
            indexes: [1],
            looping: true,
        },
        "2,0,0": {
            spriteSheet: shopSprites,
            indexes: [2],
            looping: true,
        },
        "0,1,0": {
            spriteSheet: shopSprites,
            indexes: [3],
            looping: true,
        },
        "1,1,0": {
            spriteSheet: shopSprites,
            indexes: [4],
            looping: true,
        },
        "2,1,0": {
            spriteSheet: shopSprites,
            indexes: [5],
            looping: true,
        },
    },
};
