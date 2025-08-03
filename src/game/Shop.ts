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
const FLASH_MS = 200;
const FLASH_COUNT = 3;

async function waitMS(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

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
        actor.addBehaviour(new Container(Infinity)).onItem = (item) => {
            if (this.current[item] < this.costs[item]) {
                this.current[item]++;
            }

            if (
                this.current.every((cost, index) => cost >= this.costs[index])
            ) {
                this.complete(actor);
            }
        };
    }

    private async complete(actor: Actor) {
        actor.animator?.joinCycle(this.current.join(","));
        for (let i = 0; i < FLASH_COUNT; i++) {
            await waitMS(FLASH_MS);
            actor.animator?.joinCycle("0,0,0");
            await waitMS(FLASH_MS);
            actor.animator?.joinCycle(this.current.join(","));
        }
        this.current = [0, 0, 0];
        this.createItem(
            actor.position.translation.add(new Vec3(0, 0, 1)),
        );
    }

    override render(actor: Actor, _time: Time): void {
        if (!actor.animator) return;
        if (this.current.every((count, index) => count >= this.costs[index])) {
            // This allows the complete animation
            return;
        }
        const cycleName = this.current.join(",");
        if (cycleName in conveyorShopAnimStates.cycles) {
            actor.animator.joinCycle(cycleName);
        }
    }
}

const conveyorShopSprites = await loadSpritesheet(
    "/static/Shop_Con.png",
    new Vec2(192, 192),
    new Vec2(192 / 2, 192),
);
const splitterShopSprites = await loadSpritesheet(
    "/static/Shop_Spl.png",
    new Vec2(192, 192),
    new Vec2(192 / 2, 192),
);
const drillShopSprites = await loadSpritesheet(
    "/static/Shop_Dri.png",
    new Vec2(192, 192),
    new Vec2(192 / 2, 192),
);

export const conveyorShopAnimStates: AnimationStates = {
    cycles: {
        idle: {
            spriteSheet: conveyorShopSprites,
            indexes: [0],
            looping: true,
        },
        "0,0,0": {
            spriteSheet: conveyorShopSprites,
            indexes: [0],
            looping: true,
        },
        "1,0,0": {
            spriteSheet: conveyorShopSprites,
            indexes: [1],
            looping: true,
        },
        "2,0,0": {
            spriteSheet: conveyorShopSprites,
            indexes: [2],
            looping: true,
        },
        "0,1,0": {
            spriteSheet: conveyorShopSprites,
            indexes: [3],
            looping: true,
        },
        "1,1,0": {
            spriteSheet: conveyorShopSprites,
            indexes: [4],
            looping: true,
        },
        "2,1,0": {
            spriteSheet: conveyorShopSprites,
            indexes: [5],
            looping: true,
        },
    },
};

export const splitterShopAnimStates: AnimationStates = {
    cycles: {
        idle: {
            spriteSheet: splitterShopSprites,
            indexes: [0],
            looping: true,
        },
        "0,0,0": {
            spriteSheet: splitterShopSprites,
            indexes: [0],
            looping: true,
        },
        "1,0,0": {
            spriteSheet: splitterShopSprites,
            indexes: [4],
            looping: true,
        },
        "2,0,0": {
            spriteSheet: splitterShopSprites,
            indexes: [8],
            looping: true,
        },
        "0,1,0": {
            spriteSheet: splitterShopSprites,
            indexes: [2],
            looping: true,
        },
        "1,1,0": {
            spriteSheet: splitterShopSprites,
            indexes: [6],
            looping: true,
        },
        "2,1,0": {
            spriteSheet: splitterShopSprites,
            indexes: [10],
            looping: true,
        },
        "0,0,1": {
            spriteSheet: splitterShopSprites,
            indexes: [1],
            looping: true,
        },
        "1,0,1": {
            spriteSheet: splitterShopSprites,
            indexes: [5],
            looping: true,
        },
        "2,0,1": {
            spriteSheet: splitterShopSprites,
            indexes: [9],
            looping: true,
        },
        "2,1,1": {
            spriteSheet: splitterShopSprites,
            indexes: [11],
            looping: true,
        },
    },
};

export const drillShopAnimStates: AnimationStates = {
    cycles: {
        idle: {
            spriteSheet: drillShopSprites,
            indexes: [0],
            looping: true,
        },
        "0,0,0": {
            spriteSheet: drillShopSprites,
            indexes: [0],
            looping: true,
        },
        "0,1,0": {
            spriteSheet: drillShopSprites,
            indexes: [1],
            looping: true,
        },
        "0,2,0": {
            spriteSheet: drillShopSprites,
            indexes: [2],
            looping: true,
        },
        "0,0,1": {
            spriteSheet: drillShopSprites,
            indexes: [3],
            looping: true,
        },
        "0,1,1": {
            spriteSheet: drillShopSprites,
            indexes: [4],
            looping: true,
        },
        "0,2,1": {
            spriteSheet: drillShopSprites,
            indexes: [5],
            looping: true,
        },
        "0,0,2": {
            spriteSheet: drillShopSprites,
            indexes: [6],
            looping: true,
        },
        "0,1,2": {
            spriteSheet: drillShopSprites,
            indexes: [7],
            looping: true,
        },
        "0,2,2": {
            spriteSheet: drillShopSprites,
            indexes: [8],
            looping: true,
        },
        "0,0,3": {
            spriteSheet: drillShopSprites,
            indexes: [9],
            looping: true,
        },
        "0,1,3": {
            spriteSheet: drillShopSprites,
            indexes: [10],
            looping: true,
        },
        "0,2,3": {
            spriteSheet: drillShopSprites,
            indexes: [11],
            looping: true,
        },
    },
};
