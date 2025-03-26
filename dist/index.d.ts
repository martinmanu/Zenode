/**
 * Initializes the Zenode engine.
 * @param containerSelector The selector for the container element.
 * @param userConfig Optional custom configuration.
 * @throws Error if container is not found.
 */
export declare function initializeCanvas(containerSelector: string, userConfig?: {}): void;
/**
 * Creates a shape dynamically on the canvas.
 * @param type Shape type (e.g., "rectangle", "circle").
 * @param x X-coordinate.
 * @param y Y-coordinate.
 * @param name Optional shape name.
 * @throws Error if engine is not initialized or parameters are invalid.
 */
export declare function createShape(type: string, x: number, y: number, name?: string): void;
/**
 * Creates a connection between two shapes.
 * @param from The ID or name of the first shape.
 * @param to The ID or name of the second shape.
 * @throws Error if engine is not initialized or shapes are missing.
 */
export declare function createConnection(from: string, to: string): void;
