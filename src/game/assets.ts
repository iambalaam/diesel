import { Spritesheet } from "../engine/Spritesheet.ts";
import { Vec2 } from "../engine/Vec2.ts";

export async function loadSpritesheet(
    url: string,
    spriteSize: Vec2,
    spriteAnchor: Vec2,
): Promise<Spritesheet> {
    const img = new Image();
    img.src = url;
    const loadingPromise = new Promise((res, rej) => {
        img.addEventListener("load", res);
        img.addEventListener("load", rej);
    });
    await loadingPromise;
    const sheet = new Spritesheet(img, {
        direction: "rows",
        spriteSize,
        spriteAnchor,
    });
    return sheet;
}
