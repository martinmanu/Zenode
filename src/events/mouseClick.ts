import { CanvasElements, PlacedNode } from "../model/interface.js";
import { Shape } from "../model/configurationModel.js";
import { generatePlacedNodeId } from "../utils/helpers.js";
import { removeAllPreview } from "./mouseMove.js";

/** Minimal placement API to avoid circular dependency with engine. */
export interface PlacementClickApi {
  getCanvasPoint(event: MouseEvent): { x: number; y: number };
  getPlacementContext(): { shapeType: string; shapeConfig: Shape } | null;
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
export function svgMouseClick(event: MouseEvent, api: PlacementClickApi): void {
  const ctx = api.getPlacementContext();
  if (!ctx) return;

  const point = api.getCanvasPoint(event);
  const { shapeType, shapeConfig } = ctx;

  const node: PlacedNode = {
    id: generatePlacedNodeId(),
    type: shapeType,
    shapeVariantId: shapeConfig.id,
    x: point.x,
    y: point.y,
    width: shapeConfig.width,
    height: shapeConfig.height,
    radius: shapeConfig.radius,
    meta: {},
  };

  api.placeNode(node);
  removeAllPreview(api.canvasObject);
  api.clearPlacementContext();
  api.removePlacementListeners();
}
