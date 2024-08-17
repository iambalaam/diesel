import { SPRITE_MS, Spritesheet } from "./Spritesheet.ts";
import { Component } from "./Component.ts";
import { Engine, MS, Time } from "./Engine.ts";
import { Actor } from "./Actor.ts";

export type AnimationCycle = {
    spriteSheet: Spritesheet;
    indexes: number[];
    looping: boolean;
    end?: string;
};

export type AnimationStates = {
    cycles: { idle: AnimationCycle } & Record<string, AnimationCycle>;
};

export class Animator extends Component {
    #ctx: CanvasRenderingContext2D;
    #currentCycle: AnimationCycle;
    #currentCycleStart: MS;
    #states: AnimationStates;

    constructor(
        engine: Engine,
        time: Time,
        states: AnimationStates,
    ) {
        super();
        this.#ctx = engine.ctx;
        this.#currentCycle = states.cycles.idle;
        this.#currentCycleStart = time.time;
        this.#states = states;
    }

    start(name: string, time: Time) {
        const cycle = this.#states.cycles[name];
        if (!cycle) throw new Error(`No cycle: ${name}`);
        this.#currentCycle = cycle;
        // This keeps all animations in phase
        this.#currentCycleStart = time.time - (time.time % SPRITE_MS);
    }

    render(actor: Actor, time: Time) {
        let cycle = this.#currentCycle;
        const frameNumber = Math.floor(
            (time.time - this.#currentCycleStart) /
                SPRITE_MS,
        );

        let cycleIndex: number;
        if (!this.enabled) {
            // Stuck at start
            cycleIndex = 0;
        } else if (frameNumber < cycle.indexes.length) {
            cycleIndex = frameNumber;
        } else if (cycle.end) {
            // Go to next cycle
            this.start(cycle.end, time);
            cycleIndex = 0;
            cycle = this.#currentCycle;
        } else if (!cycle.looping) {
            // Stuck at end
            cycleIndex = cycle.indexes.length - 1;
        } else {
            // Cycling
            cycleIndex = frameNumber % cycle.indexes.length;
        }

        const index = this.#currentCycle.indexes[cycleIndex];
        cycle.spriteSheet.draw(
            this.#ctx,
            index,
            actor.position.x,
            actor.position.y,
            2,
        );
        return;
    }
}
