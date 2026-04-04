import { CanvasElements, PlacedNode } from "../model/interface.js";
import { Shape } from "../model/configurationModel.js";
/** Minimal placement API to avoid circular dependency with engine. */
export interface PlacementClickApi {
    getCanvasPoint(event: MouseEvent): {
        x: number;
        y: number;
    };
    getPlacementContext(): {
        shapeType: string;
        shapeConfig: Shape;
    } | null;
    placeNode(node: PlacedNode): void;
    clearPlacementContext(): void;
    /** Stops preview and removes mousemove/click placement handlers. */
    removePlacementListeners(): void;
    canvasObject: CanvasElements;
}
/**
 * Handles canvas click: if a placement is pending (preview active), places the node
 * at the snapped position and clears the preview.
 */
export declare function svgMouseClick(event: MouseEvent | null, api: PlacementClickApi, manualPoint?: {
    x: number;
    y: number;
}): string | null;
