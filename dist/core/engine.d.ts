import { Config } from "../model/configurationModel.js";
import { ZoomManager } from "./zoom&PanManager.js";
export declare class ZenodeEngine {
    container: HTMLElement | null;
    private config;
    svg: any;
    private grid;
    private alignmentLine;
    private elements;
    private zoomBehaviour;
    private shapes;
    private connections;
    private eventManager;
    zoomManager: ZoomManager;
    canvasObject: {
        svg: any;
        grid: any;
        elements: any;
        canvasContainer: any;
    };
    private canvasContainerGroup;
    constructor(container: HTMLElement | null, config: Config | {});
    initializeCanvas(): void;
    on(eventType: "zoom" | "zoomStart" | "zoomEnd", callback: (event: any) => void): void;
    /**
     * Creates a shape on the canvas.
     * @param type The type of shape ('rectangle' or 'circle').
     * @param x The x-coordinate.
     * @param y The y-coordinate.
     * @param name Optional name (used as an identifier).
     */
    createShape(type: string, x: number, y: number, name?: string): void;
    /**
     * Creates a connection between two shapes.
     * @param from The name of the first shape.
     * @param to The name of the second shape.
     */
    createConnection(from: string, to: string): void;
    lockedTheCanvas(locked: boolean): void;
    gridToggles(toggle: boolean): void;
}
export declare function initializeCanvas(container: HTMLElement | null, config: Config | {}): ZenodeEngine;
export declare function createShape(type: string, x: number, y: number, name?: string): void;
export declare function gridToggle(toggle: boolean): void;
export declare function lockCanvas(isLocked: boolean): void;
