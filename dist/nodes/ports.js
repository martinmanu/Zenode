import '../node_modules/d3-transition/src/selection/index.js';
import '../node_modules/d3-zoom/src/transform.js';
import { buildResolvedShapeConfig } from './overlay.js';
import select from '../node_modules/d3-selection/src/select.js';

/**
 * Renders connection ports for a node.
 * @param nodeGroup - The D3 selection of the node's <g> element
 * @param node - The node data
 * @param config - The engine configuration
 * @param registry - The shape registry to get the renderer
 */
function renderPorts(nodeGroup, node, config, registry, engine) {
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
        .attr("opacity", () => {
        if (!engine.connectionModeEnabled)
            return 0;
        return portConfig.showOnHoverOnly ? 0 : portConfig.opacity;
    })
        .style("cursor", () => engine.connectionModeEnabled ? portConfig.cursor : "default")
        .on("mouseenter", function () {
        if (!engine.connectionModeEnabled)
            return;
        if (portConfig.showOnHoverOnly) {
            select(this).transition().duration(200).attr("opacity", portConfig.opacity);
        }
    })
        .on("mouseleave", function () {
        if (!engine.connectionModeEnabled)
            return;
        if (portConfig.showOnHoverOnly) {
            select(this).transition().duration(200).attr("opacity", 0);
        }
    })
        .on("mousedown", function (event, d) {
        if (!engine.connectionModeEnabled)
            return;
        event.stopPropagation();
        event.preventDefault();
        const startPoint = engine.getCanvasPoint(event);
        engine.startConnectionDrag(node.id, d.id, startPoint);
        const onMouseMove = (moveEvent) => {
            const currentPoint = engine.getCanvasPoint(moveEvent);
            engine.updateConnectionDrag(currentPoint);
        };
        const onMouseUp = (upEvent) => {
            const upTarget = upEvent.target;
            const portGroup = upTarget.closest(".port");
            let targetNodeId;
            let targetPortId;
            if (portGroup) {
                const portData = select(portGroup).datum();
                const nodeGroup = portGroup.closest(".node");
                if (nodeGroup) {
                    targetNodeId = select(nodeGroup).attr("data-id") || undefined;
                    targetPortId = portData.id;
                }
            }
            engine.endConnectionDrag(targetNodeId, targetPortId);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
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
