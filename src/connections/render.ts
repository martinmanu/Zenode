/**
 * Renders connection lines on g.connections layer. Straight line from source to target node center.
 */
import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { VisualState } from "../types/index.js";
import { applyEffects } from "../effects/engine.js";

export interface StoredConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: string;
  visualState?: VisualState;
}

function getNodeCenter(node: PlacedNode): { x: number; y: number } {
  return { x: node.x, y: node.y };
}

/**
 * Draws all connections as straight lines between node centers.
 */
export function renderConnections(
  connectionsGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  connections: StoredConnection[],
  placedNodes: PlacedNode[]
): void {
  const nodeById = new Map(placedNodes.map((n) => [n.id, n]));
  const valid = connections.filter(
    (c) => nodeById.has(c.sourceNodeId) && nodeById.has(c.targetNodeId)
  );

  const binding = connectionsGroup
    .selectAll<SVGGElement, StoredConnection>("g.connection")
    .data(valid, (d: StoredConnection) => d.id);

  binding
    .join(
      (enter) => {
        const g = enter
          .append("g")
          .attr("class", "connection")
          .attr("data-connection-id", (d) => d.id);

        g.append("path").attr("class", "connection-line");
        return g;
      },
      (update) => update,
      (exit) => exit.remove()
    )
    .each(function (d) {
      const group = d3.select<SVGGElement, StoredConnection>(this);
      const source = getNodeCenter(nodeById.get(d.sourceNodeId)!);
      const target = getNodeCenter(nodeById.get(d.targetNodeId)!);
      const path = `M ${source.x} ${source.y} L ${target.x} ${target.y}`;

      group
        .select<SVGPathElement>("path.connection-line")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#333")
        .attr("stroke-width", 2)
        .style("pointer-events", "none");

      applyEffects(group as any, path, d.visualState);
    });
}
