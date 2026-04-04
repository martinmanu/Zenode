class EventManager {
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
    // Remove a callback for an event type
    off(eventType, callback) {
        if (!this.listeners[eventType])
            return;
        this.listeners[eventType] = this.listeners[eventType].filter(l => l !== callback);
    }
}

export { EventManager };
//# sourceMappingURL=eventManager.js.map
