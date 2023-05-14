/**
 * Clock class to handle a simple game loop.
 */
export class Clock {

    constructor() {
        this.events = {};
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

    on(event, callback) {
        if (!this.events[event])
            this.events[event] = [];
        this.events[event].push(callback);
    }

    emit(event) {
        const events = this.events[event];
        if (events)
            events.forEach((event) => event());
    }
}
