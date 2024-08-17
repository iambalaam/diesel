import { Component } from "./Component.ts";

export class Position extends Component {
    constructor(public x: number, public y: number) {
        super();
    }
}
