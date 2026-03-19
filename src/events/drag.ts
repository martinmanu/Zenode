import * as d3 from "d3";
import { PlacedNode, CanvasElements } from "../model/interface.js";
import { Config } from "../model/configurationModel.js";
import { snapToGrid } from "../utils/helpers.js";

export interface DragApi {
  updateNodePosition(id: string, x: number, y: number): void;
  getPlacedNodes(): PlacedNode[];
  config: Config;
  canvasObject: CanvasElements;
}

/**
 * Creates and returns a D3 drag behavior for placed nodes.
 */
export function createDragBehavior(api: DragApi) {
  let startX = 0;
  let startY = 0;

  return d3.drag<SVGGElement, PlacedNode>()
    .on("start", function (event, d) {
      d3.select(this).raise().classed("dragging", true);
      startX = d.x;
      startY = d.y;
    })
    .on("drag", function (event, d) {
      const gridSize = api.config.canvas.grid?.gridSize ?? 20;
      
      // Calculate new position
      let newX = event.x;
      let newY = event.y;

      // Snap to grid
      if (api.config.canvasProperties.snapToGrid) {
        const snapped = snapToGrid(newX, newY, gridSize);
        newX = snapped.x;
        newY = snapped.y;
      }

      // Update node in DOM immediately for smoothness
      d3.select(this).attr("transform", `translate(${newX},${newY})`);

      // Show alignment hints
      renderAlignmentGuides(newX, newY, d.id, api);
      
      // We don't update state yet to avoid expensive full re-renders during drag
      // (Unless we want connections to follow in real-time. If so, call updateNodePosition here)
      // For Phase 1.2, the requirement is "On drag end, update node position in engine state."
      // However, for connections to follow, we might need it during drag.
      // Let's stick to update on end for now as per 1.2 requirement.
    })
    .on("end", function (event, d) {
      d3.select(this).classed("dragging", false);
      
      const gridSize = api.config.canvas.grid?.gridSize ?? 20;
      let finalX = event.x;
      let finalY = event.y;

      if (api.config.canvasProperties.snapToGrid) {
        const snapped = snapToGrid(finalX, finalY, gridSize);
        finalX = snapped.x;
        finalY = snapped.y;
      }

      // Persist to state
      api.updateNodePosition(d.id, finalX, finalY);
      
      // Clear guides
      if (api.canvasObject.guides) {
        api.canvasObject.guides.selectAll("*").remove();
      }
    });
}

function renderAlignmentGuides(x: number, y: number, nodeId: string, api: DragApi) {
  if (!api.canvasObject.guides) return;

  const nodes = api.getPlacedNodes().filter(n => n.id !== nodeId);
  const guidesLayer = api.canvasObject.guides;
  guidesLayer.selectAll("*").remove();

  const threshold = 5; // Pixels to trigger guide
  const guideColor = "var(--zenode-guide-color, #ffaa00)";

  nodes.forEach(other => {
    // Horizontal alignment
    if (Math.abs(other.y - y) < threshold) {
      guidesLayer.append("line")
        .attr("x1", Math.min(x, other.x) - 100)
        .attr("x2", Math.max(x, other.x) + 100)
        .attr("y1", other.y)
        .attr("y2", other.y)
        .attr("stroke", guideColor)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");
    }

    // Vertical alignment
    if (Math.abs(other.x - x) < threshold) {
      guidesLayer.append("line")
        .attr("x1", other.x)
        .attr("x2", other.x)
        .attr("y1", Math.min(y, other.y) - 100)
        .attr("y2", Math.max(y, other.y) + 100)
        .attr("stroke", guideColor)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");
    }
  });
}
