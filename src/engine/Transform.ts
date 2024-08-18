import { Vec2 } from "./Vec2.ts";
import { Vec3 } from "./Vec3.ts";

let center = new Vec2(self.innerWidth / 2, self.innerHeight / 2);
self.addEventListener("resize", () => {
    center = new Vec2(self.innerWidth / 2, self.innerHeight / 2);
});

const xDir = new Vec2(32, -16);
const yDir = new Vec2(-32, -16);
const zDir = new Vec2(0, -32);

export function worldToScreen(world: Vec3): Vec2 {
    return center
        .add(xDir.scale(world.x))
        .add(yDir.scale(world.y))
        .add(zDir.scale(world.z));
}
