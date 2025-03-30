export class EventManager {
    constructor() {
        this.eventListeners = {};
    }
    // Register a callback for an event
    on(eventType, callback) {
        if (!this.eventListeners[eventType]) {
            this.eventListeners[eventType] = [];
        }
        this.eventListeners[eventType].push(callback);
    }
    // Trigger event (called internally)
    trigger(eventType, event) {
        if (this.eventListeners[eventType]) {
            this.eventListeners[eventType].forEach(callback => callback(event));
        }
    }
}
//# sourceMappingURL=eventManager.js.map