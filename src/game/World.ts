import { Vec2 } from "../engine/Vec2.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { Actor } from "../engine/Actor.ts";
import { ConveyorItem } from "./Conveyor.ts";
import { getContainerAt } from "./Container.ts";

export type Item = Actor | { spriteIndex: number };

const randomNum = (max: number) => Math.floor(Math.random() * max);

export function getRandomEmptyLocation(size: Vec2): Vec3 {
    let pos;
    do {
        pos = new Vec3(randomNum(size.x), randomNum(size.y), 0);
    } while (getContainerAt(pos) !== undefined);
    return pos;
}

function generateRandomLocations(size: Vec2): [Vec2, Vec2, Vec2] {
    let first: Vec2;
    let second: Vec2;
    let third: Vec2;
    do {
        first = new Vec2(randomNum(size.x), randomNum(size.y));
    } while (first.x > 1);
    do {
        second = new Vec2(randomNum(size.x), randomNum(size.y));
    } while (
        (second.x > 1) ||
        (first.x === second.x && first.y === second.y)
    );
    do {
        third = new Vec2(randomNum(size.x), randomNum(size.y));
    } while (
        (third.x > 1) ||
        (first.x === third.x && first.y === third.y) ||
        (second.x === third.x && second.y === third.y)
    );
    return [first, second, third];
}

export class World {
    grid: Item[][][];
    halfCoal: Vec2;
    halfGold: Vec2;
    halfSteel: Vec2;
    constructor(public size: Vec2) {
        this.grid = new Array(size.x).fill(0).map(() =>
            new Array(size.y).fill(0).map(() => {
                const zArray = [];
                zArray[-1] = { spriteIndex: 0 };
                return zArray;
            })
        );

        const halfGridSize = size.scale(0.5).floor();
        const [coal, gold, steel] = generateRandomLocations(halfGridSize);
        this.halfCoal = coal;
        this.halfGold = gold;
        this.halfSteel = steel;
    }

    getResource(pos: Vec3): ConveyorItem | undefined {
        const halfSize = pos.scale(0.5).floor();
        if (
            halfSize.x === this.halfCoal.x && halfSize.y === this.halfCoal.y
        ) return 0;
        if (halfSize.x === this.halfGold.x && halfSize.y === this.halfGold.y) {
            return 1;
        }
        if (
            halfSize.x === this.halfSteel.x && halfSize.y === this.halfSteel.y
        ) return 2;
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
