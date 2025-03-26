export declare class ZenodeEngine {
    container: HTMLElement | null;
    private config;
    private shapes;
    private connections;
    constructor(container: HTMLElement | null, config: any);
    initialize(): void;
    createShape(type: string, x: number, y: number, name?: string): void;
    createConnection(from: string, to: string): void;
}
export declare function initializeCanvas(): {
    canvas: string;
} | undefined;
export declare function createShape(type: string, x: number, y: number, name?: string): void;
