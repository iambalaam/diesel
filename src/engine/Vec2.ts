export class Vec2 {
    constructor(public x: number, public y: number) {}

    static get Zero() {
        return new Vec2(0, 0);
    }

    clone() {
        return new Vec2(this.x, this.y);
    }

    equals(vec2: Vec2) {
        return this.x === vec2.x && this.y === vec2.y;
    }

    add(vec2: Vec2) {
        return new Vec2(this.x + vec2.x, this.y + vec2.y);
    }

    subtract(vec2: Vec2) {
        return new Vec2(this.x - vec2.x, this.y - vec2.y);
    }

    sqrMag() {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2);
    }

    mag() {
        return Math.sqrt(this.sqrMag());
    }

    scale(s: number) {
        return new Vec2(this.x * s, this.y * s);
    }

    dot(vec2: Vec2) {
        return this.x * vec2.x + this.y * vec2.y;
    }

    toString() {
        return `V2(${this.x}, ${this.y})`;
    }

    round() {
        return new Vec2(
            Math.round(this.x),
            Math.round(this.y),
        );
    }

    floor() {
        return new Vec2(
            Math.floor(this.x),
            Math.floor(this.y),
        );
    }
}
