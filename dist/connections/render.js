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
        .selectAll("line.connection")
        .data(valid, (d) => d.id);
    binding
        .join((enter) => {
        return enter
            .append("line")
            .attr("class", "connection")
            .attr("data-connection-id", (d) => d.id)
            .attr("stroke", "#333")
            .attr("stroke-width", 2)
            .attr("x1", (d) => getNodeCenter(nodeById.get(d.sourceNodeId)).x)
            .attr("y1", (d) => getNodeCenter(nodeById.get(d.sourceNodeId)).y)
            .attr("x2", (d) => getNodeCenter(nodeById.get(d.targetNodeId)).x)
            .attr("y2", (d) => getNodeCenter(nodeById.get(d.targetNodeId)).y);
    }, (update) => {
        return update
            .attr("x1", (d) => getNodeCenter(nodeById.get(d.sourceNodeId)).x)
            .attr("y1", (d) => getNodeCenter(nodeById.get(d.sourceNodeId)).y)
            .attr("x2", (d) => getNodeCenter(nodeById.get(d.targetNodeId)).x)
            .attr("y2", (d) => getNodeCenter(nodeById.get(d.targetNodeId)).y);
    }, (exit) => exit.remove());
}

export { renderConnections };
//# sourceMappingURL=render.js.map
