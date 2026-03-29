export declare function snapToGrid(x: number, y: number, grid: number): {
    x: number;
    y: number;
};
/**
 * Generates a unique shape ID based on type and existing shapes.
 */
export declare function generateShapeId(baseId: string, shapeMap: Map<unknown, unknown>): string;
/**
 * Generates a unique id for a placed node (nanoid-style short id).
 * Uses crypto.randomUUID when available, otherwise a time-based fallback.
 */
export declare function generatePlacedNodeId(): string;
