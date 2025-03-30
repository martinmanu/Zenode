export declare class EventManager {
    private eventListeners;
    on(eventType: string, callback: (event: any) => void): void;
    trigger(eventType: string, event: any): void;
}
