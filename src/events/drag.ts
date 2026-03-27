import * as d3 from "d3";
import { PlacedNode, CanvasElements } from "../model/interface.js";
import { Config } from "../model/configurationModel.js";
import { snapToGrid } from "../utils/helpers.js";

export interface DragApi {
  updateNodePosition(id: string, x: number, y: number): void;
  getPlacedNodes(): PlacedNode[];
  config: Config;
  canvasObject: CanvasElements;
  /** SVG root node — needed for correct pointer coordinate transform */
  svgNode: SVGSVGElement;
}

/**
 * Creates and returns a D3 drag behavior for placed nodes.
 */
export function createDragBehavior(api: DragApi) {
  return d3.drag<SVGGElement, PlacedNode>()
    .on("start", function (event, d) {
      event.sourceEvent.stopPropagation();
      d3.select(this).raise().classed("dragging", true);
    })
    .on("drag", function (event, d) {
      const gridSize = api.config.canvas.grid?.gridSize ?? 20;
      const zoomTransform = d3.zoomTransform(api.svgNode);
      const [px, py] = d3.pointer(event.sourceEvent, api.svgNode);
      let newX = (px - zoomTransform.x) / zoomTransform.k;
      let newY = (py - zoomTransform.y) / zoomTransform.k;
      if (api.config.canvasProperties.snapToGrid) {
        const snapped = snapToGrid(newX, newY, gridSize);
        newX = snapped.x;
        newY = snapped.y;
      }
      d3.select(this).attr("transform", `translate(${newX},${newY})`);
      renderAlignmentGuides(newX, newY, d.id, api);
    })
    .on("end", function (event, d) {
      d3.select(this).classed("dragging", false);
      const gridSize = api.config.canvas.grid?.gridSize ?? 20;
      const zoomTransform = d3.zoomTransform(api.svgNode);
      const [px, py] = d3.pointer(event.sourceEvent, api.svgNode);
      let finalX = (px - zoomTransform.x) / zoomTransform.k;
      let finalY = (py - zoomTransform.y) / zoomTransform.k;
      if (api.config.canvasProperties.snapToGrid) {
        const snapped = snapToGrid(finalX, finalY, gridSize);
        finalX = snapped.x;
        finalY = snapped.y;
      }
      api.updateNodePosition(d.id, finalX, finalY);
      if (api.canvasObject.guides) {
        api.canvasObject.guides.selectAll("*").remove();
      }
    });
}

function renderAlignmentGuides(x: number, y: number, nodeId: string, api: DragApi) {
  if (!api.canvasObject.guides) return;
  const alignCfg = api.config.canvasProperties.alignmentLines;
  if (!alignCfg?.enabled) return;

  const nodes = api.getPlacedNodes().filter(n => n.id !== nodeId);
  const guidesLayer = api.canvasObject.guides;
  guidesLayer.selectAll("*").remove();

  const threshold = 5;
  const guideColor = alignCfg.color ?? "var(--zenode-guide-color, #ffaa00)";
  const strokeWidth = alignCfg.width ?? 1;
  const dashArray = alignCfg.dashed ? (alignCfg.dashArray?.join(" ") ?? "4 4") : null;
  const isFull = alignCfg.guideLineMode === 'full';

  // For full mode: use a very large value in canvas-space (before zoom transform)
  // The guides layer is inside the zoom group so coordinates are in canvas-space already
  const FULL_EXTENT = 1e6;

  nodes.forEach(other => {
    // Normalize other node center (rectangles store top-left, circles store center)
    const otherCX = other.x;
    const otherCY = other.y;

    // Horizontal alignment (same Y center)
    if (Math.abs(otherCY - y) < threshold) {
      const x1 = isFull ? -FULL_EXTENT : Math.min(x, otherCX) - 100;
      const x2 = isFull ? FULL_EXTENT : Math.max(x, otherCX) + 100;
      guidesLayer.append("line")
        .attr("x1", x1).attr("x2", x2)
        .attr("y1", otherCY).attr("y2", otherCY)
        .attr("stroke", guideColor)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-dasharray", dashArray);
    }
    // Vertical alignment (same X center)
    if (Math.abs(otherCX - x) < threshold) {
      const y1 = isFull ? -FULL_EXTENT : Math.min(y, otherCY) - 100;
      const y2 = isFull ? FULL_EXTENT : Math.max(y, otherCY) + 100;
      guidesLayer.append("line")
        .attr("x1", otherCX).attr("x2", otherCX)
        .attr("y1", y1).attr("y2", y2)
        .attr("stroke", guideColor)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-dasharray", dashArray);
    }
  });
}
