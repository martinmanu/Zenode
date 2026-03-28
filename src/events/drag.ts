import * as d3 from "d3";
import { PlacedNode, CanvasElements } from "../model/interface.js";
import { Config, Shape } from "../model/configurationModel.js";
import { snapToGrid } from "../utils/helpers.js";
import { ShapeRegistry } from "../nodes/registry.js";
import { buildResolvedShapeConfig } from "../nodes/overlay.js";

export interface DragApi {
  updateNodePosition(id: string, x: number, y: number): void;
  getPlacedNodes(): PlacedNode[];
  config: Config;
  shapeRegistry: ShapeRegistry;
  canvasObject: CanvasElements;
  /** SVG root node — needed for correct pointer coordinate transform */
  svgNode: SVGSVGElement;
}

interface NodeRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  cx: number;
  cy: number;
}

interface GuideStyleConfig {
  enabled: boolean;
  color: string;
  width: number;
  dashed: boolean;
  dashArray: number[];
}

function getShapeStyle(node: PlacedNode, config: Config): Shape | undefined {
  const list = config.shapes.default?.[node.type as keyof typeof config.shapes.default];
  if (!Array.isArray(list)) return undefined;
  return list.find((s: Shape) => s.id === node.shapeVariantId);
}

function getNodeRect(node: PlacedNode, api: DragApi): NodeRect | null {
  const style = getShapeStyle(node, api.config);
  if (!style) return null;
  const renderer = api.shapeRegistry.get(node.type);
  const resolved = buildResolvedShapeConfig(node, style);
  const local = renderer.getBounds(resolved);

  const left = node.x + local.x;
  const top = node.y + local.y;
  const right = left + local.width;
  const bottom = top + local.height;

  return {
    left,
    right,
    top,
    bottom,
    cx: left + local.width / 2,
    cy: top + local.height / 2,
  };
}

function upsertGuide(
  map: Map<number, { min: number; max: number }>,
  key: number,
  min: number,
  max: number
): void {
  const roundedKey = Number(key.toFixed(2));
  const existing = map.get(roundedKey);
  if (!existing) {
    map.set(roundedKey, { min, max });
    return;
  }
  existing.min = Math.min(existing.min, min);
  existing.max = Math.max(existing.max, max);
}

function getGuideStyle(
  alignCfg: Config["canvasProperties"]["alignmentLines"],
  kind: "edge" | "center"
): GuideStyleConfig {
  const fallback: GuideStyleConfig = {
    enabled: true,
    color: alignCfg.color,
    width: alignCfg.width,
    dashed: alignCfg.dashed,
    dashArray: alignCfg.dashArray,
  };

  if (kind === "edge") {
    return {
      enabled: alignCfg.edgeGuides?.enabled ?? fallback.enabled,
      color: alignCfg.edgeGuides?.color ?? fallback.color,
      width: alignCfg.edgeGuides?.width ?? fallback.width,
      dashed: alignCfg.edgeGuides?.dashed ?? fallback.dashed,
      dashArray: alignCfg.edgeGuides?.dashArray ?? fallback.dashArray,
    };
  }

  return {
    enabled: alignCfg.centerGuides?.enabled ?? fallback.enabled,
    color: alignCfg.centerGuides?.color ?? fallback.color,
    width: alignCfg.centerGuides?.width ?? fallback.width,
    dashed: alignCfg.centerGuides?.dashed ?? fallback.dashed,
    dashArray: alignCfg.centerGuides?.dashArray ?? fallback.dashArray,
  };
}

/**
 * Creates and returns a D3 drag behavior for placed nodes.
 */
export function createDragBehavior(api: DragApi) {
  let guideRaf: number | null = null;

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
      if (guideRaf !== null) {
        cancelAnimationFrame(guideRaf);
      }
      guideRaf = requestAnimationFrame(() => {
        renderAlignmentGuides(newX, newY, d, api);
        guideRaf = null;
      });
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
      if (guideRaf !== null) {
        cancelAnimationFrame(guideRaf);
        guideRaf = null;
      }
      if (api.canvasObject.guides) {
        api.canvasObject.guides.selectAll("*").remove();
      }
    });
}

function renderAlignmentGuides(x: number, y: number, draggingNode: PlacedNode, api: DragApi) {
  if (!api.canvasObject.guides) return;
  const alignCfg = api.config.canvasProperties.alignmentLines;
  if (!alignCfg?.enabled) return;

  const nodes = api.getPlacedNodes().filter(n => n.id !== draggingNode.id);
  const guidesLayer = api.canvasObject.guides;
  guidesLayer.selectAll("*").remove();

  const threshold = alignCfg.alignmentThreshold ?? 5;
  const edgeStyle = getGuideStyle(alignCfg, "edge");
  const centerStyle = getGuideStyle(alignCfg, "center");
  const isFull = alignCfg.guideLineMode === 'full';

  const dragRect = getNodeRect({ ...draggingNode, x, y }, api);
  if (!dragRect) return;

  const verticalEdgeGuides = new Map<number, { min: number; max: number }>();
  const horizontalEdgeGuides = new Map<number, { min: number; max: number }>();
  const verticalCenterGuides = new Map<number, { min: number; max: number }>();
  const horizontalCenterGuides = new Map<number, { min: number; max: number }>();

  nodes.forEach((other) => {
    const otherRect = getNodeRect(other, api);
    if (!otherRect) return;

    const dragXAnchors: Array<{ value: number; kind: "edge" | "center" }> = [
      { value: dragRect.left, kind: "edge" },
      { value: dragRect.cx, kind: "center" },
      { value: dragRect.right, kind: "edge" },
    ];
    const otherXAnchors: Array<{ value: number; kind: "edge" | "center" }> = [
      { value: otherRect.left, kind: "edge" },
      { value: otherRect.cx, kind: "center" },
      { value: otherRect.right, kind: "edge" },
    ];
    dragXAnchors.forEach((dx) => {
      otherXAnchors.forEach((ox) => {
        if (Math.abs(dx.value - ox.value) <= threshold) {
          const coord = (dx.value + ox.value) / 2;
          const targetMap = dx.kind === "center" && ox.kind === "center"
            ? verticalCenterGuides
            : verticalEdgeGuides;
          upsertGuide(
            targetMap,
            coord,
            Math.min(dragRect.top, otherRect.top),
            Math.max(dragRect.bottom, otherRect.bottom)
          );
        }
      });
    });

    const dragYAnchors: Array<{ value: number; kind: "edge" | "center" }> = [
      { value: dragRect.top, kind: "edge" },
      { value: dragRect.cy, kind: "center" },
      { value: dragRect.bottom, kind: "edge" },
    ];
    const otherYAnchors: Array<{ value: number; kind: "edge" | "center" }> = [
      { value: otherRect.top, kind: "edge" },
      { value: otherRect.cy, kind: "center" },
      { value: otherRect.bottom, kind: "edge" },
    ];
    dragYAnchors.forEach((dy) => {
      otherYAnchors.forEach((oy) => {
        if (Math.abs(dy.value - oy.value) <= threshold) {
          const coord = (dy.value + oy.value) / 2;
          const targetMap = dy.kind === "center" && oy.kind === "center"
            ? horizontalCenterGuides
            : horizontalEdgeGuides;
          upsertGuide(
            targetMap,
            coord,
            Math.min(dragRect.left, otherRect.left),
            Math.max(dragRect.right, otherRect.right)
          );
        }
      });
    });
  });

  const fullPad = 100000;

  function drawVertical(map: Map<number, { min: number; max: number }>, style: GuideStyleConfig): void {
    if (!style.enabled) return;
    const dash = style.dashed ? (style.dashArray?.join(" ") ?? "4 4") : null;
    map.forEach((range, xCoord) => {
      guidesLayer.append("line")
        .attr("x1", xCoord)
        .attr("x2", xCoord)
        .attr("y1", isFull ? -fullPad : range.min - 12)
        .attr("y2", isFull ? fullPad : range.max + 12)
        .attr("stroke", style.color)
        .attr("stroke-width", style.width)
        .attr("stroke-dasharray", dash);
    });
  }

  function drawHorizontal(map: Map<number, { min: number; max: number }>, style: GuideStyleConfig): void {
    if (!style.enabled) return;
    const dash = style.dashed ? (style.dashArray?.join(" ") ?? "4 4") : null;
    map.forEach((range, yCoord) => {
      guidesLayer.append("line")
        .attr("x1", isFull ? -fullPad : range.min - 12)
        .attr("x2", isFull ? fullPad : range.max + 12)
        .attr("y1", yCoord)
        .attr("y2", yCoord)
        .attr("stroke", style.color)
        .attr("stroke-width", style.width)
        .attr("stroke-dasharray", dash);
    });
  }

  drawVertical(verticalEdgeGuides, edgeStyle);
  drawHorizontal(horizontalEdgeGuides, edgeStyle);
  drawVertical(verticalCenterGuides, centerStyle);
  drawHorizontal(horizontalCenterGuides, centerStyle);
}
