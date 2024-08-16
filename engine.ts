const canvas = document.getElementsByTagName("canvas")[0];

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const UPDATE_HZ = 60;
const UPDATE_MS = 1000 / UPDATE_HZ;
const SPRITE_FPS = 60;
const SPRITE_UPDATE_MS = 1000 / SPRITE_FPS;
const SPRITE_SIZE = 64;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext("2d")!;

const img = new Image();
let imgLoaded = false;
img.onload = function () {
    console.log("loaded");
    imgLoaded = true;
};
img.src = "./earth.png";

let spriteUpdate = 0;
let spriteIndex = 0;

function getSpriteCoords(index: number) {
    return [
        (index % 16) * SPRITE_SIZE,
        Math.floor((index % 256) / 16) * SPRITE_SIZE,
    ];
}

type MS = number;
interface Time {
    deltaTime: MS;
    time: MS;
}

function render(time: Time) {
    if (!imgLoaded) return;
    spriteUpdate += time.deltaTime;
    if (spriteUpdate >= SPRITE_UPDATE_MS) {
        spriteUpdate = spriteUpdate % SPRITE_UPDATE_MS;
        spriteIndex++;
        const [x, y] = getSpriteCoords(spriteIndex);
        ctx.drawImage(
            img,
            x,
            y,
            SPRITE_SIZE,
            SPRITE_SIZE,
            0,
            0,
            SPRITE_SIZE,
            SPRITE_SIZE,
        );
    }
}

function update(_time: Time) {
    // Fixed physics update
}

let rAFId = 0;
let quit = false;
let prevRAF: number | undefined = undefined;
let prevUpdate: number | undefined = undefined;
function rAF(ms: number) {
    try {
        // Set up
        if (quit) {
            self.cancelAnimationFrame(rAFId);
            return;
        } else {
            rAFId = self.requestAnimationFrame(rAF);
        }
        if (prevRAF === undefined || prevUpdate === undefined) {
            prevRAF = ms;
            prevUpdate = ms;
            return;
        }

        // Physics + simulation
        const beforeUpdates = Date.now();
        let updateCount = 0;
        while (prevUpdate < prevRAF) {
            prevUpdate += UPDATE_MS;
            updateCount++;
            update({ time: ms, deltaTime: UPDATE_HZ });

            // Avoid infinite loop
            if (updateCount > 2) {
                const avgUpdateMs = (Date.now() - beforeUpdates) / updateCount;
                if (avgUpdateMs > UPDATE_MS) {
                    throw new Error(
                        "Cannot perform game loop in allotted time;",
                    );
                }
            }
        }

        // Rendering
        const timeDelta = ms - prevRAF;
        prevRAF = ms;

        render({ time: ms, deltaTime: timeDelta });
    } catch (e) {
        console.error(e);
        quit = true;
    }
}

rAF(0);
