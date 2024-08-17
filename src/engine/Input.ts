self.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    if (key in Input) {
        // @ts-ignore
        Input[key] = true;
    }
});

self.addEventListener("keyup", (e) => {
    const key = e.key.toUpperCase();
    if (key in Input) {
        // @ts-ignore
        Input[key] = false;
    }
});

export const Input = {
    W: false,
    A: false,
    S: false,
    D: false,
};
