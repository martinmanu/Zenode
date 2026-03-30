import * as d3 from "d3";
import { CanvasElements, ShapePreviewData } from "../model/interface.js";
import { Config, Shape } from "../model/configurationModel.js";
import { defaultConfig } from "../config/defaultConfig.js";
import { snapToGrid } from "../utils/helpers.js";
import { ShapeRegistry } from "../nodes/registry.js";
import { ResolvedShapeConfig } from "../types/index.js";

export function svgMouseMove(
  event: MouseEvent,
  shapeType: string,
  shapeToFind: Shape,
  grid: any,
  config: Config,
  canvasObject: CanvasElements,
  data?: ShapePreviewData,
  registry?: ShapeRegistry
) {
  const gridSize: number = config.canvas.grid.gridSize || defaultConfig.canvas.grid.gridSize;
  const zoomTransform = d3.zoomTransform(canvasObject.svg.node() as Element);
  const [cursorX, cursorY] = d3.pointer(event, canvasObject.svg.node());
  const adjustedX = (cursorX - zoomTransform.x) / zoomTransform.k;
  const adjustedY = (cursorY - zoomTransform.y) / zoomTransform.k;
  let exactPosition: { x: number; y: number };
  if (config.canvasProperties.snapToGrid) {
    exactPosition = snapToGrid(adjustedX, adjustedY, gridSize);
  } else {
    exactPosition = { x: adjustedX, y: adjustedY };
  }
  if(shapeToFind.previewEnabled) {
    let shapePreview = createShapePreview(shapeType, exactPosition.x, exactPosition.y, canvasObject, shapeToFind, registry);
  }else {
    // draw the shape directly without preview
  }
}

function createShapePreview(
  shapeType: string,
  x: number,
  y: number,
  canvasObject: any,
  shapeToFind: Shape,
  registry?: ShapeRegistry
) {
  removeAllPreview(canvasObject)
  let elementId = `preview_${shapeType}`;
  let shape;

  if (registry && registry.has(shapeType)) {
    const renderer = registry.get(shapeType);
    const radius = shapeToFind.radius ?? 30;
    const width = shapeToFind.width ?? radius * 2;
    const height = shapeToFind.height ?? radius * 2;

    // All renderers draw with (0,0) as the anchor (center or top-left).
    // We use a <g translate(x,y)> so the path coordinates are always
    // relative to (0,0), then shifted to the cursor position regardless
    // of shape type. This fixes the circle offset bug.
    //
    // Circle renderer uses (cx=x, cy=y) as the CENTER — so pass x:0,y:0.
    // Rect/polygon renderers use the top-left corner — so offset by -w/2,-h/2
    // to keep them visually centered on the cursor too.
    const isCircleLike = shapeType === "circle";
    const tempConfig: ResolvedShapeConfig = {
      type: shapeType,
      x: isCircleLike ? 0 : -width / 2,
      y: isCircleLike ? 0 : -height / 2,
      width,
      height,
      radius,
      color: shapeToFind.color,
      stroke: shapeToFind.stroke,
      transparency: shapeToFind.transparency,
      borderRadius: shapeToFind.borderRadius
    };

    const pathData = renderer.getPath(tempConfig);
    const group = canvasObject.elements.append("g")
      .attr("id", elementId)
      .attr("transform", `translate(${x},${y})`);

    shape = group.append("path")
      .attr("d", pathData)
      .attr("fill", shapeToFind.color)
      .attr("stroke", shapeToFind.stroke?.color ?? "#000")
      .attr("stroke-width", shapeToFind.stroke?.width ?? 1)
      .attr("stroke-dasharray", shapeToFind.stroke?.strokeDasharray?.join(" ") || null)
      .attr("opacity", shapeToFind.previewTransparency ?? 0.5);

    return group;
  }

  // Fallback for legacy hardcoded previews (circles/rects without registry)
  if (shapeType === "rectangle") {
    // ... rest of legacy logic
  }
  return shape;
}

export function removeAllPreview(canvasObject: CanvasElements) {
  canvasObject.elements.selectAll(
    "path[id^='preview_'], polygon[id^='preview_'], circle[id^='preview_'], g[id^='preview_']"
  ).remove();
}



