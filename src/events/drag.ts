import * as d3 from "d3";
import { PlacedNode, CanvasElements } from "../model/interface.js";
import { Config, Shape } from "../model/configurationModel.js";
import { snapToGrid } from "../utils/helpers.js";
import { ShapeRegistry } from "../nodes/registry.js";
import { buildResolvedShapeConfig, getNodeRect, NodeRect } from "../nodes/overlay.js";

export interface DragApi {
  updateNodePosition(id: string, x: number, y: number, recordHistory?: boolean): void;
  getPlacedNodes(): PlacedNode[];
  config: Config;
  shapeRegistry: ShapeRegistry;
  canvasObject: CanvasElements;
  /** SVG root node — needed for correct pointer coordinate transform */
  svgNode: SVGSVGElement;
  setSelectedNodeIds(ids: string[], primaryId?: string): void;
  panBy?: (dx: number, dy: number) => void;
  beginOperation(nodeId: string, type: 'drag' | 'rotate' | 'resize'): void;
  endOperation(): void;
  getSelectedNodeIds(): string[];
}


interface GuideStyleConfig {
  enabled: boolean;
  color: string;
  width: number;
  dashed: boolean;
  dashArray: number[];
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

export function createDragBehavior(api: DragApi) {
  let guideRaf: number | null = null;
  const initialPos = new Map<string, { x: number; y: number }>();
  const initialPointers = new Map<string, { x: number; y: number }>();

  return d3.drag<SVGGElement, PlacedNode>()
    .on("start", function (event, d) {
      if (!event.sourceEvent) return;
      event.sourceEvent.stopPropagation();
      d3.select(this).raise().classed("dragging", true);

      const isGroupBoundary = d3.select(this).classed("visual-group-boundary");
      let selection = api.getSelectedNodeIds();

      // If dragging a group boundary, ensure the whole group is selected and operation is started on group ID
      if (isGroupBoundary) {
          const groupNodesStr = d3.select(this).attr("data-group-nodes");
          // Extract group ID from class: visual-group-boundary vgroup-XXXX
          const classes = d3.select(this).attr("class").split(' ');
          const groupId = classes.find(c => c.startsWith('vgroup-'));
          
          if (groupNodesStr && groupId) {
              const groupIds = groupNodesStr.split(',');
              api.setSelectedNodeIds(groupIds, 'collective-group-trigger');
              selection = groupIds;
              
              // Start operation on the GROUP id specifically, not a member node
              api.beginOperation(groupId, 'drag');
          }
      } else if (!selection.includes(d.id)) {
          // If dragging a single node that isn't selected, select it.
          api.setSelectedNodeIds([d.id], d.id);
          selection = [d.id];
          api.beginOperation(d.id, 'drag');
      }

      const svgGroupNode = api.canvasObject.elements.node() as SVGGElement;
      const [px, py] = d3.pointer(event.sourceEvent, svgGroupNode);
      
      selection.forEach(id => {
          initialPointers.set(id, { x: px, y: py });
          const freshNode = api.getPlacedNodes().find(n => n.id === id);
          if (freshNode) {
              initialPos.set(id, { x: freshNode.x, y: freshNode.y });
          }
      });
    })
    .on("drag", function (event, d) {
      if (!event.sourceEvent) return;
      const svgGroupNode = api.canvasObject.elements.node() as SVGGElement;
      const [px, py] = d3.pointer(event.sourceEvent, svgGroupNode);
      const selection = api.getSelectedNodeIds();
      
      selection.forEach(nodeId => {
          const startP = initialPointers.get(nodeId);
          const startD = initialPos.get(nodeId);
          if (!startP || !startD) return;

          const dx = px - startP.x;
          const dy = py - startP.y;

          let newX = startD.x + dx;
          let newY = startD.y + dy;

          const gridSize = api.config.canvas.grid?.gridSize ?? 20;
          if (api.config.canvasProperties.snapToGrid) {
            const snapped = snapToGrid(newX, newY, gridSize);
            newX = snapped.x;
            newY = snapped.y;
          }

          api.updateNodePosition(nodeId, newX, newY, false);

          // Update visual transform for immediate feedback (only for the dragged selection elements in the DOM)
          const nodeG = d3.select(`g.placed-node[data-node-id="${nodeId}"]`);
          if (!nodeG.empty()) {
              const nodeData = api.getPlacedNodes().find(n => n.id === nodeId);
              nodeG.attr("transform", `translate(${newX},${newY}) rotate(${nodeData?.rotation || 0})`);
          }
      });

      if (guideRaf !== null) {
        cancelAnimationFrame(guideRaf);
      }
      guideRaf = requestAnimationFrame(() => {
        // Alignment guides only for the PRIMARY dragged node to keep it clean
        const currentP = initialPointers.get(d.id);
        const currentD = initialPos.get(d.id);
        if (currentP && currentD) {
            const dx = px - currentP.x;
            const dy = py - currentP.y;
            renderAlignmentGuides(currentD.x + dx, currentD.y + dy, d, api);
        }
        guideRaf = null;
      });
    })
    .on("end", function (event, d) {
      d3.select(this).classed("dragging", false);
      const gridSize = api.config.canvas.grid?.gridSize ?? 20;
      
      if (!event.sourceEvent) {
          initialPointers.delete(d.id);
          initialPos.delete(d.id);
          return;
      }

      const nodesToUpdate = api.getSelectedNodeIds();
      const svgGroupNode = api.canvasObject.elements.node() as SVGGElement;
      const [px, py] = d3.pointer(event.sourceEvent, svgGroupNode);

      nodesToUpdate.forEach(nodeId => {
          const startP = initialPointers.get(nodeId);
          const startD = initialPos.get(nodeId);
          if (startP && startD) {
            const dx = px - startP.x;
            const dy = py - startP.y;

            let finalX = startD.x + dx;
            let finalY = startD.y + dy;
            
            if (api.config.canvasProperties.snapToGrid) {
              const snapped = snapToGrid(finalX, finalY, gridSize);
              finalX = snapped.x;
              finalY = snapped.y;
            }
            
            api.updateNodePosition(nodeId, finalX, finalY, false);
          }
          initialPointers.delete(nodeId);
          initialPos.delete(nodeId);
      });
      api.endOperation();
      
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
