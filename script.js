const root = document.getElementById('root');

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const UPDATE_HZ = 60;
const UPDATE_MS = 1000 / UPDATE_HZ;

const canvas = document.createElement('canvas');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

function render(ms) {
    console.log('render', ms);
}

function update(ms) {
    const before = Date.now();
    const waitTime = 1 / Math.random();
    console.log('update', ms, waitTime);
    let count = 0;
    while (Date.now() < before + waitTime) {
        count++;
    }
}

let rAFId = undefined;
let quit = false;
let prevRAF = undefined;
let prevUpdate = undefined;
function rAF(ms) {
    try {
        // Set up
        if (quit) {
            window.cancelAnimationFrame(rAFId);
            return;
        } else {
            rAFId = window.requestAnimationFrame(rAF);
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
            update(UPDATE_MS);

            // Avoid infinite loop
            if (updateCount > 2) {
                const avgUpdateMs = (Date.now() - beforeUpdates) / updateCount;
                if (avgUpdateMs > UPDATE_MS) {
                    throw new Error('Cannot perform game loop in allotted time;');
                }
            }
        }

        // Rendering
        const timeDelta = ms - prevRAF;
        prevRAF = ms;

        render(timeDelta);

    } catch (e) {
        console.error(e);
        quit = true;
    }
}

rAF();


setTimeout(() => { quit = true }, 2000)
