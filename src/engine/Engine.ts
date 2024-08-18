import { Actor } from "./Actor.ts";
import { pollCurrentGamepad } from "./Input.ts";

const UPDATE_HZ = 60;
const UPDATE_MS = 1000 / UPDATE_HZ;
export const DEBUG = new URL(self.location.href).searchParams.has("debug");

export type MS = number;
export interface Time {
    deltaTime: MS;
    time: MS;
}

export interface Hooks {
    onInit: (engine: Engine, time: Time) => void;
    onEarlyRender: (engine: Engine, time: Time) => void;
    onRender: (engine: Engine, time: Time) => void;
    onUpdate: (engine: Engine, time: Time) => void;
}

export class Engine {
    ctx: CanvasRenderingContext2D;
    #hooks: Hooks = {
        onInit: (_engine: Engine) => {},
        onEarlyRender: (_engine: Engine, _time: Time) => {},
        onRender: (_engine: Engine, _time: Time) => {},
        onUpdate: (_engine: Engine, _time: Time) => {},
    };

    #quit = false;
    #rAFId = 0;
    #prevRAFMS = 0;
    #prevUpdateMS = 0;

    #actors: Actor[] = [];

    constructor(
        ctx: CanvasRenderingContext2D,
        hooks: Partial<Hooks>,
    ) {
        this.ctx = ctx;
        this.#hooks = { ...this.#hooks, ...hooks };

        const initTime: Time = { time: 0, deltaTime: 0 };
        this.#hooks.onInit(this, initTime);
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
                pollCurrentGamepad();
                this.#hooks.onUpdate(this, updateTime);
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

            const renderTime = { time: ms, deltaTime: timeDelta };
            this.#hooks.onEarlyRender(this, renderTime);
            this.#hooks.onRender(this, renderTime);
            this.#actorRender(this, renderTime);
        } catch (e) {
            console.error(e);
            this.#quit = true;
        }
    };
}
