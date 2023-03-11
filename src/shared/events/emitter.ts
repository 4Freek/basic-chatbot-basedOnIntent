import { EventEmitter } from "node:events"

class Emitter {
    private emitter = new EventEmitter();

    emit(event: string, ...args: any[]): void {
        this.emitter.emit(event, ...args);
    }

    on(event: string, cb: (...args: any[]) => void): void {
        this.emitter.on(event, cb)
    }
}

export const emitter = new Emitter();