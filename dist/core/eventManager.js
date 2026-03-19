export class EventManager {
    constructor() {
        this.listeners = {};
    }
    // Register a callback for an event type (e.g., "zoom", "shapePlaced", etc.)
    on(eventType, callback) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        this.listeners[eventType].push(callback);
    }
    // Trigger an event and call all callbacks registered for that event type
    trigger(eventType, event) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach(callback => callback(event));
        }
    }
}
//# sourceMappingURL=eventManager.js.map