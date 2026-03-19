import * as d3 from "d3";
import { CanvasElements, ShapePreviewData } from "../model/interface.js";
import { Config, Shape } from "../model/configurationModel.js";
import { defaultConfig } from "../config/defaultConfig.js";
import { snapToGrid } from "../utils/helpers.js";
import { roundedRectPath } from "../components/shapeTypes/rectangle.js";

export function svgMouseMove(
  event: MouseEvent,
  shapeType: string,
  shapeToFind: Shape,
  grid: any,
  config: Config,
  canvasObject: CanvasElements,
  data?: ShapePreviewData,
) {
  const gridSize: number = config.canvas.grid.gridSize || defaultConfig.canvas.grid.gridSize;
  const zoomTransform = d3.zoomTransform(grid.node() as Element);
  const [cursorX, cursorY] = d3.pointer(event);
  const adjustedX = (cursorX - zoomTransform.x) / zoomTransform.k;
  const adjustedY = (cursorY - zoomTransform.y) / zoomTransform.k;
  let exactPosition: { x: number; y: number };
  if (config.canvasProperties.snapToGrid) {
    exactPosition = snapToGrid(adjustedX, adjustedY, gridSize);
  } else {
    exactPosition = { x: adjustedX, y: adjustedY };
  }
  if(shapeToFind.previewEnabled) {
    let shapePreview = createShapePreview(shapeType, exactPosition.x, exactPosition.y, canvasObject, shapeToFind);
  }else {
    // draw the shape directly without preview
  }
}

function createShapePreview(
  shapeType: string,
  x: number,
  y: number,
  canvasObject: any,
  shapeToFind: Shape
) {
  removeAllPreview(canvasObject)
  let elementId = `preview_${shapeType}`;
  let shape;
  if (shapeType === "rectangle") {
    // Compute top-left corner assuming shape's position is the center.
    const width = shapeToFind.width ?? 120;
    const height = shapeToFind.height ?? 60;
    const x0 = x - width / 2;
    const y0 = y - height / 2;
    const r1 = shapeToFind.borderRadius?.leftTop || 0;
    const r2 = shapeToFind.borderRadius?.rightTop || 0;
    const r3 = shapeToFind.borderRadius?.rightBottom || 0;
    const r4 = shapeToFind.borderRadius?.leftBottom || 0;
    const pathData = roundedRectPath(x0, y0, width, height, r1, r2, r3, r4);
    shape = canvasObject.elements.append("path")
      .attr("id", elementId)
      .attr("d", pathData)
      .attr("fill", shapeToFind.color)
      .attr("stroke", shapeToFind.stroke.color)
      .attr("stroke-width", shapeToFind.stroke.width)
      .attr("stroke-dasharray", shapeToFind.stroke.strokeDasharray?.join(" ") || null)
      .attr("opacity", shapeToFind.previewTransparency ?? 0.5);
  } else if (shapeType === "circle") {
    shape = canvasObject.elements.append("circle")
      .attr("id", elementId)
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", shapeToFind.radius ?? 30)
      .attr("fill", shapeToFind.color)
      .attr("stroke", shapeToFind.stroke.color)
      .attr("stroke-width", shapeToFind.stroke.width)
      .attr("opacity", shapeToFind.previewTransparency ?? 0.5);
  } else if ( shapeType === "rhombus") {
    shape = canvasObject.elements.append("polygon")
      .attr("id", elementId)
      .attr("points", `${x},${y - 30} ${x + 30},${y} ${x},${y + 30} ${x - 30},${y}`)
      .attr("fill", shapeToFind.color)
      .attr("stroke", shapeToFind.stroke.color)
      .attr("stroke-width", shapeToFind.stroke.width)
      .attr("opacity", shapeToFind.previewTransparency ?? 0.5);
  } else {
    return null;
  }
  return shape;
}

export function removeAllPreview(canvasObject: CanvasElements) {
  canvasObject.elements.selectAll("path[id^='preview_'], polygon[id^='preview_'], circle[id^='preview_']").remove();
}



