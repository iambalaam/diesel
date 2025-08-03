import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Actor } from "../engine/Actor.ts";

export type Item = Actor | { spriteIndex: number };

export class World {
    grid: Item[][][];
    constructor(public size: Vec2) {
        this.grid = new Array(size.x).fill(0).map(() =>
            new Array(size.y).fill(0).map(() => {
                const zArray = [];
                zArray[-1] = { spriteIndex: 0 };
                return zArray;
            })
        );
    }

    getResource(position: Vec3) {
    }

    isInsideWorld(v: Vec3) {
        return v.x >= 0 && v.x < this.size.x && v.y >= 0 && v.y < this.size.y;
    }

    addItem(position: Vec3, block: Item) {
        if (!this.isInsideWorld(position)) return;

        this.grid[position.x][position.y][position.z] = block;
    }

    removeItem(position: Vec3) {
        if (!this.isInsideWorld(position)) return;

        delete this.grid[position.x][position.y][position.z];
    }

    getItem(v: Vec3) {
        return this.grid[v.x]?.[v.y]?.[v.z];
    }
}
