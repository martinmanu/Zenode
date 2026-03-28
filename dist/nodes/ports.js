import * as d3 from 'd3';
import { buildResolvedShapeConfig } from './overlay.js';

/**
 * Renders connection ports for a node.
 * @param nodeGroup - The D3 selection of the node's <g> element
 * @param node - The node data
 * @param config - The engine configuration
 * @param registry - The shape registry to get the renderer
 */
function renderPorts(nodeGroup, node, config, registry) {
    const portConfig = config.canvasProperties.ports;
    if (!portConfig || !portConfig.enabled) {
        return;
    }
    const style = getShapeStyle(node, config);
    if (!style) {
        return;
    }
    const renderer = registry.get(node.type);
    const resolvedConfig = buildResolvedShapeConfig(node, style);
    const ports = renderer.getPorts(resolvedConfig);
    const portData = Object.entries(ports).map(([key, pos]) => ({
        id: key,
        x: pos.x,
        y: pos.y,
    }));
    const portSelection = nodeGroup
        .selectAll("circle.port")
        .data(portData, (d) => d.id);
    portSelection
        .join((enter) => enter.append("circle").attr("class", "port"), (update) => update, (exit) => exit.remove())
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", portConfig.radius)
        .attr("fill", portConfig.fillColor)
        .attr("stroke", portConfig.strokeColor)
        .attr("stroke-width", portConfig.strokeWidth)
        .attr("opacity", portConfig.showOnHoverOnly ? 0 : portConfig.opacity)
        .style("cursor", portConfig.cursor)
        .on("mouseenter", function () {
        if (portConfig.showOnHoverOnly) {
            d3.select(this).transition().duration(200).attr("opacity", portConfig.opacity);
        }
    })
        .on("mouseleave", function () {
        if (portConfig.showOnHoverOnly) {
            d3.select(this).transition().duration(200).attr("opacity", 0);
        }
    })
        .each(function () {
        // Bring ports to front manually by re-appending them to the end of the node group.
        // In SVG, the last child of a group is rendered on top of previous children.
        if (this.parentNode) {
            this.parentNode.appendChild(this);
        }
    });
}
function getShapeStyle(node, config) {
    var _a;
    const list = (_a = config.shapes.default) === null || _a === void 0 ? void 0 : _a[node.type];
    if (!Array.isArray(list))
        return undefined;
    return list.find((s) => s.id === node.shapeVariantId);
}

export { renderPorts };
//# sourceMappingURL=ports.js.map
