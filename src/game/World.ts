import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";

export interface Block {
    spriteIndex: number;
    isClimbable: boolean;
}

export class World {
    grid: Block[][][];
    constructor(public size: Vec2) {
        this.grid = new Array(size.x).fill(0).map(() =>
            new Array(size.y).fill(0).map(() => {
                const zArray = [];
                zArray[-1] = { spriteIndex: 0, isClimbable: true };
                return zArray;
            })
        );
    }

    isInsideWorld(v: Vec3) {
        return v.x >= 0 && v.x < this.size.x && v.y >= 0 && v.y < this.size.y;
    }

    isClimbable(v: Vec3) {
        return this.grid[v.x][v.y][v.z].isClimbable;
    }

    addBlock(position: Vec3, block: Block) {
        if (!this.isInsideWorld(position)) return;

        this.grid[position.x][position.y][position.z] = block;
    }

    removeBlock(position: Vec3) {
        if (!this.isInsideWorld(position)) return;

        delete this.grid[position.x][position.y][position.z];
    }

    addBox(position: Vec3, size: Vec3, block: Block) {
        for (let x = 0; x < size.x; x++) {
            for (let y = 0; y < size.y; y++) {
                for (let z = 0; z < size.z; z++) {
                    this.addBlock(position.add(new Vec3(x, y, z)), block);
                }
            }
        }
    }

    hasBlock(v: Vec3) {
        return this.grid[v.x]?.[v.y]?.[v.z] !== undefined;
    }
}
