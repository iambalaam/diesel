import { Actor } from "../engine/Actor.ts";
import { AnimationStates } from "../engine/Animator.ts";
import { Vec2 } from "../engine/Vec2.ts";
import { loadSpritesheet } from "./assets.ts";
import { Shop } from "./Shop.ts";

export class FinalShop extends Shop {
    totalGameTime: number = 0;
    constructor() {
        super([0, 50, 0], () => {
            alert(
                `Congrats! You won in ${
                    (this.totalGameTime / 1000).toFixed(2)
                }s`,
            );
        });
    }

    // override init(actor: Actor): void {
    //     actor.renderer?.render();
    // }
}

const finalShopSprites = await loadSpritesheet(
    "/static/Final_Shop.png",
    new Vec2(192, 192),
    new Vec2(192 / 2, 192),
);

export const finalShopAnimStates: AnimationStates = {
    cycles: {
        idle: {
            spriteSheet: finalShopSprites,
            indexes: [0],
            looping: true,
        },
        "0,0,0": {
            spriteSheet: finalShopSprites,
            indexes: [0],
            looping: true,
        },
    },
};
