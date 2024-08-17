import { SPRITE_MS, Spritesheet } from "./Spritesheet.ts";
import { Component } from "./Component.ts";
import { MS, Time } from "./engine.ts";

export type AnimationCycle = {
    spriteSheet: Spritesheet;
    indexes: number[];
    looping: boolean;
};

export type AnimationStates = {
    cycles: { idle: AnimationCycle } & Record<string, AnimationCycle>;
};

export class Animator extends Component {
    #ctx: CanvasRenderingContext2D;
    #currentCycle: AnimationCycle;
    #currentCycleStart: MS;
    constructor(
        ctx: CanvasRenderingContext2D,
        time: Time,
        states: AnimationStates,
    ) {
        super();
        this.#ctx = ctx;
        this.#currentCycle = states.cycles.idle;
        this.#currentCycleStart = time.time;
    }

    update(time: Time) {
        const cycle = this.#currentCycle;
        const frameNumber = Math.floor(
            (time.time - this.#currentCycleStart) /
                SPRITE_MS,
        );

        let index: number;
        if (!this.enabled) {
            // Stuck at start
            index = 0;
        } else if (frameNumber > cycle.indexes.length && !cycle.looping) {
            // Stuck at end
            index = cycle.indexes.length - 1;
        } else {
            // Cycling
            index = frameNumber % cycle.indexes.length;
        }

        cycle.spriteSheet.draw(
            this.#ctx,
            index,
            0,
            0,
            4,
        );
        return;
    }
}
