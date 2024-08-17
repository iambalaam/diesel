import { Actor } from "./Actor.ts";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./main.ts";

const UPDATE_HZ = 60;
const UPDATE_MS = 1000 / UPDATE_HZ;

export type MS = number;
export interface Time {
    deltaTime: MS;
    time: MS;
}

export class Engine {
    ctx: CanvasRenderingContext2D;
    #onRender: (engine: Engine, time: Time) => void;
    #onUpdate: (engine: Engine, time: Time) => void;

    #quit = false;
    #rAFId = 0;
    #prevRAFMS = 0;
    #prevUpdateMS = 0;

    #actors: Actor[] = [];

    constructor(
        ctx: CanvasRenderingContext2D,
        onRender = (_engine: Engine, _time: Time) => {},
        onUpdate = (_engine: Engine, _time: Time) => {},
    ) {
        this.ctx = ctx;
        this.#onRender = onRender;
        this.#onUpdate = onUpdate;

        this.#rAF(0);
    }

    createActor(name: string) {
        const actor = new Actor(name);
        this.#actors.push(actor);
        return actor;
    }

    #actorRender(_engine: Engine, time: Time) {
        for (const actor of this.#actors) {
            actor.render(time);
        }
    }

    #actorUpdate(_engine: Engine, time: Time) {
        for (const actor of this.#actors) {
            actor.update(time);
        }
    }

    #rAF = (ms: number) => {
        try {
            // Set up
            if (this.#quit) {
                self.cancelAnimationFrame(this.#rAFId);
                return;
            } else {
                this.#rAFId = self.requestAnimationFrame(this.#rAF);
            }
            if (
                this.#prevRAFMS === undefined ||
                this.#prevUpdateMS === undefined
            ) {
                this.#prevRAFMS = ms;
                this.#prevUpdateMS = ms;
                return;
            }

            // Physics + simulation
            const beforeUpdates = Date.now();
            let updateCount = 0;
            while (this.#prevUpdateMS < this.#prevRAFMS) {
                this.#prevUpdateMS += UPDATE_MS;
                updateCount++;
                const updateTime = { time: ms, deltaTime: UPDATE_HZ };
                this.#onUpdate(this, updateTime);
                this.#actorUpdate(this, updateTime);

                // Avoid infinite loop
                if (updateCount > 2) {
                    const avgUpdateMs = (Date.now() - beforeUpdates) /
                        updateCount;
                    if (avgUpdateMs > UPDATE_MS) {
                        throw new Error(
                            "Cannot perform game loop in allotted time;",
                        );
                    }
                }
            }

            // Rendering
            const timeDelta = ms - this.#prevRAFMS;
            this.#prevRAFMS = ms;

            // Background
            this.ctx.fillStyle = "grey";
            this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            const renderTime = { time: ms, deltaTime: timeDelta };
            this.#onRender(this, renderTime);
            this.#actorRender(this, renderTime);
        } catch (e) {
            console.error(e);
            this.#quit = true;
        }
    };
}
