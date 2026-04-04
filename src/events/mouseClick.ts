import { CanvasElements, PlacedNode } from "../model/interface.js";
import { Shape } from "../model/configurationModel.js";
import { generatePlacedNodeId } from "../utils/helpers.js";
import { removeAllPreview } from "./mouseMove.js";

/** Minimal placement API to avoid circular dependency with engine. */
export interface PlacementClickApi {
  getCanvasPoint(event: MouseEvent): { x: number; y: number };
  getPlacementContext(): { type: string; variantId?: string; ghostId: string } | null;
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
export function svgMouseClick(event: MouseEvent | null, api: PlacementClickApi, manualPoint?: { x: number; y: number }): string | null {
  if (event && event.defaultPrevented) return null; // drag fired — ignore
  const ctx = api.getPlacementContext();
  if (!ctx) return null;

  const point = manualPoint || (event ? api.getCanvasPoint(event) : { x: 0, y: 0 });
  const { type, variantId } = ctx;

  const node: PlacedNode = {
    id: generatePlacedNodeId(),
    type: type,
    shapeVariantId: variantId || "default",
    x: point.x,
    y: point.y,
    rotation: 0,
    meta: {},
    visualState: { status: "idle" },
  };

  api.placeNode(node);
  removeAllPreview(api.canvasObject);
  api.clearPlacementContext();
  api.removePlacementListeners();
  
  return node.id;
}
