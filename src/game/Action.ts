import { Actor, Position, ZERO_POSITION } from "../engine/Actor.ts";
import { SPRITE_MS } from "../engine/Animator.ts";
import { MS, Time } from "../engine/Engine.ts";
import { Vec3 } from "../engine/Vec3.ts";
import { getPosPrefix } from "../game/PlayerController.ts";

export abstract class Action {
    startTime: MS = 0;
    endTime: MS = 0;
    start: Position = ZERO_POSITION;
    current: Position = ZERO_POSITION;
    target: Position = ZERO_POSITION;

    abstract get duration(): number;
    startAction(start: Position, end: Position, actor: Actor, time: Time) {
        this.startTime = time.time;
        this.endTime = this.startTime + this.duration;
        this.start = {
            translation: start.translation.clone(),
            forwards: start.forwards.clone(),
            down: start.down.clone(),
        };
        this.current = {
            translation: start.translation.clone(),
            forwards: start.forwards.clone(),
            down: start.down.clone(),
        };
        this.target = {
            translation: end.translation.clone(),
            forwards: end.forwards.clone(),
            down: end.down.clone(),
        };
    }
    updateAction(actor: Actor, time: Time) {
        // Only lerp translation
        const timeElapsed = time.time - this.startTime;
        const totalDist: Vec3 = this.target.translation.subtract(
            this.start.translation,
        );
        const timeFraction = timeElapsed / this.duration;
        const currentDist = totalDist.scale(timeFraction);
        actor.position.translation = this.start.translation.add(currentDist);
    }
    finishAction(actor: Actor, time: Time) {
        actor.position.translation = this.target.translation.round();
        actor.position.forwards = this.target.forwards.round();
        actor.position.down = this.target.down.round();
    }
}

export class Walk extends Action {
    get duration() {
        return SPRITE_MS * 20;
    }
    startAction(
        start: Position,
        end: Position,
        actor: Actor,
        time: Time,
    ): void {
        this.startTime = time.time;
        this.endTime = time.time + this.duration;
        this.start = {
            translation: start.translation.clone(),
            forwards: start.forwards.clone(),
            down: start.down.clone(),
        };
        this.current = {
            translation: start.translation.clone(),
            forwards: start.forwards.clone(),
            down: start.down.clone(),
        };
        this.target = {
            translation: end.translation.clone(),
            forwards: end.forwards.clone(),
            down: end.down.clone(),
        };
        actor.position.forwards = start.forwards;
    }
}

export class Jump extends Action {
    get duration() {
        return SPRITE_MS * 28;
    }
    startAction(
        start: Position,
        end: Position,
        actor: Actor,
        time: Time,
    ): void {
        this.startTime = time.time;
        this.endTime = time.time + this.duration;
        this.start = {
            translation: start.translation.clone(),
            forwards: start.forwards.clone(),
            down: start.down.clone(),
        };
        this.current = {
            translation: start.translation.clone(),
            forwards: start.forwards.clone(),
            down: start.down.clone(),
        };
        this.target = {
            translation: end.translation.clone(),
            forwards: end.forwards.clone(),
            down: end.down.clone(),
        };
        actor.position.forwards = start.forwards;
    }
}

export class ClimbUp extends Action {
    get duration() {
        return SPRITE_MS * 36;
    }
    startAction(
        start: Position,
        end: Position,
        actor: Actor,
        time: Time,
    ): void {
        this.startTime = time.time;
        this.endTime = time.time + this.duration;
        this.start = {
            translation: start.translation.clone(),
            forwards: start.forwards.clone(),
            down: start.down.clone(),
        };
        this.current = {
            translation: start.translation.clone(),
            forwards: start.forwards.clone(),
            down: start.down.clone(),
        };
        this.target = {
            translation: start.translation.clone(),
            forwards: end.forwards.clone(),
            down: end.down.clone(),
        };
        actor.position.forwards = start.forwards;
    }
}
