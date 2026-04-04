import { buildResolvedShapeConfig } from './overlay.js';

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
    const bounds = renderer.getBounds(resolvedConfig);
    // --- Connection Ports Logic ---
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
        .style("pointer-events", () => engine.connectionModeEnabled ? "all" : "none")
        .style("cursor", () => engine.connectionModeEnabled ? portConfig.cursor : "default")
        .on("mousedown", function (event, d) {
        if (!engine.connectionModeEnabled)
            return;
        event.stopPropagation();
        event.preventDefault();
        const startPoint = engine.getCanvasPoint(event);
        engine.startConnectionDrag(node.id, d.id, startPoint);
    });
    // --- Rotation Handles Logic ---
    const isSelected = engine.getSelectedNodeIds().includes(node.id);
    const isRotationMode = engine.isRotationModeEnabled && engine.isRotationModeEnabled();
    const handleOffset = 15;
    const rotationHandleData = (isSelected && isRotationMode) ? [
        { id: "rotate-top", x: bounds.x + bounds.width / 2, y: bounds.y - handleOffset },
        { id: "rotate-right", x: bounds.x + bounds.width + handleOffset, y: bounds.y + bounds.height / 2 },
        { id: "rotate-bottom", x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height + handleOffset },
        { id: "rotate-left", x: bounds.x - handleOffset, y: bounds.y + bounds.height / 2 },
    ] : [];
    // Simple SVG curved arrow for rotation cursor
    const rotateCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8'/%3E%3C/svg%3E") 10 10, crosshair`;
    const handleSelection = nodeGroup
        .selectAll("circle.rotate-handle")
        .data(rotationHandleData, (d) => d.id);
    handleSelection
        .join((enter) => enter.append("circle").attr("class", "rotate-handle"), (update) => update, (exit) => exit.remove())
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", 5)
        .attr("fill", "#4A90E2")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .style("cursor", rotateCursor)
        .on("mousedown", function (event) {
        event.stopPropagation();
        event.preventDefault();
        const startPoint = engine.getCanvasPoint(event);
        const startDx = startPoint.x - node.x;
        const startDy = startPoint.y - node.y;
        const startMouseAngle = Math.atan2(startDy, startDx) * (180 / Math.PI);
        const startNodeRotation = node.rotation || 0;
        const onMouseMove = (moveEvent) => {
            const currentPoint = engine.getCanvasPoint(moveEvent);
            const dx = currentPoint.x - node.x;
            const dy = currentPoint.y - node.y;
            const currentMouseAngle = Math.atan2(dy, dx) * (180 / Math.PI);
            let deltaAngle = currentMouseAngle - startMouseAngle;
            // Calculate new rotation and apply 15-degree snapping
            let newRotation = startNodeRotation + deltaAngle;
            newRotation = Math.round(newRotation / 15) * 15;
            engine.rotateNode(node.id, newRotation, false);
        };
        const onMouseUp = () => {
            engine.endOperation();
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
        engine.beginOperation(node.id, 'rotate');
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    });
    // --- Resize Handles Logic ---
    const isResizeMode = engine.isResizeModeEnabled && engine.isResizeModeEnabled();
    const resizeCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7'/%3E%3C/svg%3E") 10 10, nwse-resize`;
    // 4 edge handles: N (top), S (bottom), E (right), W (left)
    const resizeHandleOffset = 0;
    const resizeHandleData = (isSelected && isResizeMode) ? [
        { id: "resize-n", x: bounds.x + bounds.width / 2, y: bounds.y + resizeHandleOffset, axis: "h" },
        { id: "resize-s", x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height - resizeHandleOffset, axis: "h" },
        { id: "resize-e", x: bounds.x + bounds.width - resizeHandleOffset, y: bounds.y + bounds.height / 2, axis: "w" },
        { id: "resize-w", x: bounds.x + resizeHandleOffset, y: bounds.y + bounds.height / 2, axis: "w" },
    ] : [];
    const resizeHandleSelection = nodeGroup
        .selectAll("rect.resize-handle")
        .data(resizeHandleData, (d) => d.id);
    resizeHandleSelection
        .join((enter) => enter.append("rect").attr("class", "resize-handle"), (update) => update, (exit) => exit.remove())
        .attr("x", (d) => d.x - 5)
        .attr("y", (d) => d.y - 5)
        .attr("width", 10)
        .attr("height", 10)
        .attr("rx", 2)
        .attr("fill", "#22C55E")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .style("cursor", resizeCursor)
        .on("mousedown", function (event, d) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        event.stopPropagation();
        event.preventDefault();
        // Resolve current dimensions and base constraints
        const style = getShapeStyle(node, config);
        const baseW = (_d = (_c = (_b = (_a = node.baseDimensions) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : node.width) !== null && _c !== void 0 ? _c : style === null || style === void 0 ? void 0 : style.width) !== null && _d !== void 0 ? _d : 100;
        const baseH = (_h = (_g = (_f = (_e = node.baseDimensions) === null || _e === void 0 ? void 0 : _e.height) !== null && _f !== void 0 ? _f : node.height) !== null && _g !== void 0 ? _g : style === null || style === void 0 ? void 0 : style.height) !== null && _h !== void 0 ? _h : 100;
        const baseR = (_m = (_l = (_k = (_j = node.baseDimensions) === null || _j === void 0 ? void 0 : _j.radius) !== null && _k !== void 0 ? _k : node.radius) !== null && _l !== void 0 ? _l : style === null || style === void 0 ? void 0 : style.radius) !== null && _m !== void 0 ? _m : 30;
        const minW = baseW * 0.5, maxW = baseW * 2;
        const minH = baseH * 0.5, maxH = baseH * 2;
        const minR = baseR * 0.5, maxR = baseR * 2;
        const startPoint = engine.getCanvasPoint(event);
        const startW = (_o = node.width) !== null && _o !== void 0 ? _o : baseW;
        const startH = (_p = node.height) !== null && _p !== void 0 ? _p : baseH;
        const startR = (_q = node.radius) !== null && _q !== void 0 ? _q : baseR;
        const onMouseMove = (moveEvent) => {
            const currentPoint = engine.getCanvasPoint(moveEvent);
            const dx = currentPoint.x - startPoint.x;
            const dy = currentPoint.y - startPoint.y;
            if (node.type === "circle") {
                const delta = d.axis === "w" ? dx : dy;
                const newR = Math.max(minR, Math.min(maxR, startR + delta));
                engine.updateNodeDimensions(node.id, { radius: newR }, false);
            }
            else if (d.axis === "w") {
                const dir = d.id === "resize-e" ? 1 : -1;
                const newW = Math.max(minW, Math.min(maxW, startW + dir * dx * 2));
                engine.updateNodeDimensions(node.id, { width: newW }, false);
            }
            else {
                const dir = d.id === "resize-s" ? 1 : -1;
                const newH = Math.max(minH, Math.min(maxH, startH + dir * dy * 2));
                engine.updateNodeDimensions(node.id, { height: newH }, false);
            }
        };
        const onMouseUp = () => {
            engine.endOperation();
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
        engine.beginOperation(node.id, 'resize');
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    });
    // Bring all handles to front
    nodeGroup.selectAll("circle.port, circle.rotate-handle, rect.resize-handle").each(function () {
        const el = this;
        if (el.parentNode) {
            el.parentNode.appendChild(el);
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
