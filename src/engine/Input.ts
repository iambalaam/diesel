self.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    if (key in Input) {
        // @ts-ignore
        Input.Keyboard[key] = true;
    }
});

self.addEventListener("keyup", (e) => {
    const key = e.key.toUpperCase();
    if (key in Input) {
        // @ts-ignore
        Input.Keyboard[key] = false;
    }
});

// let currentGamepad = getCurrentGamepad();
// function getCurrentGamepad() {
//     const gamepads = self.navigator.getGamepads().filter(Boolean);
//     return gamepads[gamepads.length - 1];
// }
// self.addEventListener("gamepadconnected", () => {
//     currentGamepad = getCurrentGamepad();
// });
// self.addEventListener("gamepaddisconnected", () => {
//     currentGamepad = getCurrentGamepad();
// });

export function pollCurrentGamepad() {
    // Why is currentGamepad stale?
    const gamepads = self.navigator.getGamepads().filter(Boolean);
    const currentGamepad = gamepads[gamepads.length - 1];

    if (currentGamepad) {
        Input.Gamepad.axes = [...currentGamepad.axes];
        Input.Gamepad.buttons = currentGamepad.buttons.map((button) =>
            button.value
        );
    } else {
        Input.Gamepad.axes = [];
        Input.Gamepad.buttons = [];
    }
}

export const Input = {
    Keyboard: {
        W: false,
        A: false,
        S: false,
        D: false,
        " ": false,
    },
    Gamepad: {
        buttons: [] as readonly number[],
        axes: [] as readonly number[],
    },
};
