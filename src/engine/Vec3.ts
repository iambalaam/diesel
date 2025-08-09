export class Vec3 {
    constructor(public x: number, public y: number, public z: number) {}

    static get Zero() {
        return new Vec3(0, 0, 0);
    }

    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    equals(vec3: Vec3) {
        return this.x === vec3.x && this.y === vec3.y && this.z === vec3.z;
    }

    add(vec3: Vec3) {
        return new Vec3(this.x + vec3.x, this.y + vec3.y, this.z + vec3.z);
    }

    subtract(vec3: Vec3) {
        return new Vec3(this.x - vec3.x, this.y - vec3.y, this.z - vec3.z);
    }

    sqrMag() {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2);
    }

    mag() {
        return Math.sqrt(this.sqrMag());
    }

    scale(s: number) {
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }

    dot(vec3: Vec3) {
        return this.x * vec3.x + this.y * vec3.y + this.z * vec3.z;
    }

    toString() {
        return `V3(${this.x}, ${this.y}, ${this.z})`;
    }

    round() {
        return new Vec3(
            Math.round(this.x),
            Math.round(this.y),
            Math.round(this.z),
        );
    }

    floor() {
        return new Vec3(
            Math.floor(this.x),
            Math.floor(this.y),
            Math.floor(this.z),
        );
    }
}
