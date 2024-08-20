import { Vec2 } from "./Vec2.ts";
import { Vec3 } from "./Vec3.ts";

// TODO Fix hard-code
const bottom = new Vec2(1280 / 2, 720);

const xDir = new Vec2(64, -32);
const yDir = new Vec2(-64, -32);
const zDir = new Vec2(0, -64);

export function worldToScreen(world: Vec3): Vec2 {
    return bottom
        .add(xDir.scale(world.x))
        .add(yDir.scale(world.y))
        .add(zDir.scale(world.z));
}
