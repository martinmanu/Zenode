export declare class ZenodeEngine {
    container: HTMLElement | null;
    private config;
    svg: any;
    private grid;
    private elements;
    private shapes;
    private connections;
    canvasObject: {
        svg: any;
        grid: any;
        elements: any;
    };
    constructor(container: HTMLElement | null, config: any);
    initializeCanvas(): void;
    createShape(type: string, x: number, y: number, name?: string): void;
    createConnection(from: string, to: string): void;
}
export declare function initializeCanvas(): {
    canvas: string;
} | undefined;
export declare function createShape(type: string, x: number, y: number, name?: string): void;
