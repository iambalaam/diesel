const UPDATE_HZ = 60;
const UPDATE_MS = 1000 / UPDATE_HZ;

export type MS = number;
export interface Time {
    deltaTime: MS;
    time: MS;
}

export class Engine {
    #ctx: CanvasRenderingContext2D;
    #onRender: (_ctx: CanvasRenderingContext2D, _time: Time) => void;
    #onUpdate: (_time: Time) => void;

    #quit = false;
    #rAFId = 0;
    #prevRAFMS = 0;
    #prevUpdateMS = 0;

    constructor(
        ctx: CanvasRenderingContext2D,
        onRender = (_ctx: CanvasRenderingContext2D, _time: Time) => {},
        onUpdate = (_time: Time) => {},
    ) {
        this.#ctx = ctx;
        this.#onRender = onRender;
        this.#onUpdate = onUpdate;

        this.#rAF(0);
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
                this.#onUpdate({ time: ms, deltaTime: UPDATE_HZ });

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

            this.#onRender(this.#ctx, { time: ms, deltaTime: timeDelta });
        } catch (e) {
            console.error(e);
            this.#quit = true;
        }
    };
}
