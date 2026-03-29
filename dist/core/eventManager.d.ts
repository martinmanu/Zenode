export declare class EventManager {
    private listeners;
    on(eventType: string, callback: (event: any) => void): void;
    trigger(eventType: string, event: any): void;
}
