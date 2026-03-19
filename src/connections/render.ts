/**
 * Renders connection lines on g.connections layer. Straight line from source to target node center.
 */
import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";

export interface StoredConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: string;
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
    .selectAll<SVGLineElement, StoredConnection>("line.connection")
    .data(valid, (d: StoredConnection) => d.id);

  binding
    .join(
      (enter) => {
        return enter
          .append("line")
          .attr("class", "connection")
          .attr("data-connection-id", (d) => d.id)
          .attr("stroke", "#333")
          .attr("stroke-width", 2)
          .attr("x1", (d) => getNodeCenter(nodeById.get(d.sourceNodeId)!).x)
          .attr("y1", (d) => getNodeCenter(nodeById.get(d.sourceNodeId)!).y)
          .attr("x2", (d) => getNodeCenter(nodeById.get(d.targetNodeId)!).x)
          .attr("y2", (d) => getNodeCenter(nodeById.get(d.targetNodeId)!).y);
      },
      (update) => {
        return update
          .attr("x1", (d) => getNodeCenter(nodeById.get(d.sourceNodeId)!).x)
          .attr("y1", (d) => getNodeCenter(nodeById.get(d.sourceNodeId)!).y)
          .attr("x2", (d) => getNodeCenter(nodeById.get(d.targetNodeId)!).x)
          .attr("y2", (d) => getNodeCenter(nodeById.get(d.targetNodeId)!).y);
      },
      (exit) => exit.remove()
    );
}
