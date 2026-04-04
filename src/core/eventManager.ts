export class EventManager {
  private listeners: { [key: string]: ((event: any) => void)[] } = {};

  // Register a callback for an event type (e.g., "zoom", "shapePlaced", etc.)
  on(eventType: string, callback: (event: any) => void) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  // Trigger an event and call all callbacks registered for that event type
  trigger(eventType: string, event: any) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(callback => callback(event));
    }
  }

  // Remove a callback for an event type
  off(eventType: string, callback: (event: any) => void) {
    if (!this.listeners[eventType]) return;
    this.listeners[eventType] = this.listeners[eventType].filter(l => l !== callback);
  }
}
