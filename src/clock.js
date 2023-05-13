class EventEmitter {

    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    remove(event, listener) {
        if (this.events[event]) {
            const index = this.events[event].indexOf(listener);
            if (~index) {
                this.events[event].splice(index, 1);
            }
        }
    }

    emit(event) {
        const events = this.events[event];
        if (events) {
            events.forEach((event) => event());
        }
    }
}

/**
 * Clock class to handle a simple game loop.
 */
export class Clock extends EventEmitter {

    constructor() {
        super();
        this.isRunning = true;

        this.tick = this.tick.bind(this);
        this.tick();

        window.onblur = () => {
            this.stop();
        };

        window.onfocus = () => {
            this.start();
        };
    }

    tick() {
        if (this.isRunning) {
            this.emit('tick');
        }
        requestAnimationFrame(this.tick);
    }

    start() {
        this.isRunning = true;
    }

    stop() {
        this.isRunning = false;
    }
}
