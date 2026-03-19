/**
 * Renders placed nodes using D3 data join. Keeps g.placed-nodes in sync with engine state.
 */
import * as d3 from "d3";
import { PlacedNode, CanvasElements } from "../model/interface.js";
import { Config, Shape } from "../model/configurationModel.js";
import { roundedRectPath } from "../components/shapeTypes/rectangle.js";
import { createDragBehavior, DragApi } from "../events/drag.js";

/** Minimal API for rendering and interaction */
export interface RenderApi extends DragApi {}

function getShapeStyle(node: PlacedNode, config: Config): Shape | undefined {
  const list = config.shapes.default?.[node.type as keyof typeof config.shapes.default];
  if (!Array.isArray(list)) return undefined;
  return list.find((s: Shape) => s.id === node.shapeVariantId);
}

function drawPlacedRectangle(g: d3.Selection<SVGGElement, PlacedNode, any, any>, style: Shape): void {
  const width = style.width ?? 120;
  const height = style.height ?? 60;
  const x0 = -width / 2;
  const y0 = -height / 2;
  const r1 = style.borderRadius?.leftTop ?? 0;
  const r2 = style.borderRadius?.rightTop ?? 0;
  const r3 = style.borderRadius?.rightBottom ?? 0;
  const r4 = style.borderRadius?.leftBottom ?? 0;
  const pathData = roundedRectPath(x0, y0, width, height, r1, r2, r3, r4);
  g.append("path")
    .attr("d", pathData)
    .attr("fill", style.color)
    .attr("stroke", style.stroke.color)
    .attr("stroke-width", style.stroke.width)
    .attr("stroke-dasharray", style.stroke.strokeDasharray?.length ? style.stroke.strokeDasharray.join(" ") : null);
}

function drawPlacedCircle(g: d3.Selection<SVGGElement, PlacedNode, any, any>, style: Shape): void {
  const r = style.radius ?? 30;
  g.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", r)
    .attr("fill", style.color)
    .attr("stroke", style.stroke.color)
    .attr("stroke-width", style.stroke.width)
    .attr("stroke-dasharray", style.stroke.strokeDasharray?.length ? style.stroke.strokeDasharray.join(" ") : null);
}

function drawPlacedRhombus(g: d3.Selection<SVGGElement, PlacedNode, any, any>, style: Shape): void {
  const size = style.width ?? 60;
  const points = `0,${-size / 2} ${size / 2},0 0,${size / 2} ${-size / 2},0`;
  g.append("polygon")
    .attr("points", points)
    .attr("fill", style.color)
    .attr("stroke", style.stroke.color)
    .attr("stroke-width", style.stroke.width)
    .attr("stroke-dasharray", style.stroke.strokeDasharray?.length ? style.stroke.strokeDasharray.join(" ") : null);
}

/**
 * Renders the placed nodes layer using a D3 data join. Call after state changes.
 * @param placedNodesGroup - D3 selection for g.placed-nodes
 * @param placedNodes - Current array of placed nodes
 * @param config - Engine config for shape styles
 */
export function renderPlacedNodes(
  placedNodesGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  placedNodes: PlacedNode[],
  api: RenderApi
): void {
  const dragBehavior = createDragBehavior(api);
  const binding = placedNodesGroup
    .selectAll<SVGGElement, PlacedNode>("g.node")
    .data(placedNodes, (d: PlacedNode) => d.id);

  binding
    .join(
      (enter) => {
        const g = enter
          .append("g")
          .attr("class", "node placed-node")
          .attr("data-id", (d) => d.id)
          .attr("transform", (d) => `translate(${d.x},${d.y})`)
          .call(dragBehavior);

        g.each(function (d) {
          const style = getShapeStyle(d, api.config);
          if (!style) return;
          const el = d3.select<SVGGElement, PlacedNode>(this);
          if (d.type === "rectangle") drawPlacedRectangle(el, style);
          else if (d.type === "circle") drawPlacedCircle(el, style);
          else if (d.type === "rhombus") drawPlacedRhombus(el, style);
        });
        return g;
      },
      (update) => update.attr("transform", (d) => `translate(${d.x},${d.y})`),
      (exit) => exit.remove()
    );
}
