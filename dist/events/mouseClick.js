import { generatePlacedNodeId } from '../utils/helpers.js';
import { removeAllPreview } from './mouseMove.js';

/**
 * Handles canvas click: if a placement is pending (preview active), places the node
 * at the snapped position and clears the preview.
 */
function svgMouseClick(event, api, manualPoint) {
    if (event && event.defaultPrevented)
        return null; // drag fired — ignore
    const ctx = api.getPlacementContext();
    if (!ctx)
        return null;
    const point = (event ? api.getCanvasPoint(event) : { x: 0, y: 0 });
    const { type, variantId } = ctx;
    const node = {
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

export { svgMouseClick };
//# sourceMappingURL=mouseClick.js.map
