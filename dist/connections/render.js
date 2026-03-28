import * as d3 from 'd3';
import { applyEffects } from '../effects/engine.js';

/**
 * Renders connection lines on g.connections layer. Straight line from source to target node center.
 */
function getNodeCenter(node) {
    return { x: node.x, y: node.y };
}
/**
 * Draws all connections as straight lines between node centers.
 */
function renderConnections(connectionsGroup, connections, placedNodes) {
    const nodeById = new Map(placedNodes.map((n) => [n.id, n]));
    const valid = connections.filter((c) => nodeById.has(c.sourceNodeId) && nodeById.has(c.targetNodeId));
    const binding = connectionsGroup
        .selectAll("g.connection")
        .data(valid, (d) => d.id);
    binding
        .join((enter) => {
        const g = enter
            .append("g")
            .attr("class", "connection")
            .attr("data-connection-id", (d) => d.id);
        g.append("path").attr("class", "connection-line");
        return g;
    }, (update) => update, (exit) => exit.remove())
        .each(function (d) {
        const group = d3.select(this);
        const source = getNodeCenter(nodeById.get(d.sourceNodeId));
        const target = getNodeCenter(nodeById.get(d.targetNodeId));
        const path = `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
        group
            .select("path.connection-line")
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke", "#333")
            .attr("stroke-width", 2)
            .style("pointer-events", "none");
        applyEffects(group, path, d.visualState);
    });
}

export { renderConnections };
//# sourceMappingURL=render.js.map
