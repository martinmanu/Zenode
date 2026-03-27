import { generatePlacedNodeId } from '../utils/helpers.js';
import { removeAllPreview } from './mouseMove.js';

/**
 * Handles canvas click: if a placement is pending (preview active), places the node
 * at the snapped position and clears the preview.
 */
function svgMouseClick(event, api) {
    if (event.defaultPrevented)
        return; // drag fired — ignore
    const ctx = api.getPlacementContext();
    if (!ctx)
        return;
    const point = api.getCanvasPoint(event);
    const { shapeType, shapeConfig } = ctx;
    const node = {
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

export { svgMouseClick };
//# sourceMappingURL=mouseClick.js.map
