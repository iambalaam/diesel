import { Vec2 } from "./Vec2.ts";
import { Vec3 } from "./Vec3.ts";

// TODO Fix hard-code
const bottom = new Vec2(1280 / 2, 720);

const worldXDir = new Vec2(96, -48);
const worldYDir = new Vec2(-96, -48);
const worldZDir = new Vec2(0, -96);

const screenXDir = new Vec3(1 / 192, -1 / 192, 0);
const screenYDir = new Vec3(-1 / 96, -1 / 96, 0);

export function worldToScreen(world: Vec3): Vec2 {
    return bottom
        .add(worldXDir.scale(world.x))
        .add(worldYDir.scale(world.y))
        .add(worldZDir.scale(world.z));
}

/**
 * Screenspace is 2D, so really there will be a ray of possibilities
 * This function will return the intersection with that ray and z=0;
 */
export function screen2World(screen: Vec2): Vec3 {
    const { x: screenX, y: screenY } = screen.subtract(bottom);
    return Vec3.Zero
        .add(screenXDir.scale(screenX))
        .add(screenYDir.scale(screenY));
}
