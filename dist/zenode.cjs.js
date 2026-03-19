'use strict';

var d3 = require('d3');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var d3__namespace = /*#__PURE__*/_interopNamespaceDefault(d3);

const defaultConfig = {
    canvas: {
        grid: {
            gridEnabled: true,
            gridType: "dotted", // dotted, line , cross , sheet
            gridColor: "#000000",
            gridTransparency: 1,
            gridSize: 20,
            gridShape: 'circle',
            gridDimension: 1,
            sheetDimension: 3,
            crossLength: 2
        },
        backgroundColor: "#ffffff",
        width: 800,
        canvasClasses: ["zenode-canvas"],
        height: 500,
        locked: false
    },
    canvasProperties: {
        zoomEnabled: true,
        zoomExtent: [0.1, 10],
        zoomOnDoubleClick: true,
        zoomOnScroll: true,
        zoomScale: 1,
        zoomDuration: 200,
        panEnabled: true,
        snapToGrid: true,
        alignmentLines: {
            enabled: true,
            color: '#000000',
            width: 2,
            dashed: true,
            dashArray: [2, 3]
        }
        // defaultNodeSpacing: 50,
        // dragType: "smooth"
    },
    shapes: {
        default: {
            "circle": [
                {
                    "id": "circle1",
                    "radius": 30,
                    "color": "#008000",
                    "stroke": { "width": 2, "color": "#000000", "strokeDasharray": [] },
                    "textColor": "#ffffff",
                    "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    "transparency": 1,
                    "overlay": {
                        "enabled": true, // Enable selection overlay
                        "color": "blue", // Example color
                        "strokeWidth": 2, // Example stroke width
                        "opacity": 1,
                        "type": "line"
                    },
                    'previewEnabled': true,
                    'previewTransparency': 0.4
                },
            ],
            "rectangle": [
                {
                    "id": "task0",
                    "width": 120,
                    "height": 60,
                    "color": "#0000ff",
                    "borderRadius": { "leftTop": 3, "leftBottom": 3, "rightTop": 3, "rightBottom": 3 },
                    "stroke": { "width": 2, "color": "#000000", "strokeDasharray": [] },
                    "textColor": "#ffffff",
                    "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    "transparency": 1,
                    "overlay": {
                        "enabled": true, // Enable selection overlay
                        "color": "blue", // Example color
                        "strokeWidth": 2, // Example stroke width
                        "opacity": 1,
                        "type": "line"
                    },
                    'previewEnabled': true,
                    'previewTransparency': 0.4
                },
                {
                    "id": "task1",
                    "width": 100,
                    "height": 50,
                    "color": "#00FFFF",
                    "borderRadius": { "leftTop": 5, "leftBottom": 5, "rightTop": 5, "rightBottom": 5 },
                    "stroke": { "width": 2, "color": "#000000", "strokeDasharray": [] },
                    "textColor": "#000000",
                    "boxShadow": "0px 3px 5px rgba(0, 0, 0, 0.1)",
                    "transparency": 1,
                    "overlay": {
                        "enabled": true, // Enable selection overlay
                        "color": "blue", // Example color
                        "strokeWidth": 2, // Example stroke width
                        "opacity": 1,
                        "type": "line"
                    },
                    'previewEnabled': true,
                    'previewTransparency': 0.4
                }
            ],
            "rhombus": [
                {
                    "id": "rhombus1",
                    "width": 80,
                    "height": 80,
                    "color": "#FF00FF",
                    "stroke": { "width": 2, "color": "#000000", "strokeDasharray": [] },
                    "textColor": "#ffffff",
                    "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    "transparency": 1,
                    "overlay": {
                        "enabled": true, // Enable selection overlay
                        "color": "blue", // Example color
                        "strokeWidth": 2, // Example stroke width
                        "opacity": 1,
                        "type": "line"
                    },
                    'previewEnabled': true,
                    'previewTransparency': 0.4
                }
            ]
        },
        extraShapes: []
    },
    connections: {
        default: {
            straight: {
                type: "line",
                style: "solid",
                color: "#000000",
                width: 2,
                lineStyle: {
                    dashArray: [],
                    innerTextEnabled: false,
                    innerText: "",
                    innerTextColor: "#000000",
                    icon: null,
                    clickFunction: null
                }
            },
            curved: {
                type: "bezier",
                style: "smooth",
                color: "#666666",
                width: 2,
                lineStyle: {
                    dashArray: [],
                    innerTextEnabled: false,
                    innerText: "",
                    innerTextColor: "#000000",
                    icon: null,
                    clickFunction: null
                }
            },
            sShaped: {
                type: "s-shaped",
                style: "smooth",
                color: "#333333",
                width: 2,
                lineStyle: {
                    dashArray: [],
                    innerTextEnabled: false,
                    innerText: "",
                    innerTextColor: "#000000",
                    icon: null,
                    clickFunction: null
                }
            },
            lBent: {
                type: "l-bent",
                style: "cornered",
                color: "#444444",
                width: 2,
                lineStyle: {
                    dashArray: [],
                    innerTextEnabled: false,
                    innerText: "",
                    innerTextColor: "#000000",
                    icon: null,
                    clickFunction: null
                }
            }
        },
        custom: []
    },
    globalProperties: {
        nodeSpacing: 80,
        connectionGap: 10,
        animationEnabled: true,
        validateGridSize: null
    },
    dragOptions: {
        enableDrag: true,
        dragMode: "smooth",
        connectionDraw: "onDragEnd"
    }
};

// src/components/canvas/drawCanvas.ts
function drawCanvas(containerSelector, canvasConfig) {
    const container = d3__namespace.select(containerSelector);
    if (container.empty()) {
        throw new Error(`Container '${containerSelector}' not found in DOM.`);
    }
    let canvasClasses = (canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.canvasClasses) || defaultConfig.canvas.canvasClasses;
    const width = (canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.width) || defaultConfig.canvas.width;
    const height = (canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.height) || defaultConfig.canvas.height;
    const backgroundColor = (canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.backgroundColor) || defaultConfig.canvas.backgroundColor;
    const svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", canvasClasses.join(" "))
        .style("background-color", backgroundColor)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("display", "block")
        .style("margin", "auto");
    const canvasContainerGroup = svg
        .append("g")
        .attr("class", "canvas-container");
    const gridLayout = canvasContainerGroup.append("g").attr("class", "grid");
    const elementsGroup = canvasContainerGroup
        .append("g")
        .attr("class", "elements-group");
    // Insert below preview so layer order: grid, connections, placed-nodes, preview
    const connectionsGroup = canvasContainerGroup
        .insert("g", ".elements-group")
        .attr("class", "connections");
    const placedNodesGroup = canvasContainerGroup
        .insert("g", ".elements-group")
        .attr("class", "placed-nodes");
    const guidesGroup = canvasContainerGroup
        .append("g")
        .attr("class", "guides");
    return {
        grid: gridLayout,
        elements: elementsGroup,
        svg: svg,
        canvasContainer: canvasContainerGroup,
        connections: connectionsGroup,
        placedNodes: placedNodesGroup,
        guides: guidesGroup,
    };
}
function lockedCanvas(locked, svg, zoomBehaviour) {
    if (locked) {
        svg.on(".zoom", null); // Disable zoom and pan
        svg.style("cursor", "default");
        d3__namespace.selectAll(".shape, .connection").style("pointer-events", "none");
    }
    else {
        svg.call(zoomBehaviour); // Enable zoom and pan
        svg.style("cursor", "grab");
        d3__namespace.selectAll(".shape, .connection").style("pointer-events", "all");
    }
    console.log(`Canvas ${locked ? "locked (Preview Mode)" : "unlocked (Edit Mode)"}`);
}

// src/components/canvas/drawGrid.ts
function drawGrid(svg, canvasConfig, grid) {
    var _a, _b, _c, _d, _e;
    //Check if the grid is enabled
    if (!((_a = canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.grid) === null || _a === void 0 ? void 0 : _a.gridEnabled)) {
        return grid;
    }
    // Check Grid Type
    if (((_b = canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.grid) === null || _b === void 0 ? void 0 : _b.gridType) === "dotted") {
        let gridPattern = createDottedGrid(canvasConfig, grid);
        return gridPattern;
    }
    else if (((_c = canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.grid) === null || _c === void 0 ? void 0 : _c.gridType) === "line") {
        let gridPattern = createLineGrid(canvasConfig, grid);
        return gridPattern;
    }
    else if (((_d = canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.grid) === null || _d === void 0 ? void 0 : _d.gridType) === "cross") {
        let gridPattern = createCrossGrid(canvasConfig, grid);
        return gridPattern;
    }
    else if (((_e = canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.grid) === null || _e === void 0 ? void 0 : _e.gridType) === "sheet") {
        let gridPattern = createSquareGrid(canvasConfig, grid);
        return gridPattern;
    }
    else {
        return grid;
    }
}
function toggleGrid(enable) {
    d3__namespace.select(".grid-group").style("display", enable ? "block" : "none");
}
function createDottedGrid(canvasConfig, grid) {
    var _a, _b;
    const pattern = grid
        .append("defs")
        .append("pattern")
        .attr("id", "dotPattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize)
        .attr("height", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize);
    if (canvasConfig.grid.gridShape == "square") {
        pattern
            .append("rect")
            .attr("width", canvasConfig.grid.gridDimension ||
            defaultConfig.canvas.grid.gridDimension)
            .attr("height", canvasConfig.grid.gridDimension ||
            defaultConfig.canvas.grid.gridDimension)
            .attr("fill", canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor);
    }
    else {
        pattern
            .append("circle")
            .attr("cx", ((_a = canvasConfig.grid.gridSize) !== null && _a !== void 0 ? _a : defaultConfig.canvas.grid.gridSize) / 4)
            .attr("cy", ((_b = canvasConfig.grid.gridSize) !== null && _b !== void 0 ? _b : defaultConfig.canvas.grid.gridSize) / 4)
            .attr("r", canvasConfig.grid.gridDimension ||
            defaultConfig.canvas.grid.gridDimension)
            .attr("fill", canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor);
    }
    // Set the Grid
    grid
        .append("rect")
        .attr("x", -(canvasConfig.width * 10000))
        .attr("y", -(canvasConfig.height * 10000))
        .attr("width", canvasConfig.width * 20000)
        .attr("height", canvasConfig.height * 20000)
        .attr("opacity", canvasConfig.grid.gridTransparency || defaultConfig.canvas.grid.gridTransparency)
        .attr("fill", "url(#dotPattern)");
    console.log(grid);
    return grid;
}
function createLineGrid(canvasConfig, grid) {
    const pattern = grid
        .append("defs")
        .append("pattern")
        .attr("id", "linePattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize)
        .attr("height", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize);
    // Draw horizontal and vertical grid lines
    pattern
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize)
        .attr("y2", 0)
        .attr("stroke", canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor)
        .attr("stroke-width", canvasConfig.grid.gridDimension || defaultConfig.canvas.grid.gridDimension);
    pattern
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize)
        .attr("stroke", canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor)
        .attr("stroke-width", canvasConfig.grid.gridDimension || defaultConfig.canvas.grid.gridDimension);
    // Set the Grid
    grid
        .append("rect")
        .attr("x", -((canvasConfig.width || defaultConfig.canvas.width) * 10000))
        .attr("y", -((canvasConfig.height || defaultConfig.canvas.height) * 10000))
        .attr("width", (canvasConfig.width || defaultConfig.canvas.width) * 20000)
        .attr("height", (canvasConfig.height || defaultConfig.canvas.height) * 20000)
        .attr("opacity", canvasConfig.grid.gridTransparency || defaultConfig.canvas.grid.gridTransparency)
        .attr("fill", "url(#linePattern)");
    console.log(grid);
    return grid;
}
function createCrossGrid(canvasConfig, grid) {
    const gridSize = canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize;
    const crossArmLength = canvasConfig.grid.crossLength || (gridSize / 2);
    const strokeWidth = (canvasConfig.grid.gridDimension && canvasConfig.grid.gridDimension > 0)
        ? canvasConfig.grid.gridDimension
        : 1;
    const gridColor = canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor;
    const patternSize = gridSize;
    const pattern = grid.append("defs")
        .append("pattern")
        .attr("id", "crossGridPattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", patternSize)
        .attr("height", patternSize);
    const cx = patternSize / 2;
    const cy = patternSize / 2;
    pattern.append("line")
        .attr("x1", cx - crossArmLength / 2)
        .attr("y1", cy)
        .attr("x2", cx + crossArmLength / 2)
        .attr("y2", cy)
        .attr("stroke", gridColor)
        .attr("stroke-width", strokeWidth);
    pattern.append("line")
        .attr("x1", cx)
        .attr("y1", cy - crossArmLength / 2)
        .attr("x2", cx)
        .attr("y2", cy + crossArmLength / 2)
        .attr("stroke", gridColor)
        .attr("stroke-width", strokeWidth);
    grid.append("rect")
        .attr("x", -(canvasConfig.width * 10000))
        .attr("y", -(canvasConfig.height * 10000))
        .attr("width", canvasConfig.width * 20000)
        .attr("height", canvasConfig.height * 20000)
        .attr("opacity", canvasConfig.grid.gridTransparency || defaultConfig.canvas.grid.gridTransparency)
        .attr("fill", "url(#crossGridPattern)");
    console.log("Cross Grid created:", grid);
    return grid;
}
function createSquareGrid(canvasConfig, // Replace 'any' with your actual Canvas type if available
grid) {
    const gridSize = canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize;
    const thinStroke = (canvasConfig.grid.gridDimension && canvasConfig.grid.gridDimension > 0)
        ? canvasConfig.grid.gridDimension
        : 1;
    const cellsPerBlock = canvasConfig.grid.sheetDimension || defaultConfig.canvas.grid.sheetDimension;
    const thickStroke = thinStroke * cellsPerBlock;
    const blockSize = gridSize * cellsPerBlock;
    const pattern = grid.append("defs")
        .append("pattern")
        .attr("id", "sheetPattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", blockSize)
        .attr("height", blockSize);
    for (let i = 1; i < cellsPerBlock; i++) {
        pattern.append("line")
            .attr("x1", i * gridSize)
            .attr("y1", 0)
            .attr("x2", i * gridSize)
            .attr("y2", blockSize)
            .attr("stroke", canvasConfig.grid.gridColor || "#ccc")
            .attr("stroke-width", thinStroke);
    }
    for (let j = 1; j < cellsPerBlock; j++) {
        pattern.append("line")
            .attr("x1", 0)
            .attr("y1", j * gridSize)
            .attr("x2", blockSize)
            .attr("y2", j * gridSize)
            .attr("stroke", canvasConfig.grid.gridColor || "#ccc")
            .attr("stroke-width", thinStroke);
    }
    pattern.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", blockSize)
        .attr("height", blockSize)
        .attr("fill", "none")
        .attr("stroke", canvasConfig.grid.gridColor || "#ccc")
        .attr("stroke-width", thickStroke);
    grid.append("rect")
        .attr("x", -(canvasConfig.width * 10000))
        .attr("y", -(canvasConfig.height * 10000))
        .attr("width", canvasConfig.width * 20000)
        .attr("height", canvasConfig.height * 20000)
        .attr("opacity", canvasConfig.grid.gridTransparency || defaultConfig.canvas.grid.gridTransparency)
        .attr("fill", "url(#sheetPattern)");
    console.log("Grid created:", grid);
    return grid;
}

class EventManager {
    constructor() {
        this.listeners = {};
    }
    // Register a callback for an event type (e.g., "zoom", "shapePlaced", etc.)
    on(eventType, callback) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        this.listeners[eventType].push(callback);
    }
    // Trigger an event and call all callbacks registered for that event type
    trigger(eventType, event) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach(callback => callback(event));
        }
    }
}

class ZoomManager {
    constructor(container, svg, config, triggerEvent) {
        this.container = container;
        this.config = config;
        this.zoomBehaviour = d3__namespace.zoom()
            .scaleExtent(this.config.canvasProperties.zoomExtent)
            .translateExtent([
            [-1e4, -1e4], [10000, 10000]
        ])
            .filter((event) => {
            if (!this.config.canvasProperties.zoomOnScroll && event.type === "wheel")
                return false;
            if (!this.config.canvasProperties.zoomOnDoubleClick && event.type === "dblclick")
                return false;
            if (!this.config.canvasProperties.panEnabled && event.type === "mousedown")
                return false;
            if (event.type === "wheel")
                return event.ctrlKey || event.metaKey || event.button === 1;
            return true;
        })
            .on("start", (event) => triggerEvent("zoomStart", event))
            .on("zoom", (event) => {
            this.container.attr("transform", event.transform);
            triggerEvent("zoom", event);
        })
            .on("end", (event) => triggerEvent("zoomEnd", event));
        svg.call(this.zoomBehaviour);
        const initialZoom = config.canvasProperties.zoomScale || defaultConfig.canvasProperties.zoomScale;
        const zoomDuration = config.canvasProperties.zoomDuration || defaultConfig.canvasProperties.zoomDuration;
        const initialTransform = d3__namespace.zoomIdentity.scale(initialZoom);
        svg.call(this.zoomBehaviour.transform, initialTransform).transition().duration(zoomDuration);
        //addMarkers
    }
}

function snapToGrid(x, y, grid) {
    const snappedX = Math.round(x / grid) * grid;
    const snappedY = Math.round(y / grid) * grid;
    return { x: snappedX, y: snappedY };
}
/**
 * Generates a unique id for a placed node (nanoid-style short id).
 * Uses crypto.randomUUID when available, otherwise a time-based fallback.
 */
function generatePlacedNodeId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function roundedRectPath(x, y, width, height, r1, // top-left
r2, // top-right
r3, // bottom-right
r4 // bottom-left
) {
    r1 = Math.min(r1, width / 2, height / 2);
    r2 = Math.min(r2, width / 2, height / 2);
    r3 = Math.min(r3, width / 2, height / 2);
    r4 = Math.min(r4, width / 2, height / 2);
    return `M ${x + r1},${y} 
          H ${x + width - r2} 
          A ${r2},${r2} 0 0 1 ${x + width},${y + r2} 
          V ${y + height - r3} 
          A ${r3},${r3} 0 0 1 ${x + width - r3},${y + height} 
          H ${x + r4} 
          A ${r4},${r4} 0 0 1 ${x},${y + height - r4} 
          V ${y + r1} 
          A ${r1},${r1} 0 0 1 ${x + r1},${y} Z`;
}

function svgMouseMove(event, shapeType, shapeToFind, grid, config, canvasObject, data) {
    const gridSize = config.canvas.grid.gridSize || defaultConfig.canvas.grid.gridSize;
    const zoomTransform = d3__namespace.zoomTransform(grid.node());
    const [cursorX, cursorY] = d3__namespace.pointer(event);
    const adjustedX = (cursorX - zoomTransform.x) / zoomTransform.k;
    const adjustedY = (cursorY - zoomTransform.y) / zoomTransform.k;
    let exactPosition;
    if (config.canvasProperties.snapToGrid) {
        exactPosition = snapToGrid(adjustedX, adjustedY, gridSize);
    }
    else {
        exactPosition = { x: adjustedX, y: adjustedY };
    }
    if (shapeToFind.previewEnabled) {
        createShapePreview(shapeType, exactPosition.x, exactPosition.y, canvasObject, shapeToFind);
    }
}
function createShapePreview(shapeType, x, y, canvasObject, shapeToFind) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    removeAllPreview(canvasObject);
    let elementId = `preview_${shapeType}`;
    let shape;
    if (shapeType === "rectangle") {
        // Compute top-left corner assuming shape's position is the center.
        const width = (_a = shapeToFind.width) !== null && _a !== void 0 ? _a : 120;
        const height = (_b = shapeToFind.height) !== null && _b !== void 0 ? _b : 60;
        const x0 = x - width / 2;
        const y0 = y - height / 2;
        const r1 = ((_c = shapeToFind.borderRadius) === null || _c === void 0 ? void 0 : _c.leftTop) || 0;
        const r2 = ((_d = shapeToFind.borderRadius) === null || _d === void 0 ? void 0 : _d.rightTop) || 0;
        const r3 = ((_e = shapeToFind.borderRadius) === null || _e === void 0 ? void 0 : _e.rightBottom) || 0;
        const r4 = ((_f = shapeToFind.borderRadius) === null || _f === void 0 ? void 0 : _f.leftBottom) || 0;
        const pathData = roundedRectPath(x0, y0, width, height, r1, r2, r3, r4);
        shape = canvasObject.elements.append("path")
            .attr("id", elementId)
            .attr("d", pathData)
            .attr("fill", shapeToFind.color)
            .attr("stroke", shapeToFind.stroke.color)
            .attr("stroke-width", shapeToFind.stroke.width)
            .attr("stroke-dasharray", ((_g = shapeToFind.stroke.strokeDasharray) === null || _g === void 0 ? void 0 : _g.join(" ")) || null)
            .attr("opacity", (_h = shapeToFind.previewTransparency) !== null && _h !== void 0 ? _h : 0.5);
    }
    else if (shapeType === "circle") {
        shape = canvasObject.elements.append("circle")
            .attr("id", elementId)
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", (_j = shapeToFind.radius) !== null && _j !== void 0 ? _j : 30)
            .attr("fill", shapeToFind.color)
            .attr("stroke", shapeToFind.stroke.color)
            .attr("stroke-width", shapeToFind.stroke.width)
            .attr("opacity", (_k = shapeToFind.previewTransparency) !== null && _k !== void 0 ? _k : 0.5);
    }
    else if (shapeType === "rhombus") {
        shape = canvasObject.elements.append("polygon")
            .attr("id", elementId)
            .attr("points", `${x},${y - 30} ${x + 30},${y} ${x},${y + 30} ${x - 30},${y}`)
            .attr("fill", shapeToFind.color)
            .attr("stroke", shapeToFind.stroke.color)
            .attr("stroke-width", shapeToFind.stroke.width)
            .attr("opacity", (_l = shapeToFind.previewTransparency) !== null && _l !== void 0 ? _l : 0.5);
    }
    else {
        return null;
    }
    return shape;
}
function removeAllPreview(canvasObject) {
    canvasObject.elements.selectAll("path[id^='preview_'], polygon[id^='preview_'], circle[id^='preview_']").remove();
}

/**
 * Handles canvas click: if a placement is pending (preview active), places the node
 * at the snapped position and clears the preview.
 */
function svgMouseClick(event, api) {
    const ctx = api.getPlacementContext();
    if (!ctx)
        return;
    const point = api.getCanvasPoint(event);
    const { shapeType, shapeConfig } = ctx;
    const node = {
        id: generatePlacedNodeId(),
        type: shapeType,
        shapeVariantId: shapeConfig.id,
        x: point.x,
        y: point.y,
        width: shapeConfig.width,
        height: shapeConfig.height,
        radius: shapeConfig.radius,
        meta: {},
    };
    api.placeNode(node);
    removeAllPreview(api.canvasObject);
    api.clearPlacementContext();
    api.removePlacementListeners();
}

/**
 * Creates and returns a D3 drag behavior for placed nodes.
 */
function createDragBehavior(api) {
    return d3__namespace.drag()
        .on("start", function (event, d) {
        d3__namespace.select(this).raise().classed("dragging", true);
        d.x;
        d.y;
    })
        .on("drag", function (event, d) {
        var _a, _b;
        const gridSize = (_b = (_a = api.config.canvas.grid) === null || _a === void 0 ? void 0 : _a.gridSize) !== null && _b !== void 0 ? _b : 20;
        // Calculate new position
        let newX = event.x;
        let newY = event.y;
        // Snap to grid
        if (api.config.canvasProperties.snapToGrid) {
            const snapped = snapToGrid(newX, newY, gridSize);
            newX = snapped.x;
            newY = snapped.y;
        }
        // Update node in DOM immediately for smoothness
        d3__namespace.select(this).attr("transform", `translate(${newX},${newY})`);
        // Show alignment hints
        renderAlignmentGuides(newX, newY, d.id, api);
        // We don't update state yet to avoid expensive full re-renders during drag
        // (Unless we want connections to follow in real-time. If so, call updateNodePosition here)
        // For Phase 1.2, the requirement is "On drag end, update node position in engine state."
        // However, for connections to follow, we might need it during drag.
        // Let's stick to update on end for now as per 1.2 requirement.
    })
        .on("end", function (event, d) {
        var _a, _b;
        d3__namespace.select(this).classed("dragging", false);
        const gridSize = (_b = (_a = api.config.canvas.grid) === null || _a === void 0 ? void 0 : _a.gridSize) !== null && _b !== void 0 ? _b : 20;
        let finalX = event.x;
        let finalY = event.y;
        if (api.config.canvasProperties.snapToGrid) {
            const snapped = snapToGrid(finalX, finalY, gridSize);
            finalX = snapped.x;
            finalY = snapped.y;
        }
        // Persist to state
        api.updateNodePosition(d.id, finalX, finalY);
        // Clear guides
        if (api.canvasObject.guides) {
            api.canvasObject.guides.selectAll("*").remove();
        }
    });
}
function renderAlignmentGuides(x, y, nodeId, api) {
    if (!api.canvasObject.guides)
        return;
    const nodes = api.getPlacedNodes().filter(n => n.id !== nodeId);
    const guidesLayer = api.canvasObject.guides;
    guidesLayer.selectAll("*").remove();
    const threshold = 5; // Pixels to trigger guide
    const guideColor = "var(--zenode-guide-color, #ffaa00)";
    nodes.forEach(other => {
        // Horizontal alignment
        if (Math.abs(other.y - y) < threshold) {
            guidesLayer.append("line")
                .attr("x1", Math.min(x, other.x) - 100)
                .attr("x2", Math.max(x, other.x) + 100)
                .attr("y1", other.y)
                .attr("y2", other.y)
                .attr("stroke", guideColor)
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "4 4");
        }
        // Vertical alignment
        if (Math.abs(other.x - x) < threshold) {
            guidesLayer.append("line")
                .attr("x1", other.x)
                .attr("x2", other.x)
                .attr("y1", Math.min(y, other.y) - 100)
                .attr("y2", Math.max(y, other.y) + 100)
                .attr("stroke", guideColor)
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "4 4");
        }
    });
}

/**
 * Renders placed nodes using D3 data join. Keeps g.placed-nodes in sync with engine state.
 */
function getShapeStyle(node, config) {
    var _a;
    const list = (_a = config.shapes.default) === null || _a === void 0 ? void 0 : _a[node.type];
    if (!Array.isArray(list))
        return undefined;
    return list.find((s) => s.id === node.shapeVariantId);
}
function drawPlacedRectangle(g, style) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const width = (_a = style.width) !== null && _a !== void 0 ? _a : 120;
    const height = (_b = style.height) !== null && _b !== void 0 ? _b : 60;
    const x0 = -width / 2;
    const y0 = -height / 2;
    const r1 = (_d = (_c = style.borderRadius) === null || _c === void 0 ? void 0 : _c.leftTop) !== null && _d !== void 0 ? _d : 0;
    const r2 = (_f = (_e = style.borderRadius) === null || _e === void 0 ? void 0 : _e.rightTop) !== null && _f !== void 0 ? _f : 0;
    const r3 = (_h = (_g = style.borderRadius) === null || _g === void 0 ? void 0 : _g.rightBottom) !== null && _h !== void 0 ? _h : 0;
    const r4 = (_k = (_j = style.borderRadius) === null || _j === void 0 ? void 0 : _j.leftBottom) !== null && _k !== void 0 ? _k : 0;
    const pathData = roundedRectPath(x0, y0, width, height, r1, r2, r3, r4);
    g.append("path")
        .attr("d", pathData)
        .attr("fill", style.color)
        .attr("stroke", style.stroke.color)
        .attr("stroke-width", style.stroke.width)
        .attr("stroke-dasharray", ((_l = style.stroke.strokeDasharray) === null || _l === void 0 ? void 0 : _l.length) ? style.stroke.strokeDasharray.join(" ") : null);
}
function drawPlacedCircle(g, style) {
    var _a, _b;
    const r = (_a = style.radius) !== null && _a !== void 0 ? _a : 30;
    g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", r)
        .attr("fill", style.color)
        .attr("stroke", style.stroke.color)
        .attr("stroke-width", style.stroke.width)
        .attr("stroke-dasharray", ((_b = style.stroke.strokeDasharray) === null || _b === void 0 ? void 0 : _b.length) ? style.stroke.strokeDasharray.join(" ") : null);
}
function drawPlacedRhombus(g, style) {
    var _a, _b;
    const size = (_a = style.width) !== null && _a !== void 0 ? _a : 60;
    const points = `0,${-size / 2} ${size / 2},0 0,${size / 2} ${-size / 2},0`;
    g.append("polygon")
        .attr("points", points)
        .attr("fill", style.color)
        .attr("stroke", style.stroke.color)
        .attr("stroke-width", style.stroke.width)
        .attr("stroke-dasharray", ((_b = style.stroke.strokeDasharray) === null || _b === void 0 ? void 0 : _b.length) ? style.stroke.strokeDasharray.join(" ") : null);
}
/**
 * Renders the placed nodes layer using a D3 data join. Call after state changes.
 * @param placedNodesGroup - D3 selection for g.placed-nodes
 * @param placedNodes - Current array of placed nodes
 * @param config - Engine config for shape styles
 */
function renderPlacedNodes(placedNodesGroup, placedNodes, api) {
    const dragBehavior = createDragBehavior(api);
    const binding = placedNodesGroup
        .selectAll("g.node")
        .data(placedNodes, (d) => d.id);
    binding
        .join((enter) => {
        const g = enter
            .append("g")
            .attr("class", "node placed-node")
            .attr("data-id", (d) => d.id)
            .attr("transform", (d) => `translate(${d.x},${d.y})`)
            .call(dragBehavior);
        g.each(function (d) {
            const style = getShapeStyle(d, api.config);
            if (!style)
                return;
            const el = d3__namespace.select(this);
            if (d.type === "rectangle")
                drawPlacedRectangle(el, style);
            else if (d.type === "circle")
                drawPlacedCircle(el, style);
            else if (d.type === "rhombus")
                drawPlacedRhombus(el, style);
        });
        return g;
    }, (update) => update.attr("transform", (d) => `translate(${d.x},${d.y})`), (exit) => exit.remove());
}

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

function mergeConfig(userConfig) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17;
    return {
        canvas: {
            width: (_b = (_a = userConfig.canvas) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : defaultConfig.canvas.width,
            height: (_d = (_c = userConfig.canvas) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : defaultConfig.canvas.height,
            backgroundColor: (_f = (_e = userConfig.canvas) === null || _e === void 0 ? void 0 : _e.backgroundColor) !== null && _f !== void 0 ? _f : defaultConfig.canvas.backgroundColor,
            canvasClasses: (_h = (_g = userConfig.canvas) === null || _g === void 0 ? void 0 : _g.canvasClasses) !== null && _h !== void 0 ? _h : defaultConfig.canvas.canvasClasses,
            locked: (_k = (_j = userConfig.canvas) === null || _j === void 0 ? void 0 : _j.locked) !== null && _k !== void 0 ? _k : defaultConfig.canvas.locked,
            grid: {
                gridEnabled: (_o = (_m = (_l = userConfig.canvas) === null || _l === void 0 ? void 0 : _l.grid) === null || _m === void 0 ? void 0 : _m.gridEnabled) !== null && _o !== void 0 ? _o : defaultConfig.canvas.grid.gridEnabled,
                gridType: (_r = (_q = (_p = userConfig.canvas) === null || _p === void 0 ? void 0 : _p.grid) === null || _q === void 0 ? void 0 : _q.gridType) !== null && _r !== void 0 ? _r : defaultConfig.canvas.grid.gridType,
                gridSize: (_u = (_t = (_s = userConfig.canvas) === null || _s === void 0 ? void 0 : _s.grid) === null || _t === void 0 ? void 0 : _t.gridSize) !== null && _u !== void 0 ? _u : defaultConfig.canvas.grid.gridSize,
                gridColor: (_x = (_w = (_v = userConfig.canvas) === null || _v === void 0 ? void 0 : _v.grid) === null || _w === void 0 ? void 0 : _w.gridColor) !== null && _x !== void 0 ? _x : defaultConfig.canvas.grid.gridColor,
                gridDimension: (_0 = (_z = (_y = userConfig.canvas) === null || _y === void 0 ? void 0 : _y.grid) === null || _z === void 0 ? void 0 : _z.gridDimension) !== null && _0 !== void 0 ? _0 : defaultConfig.canvas.grid.gridDimension,
                gridTransparency: (_3 = (_2 = (_1 = userConfig.canvas) === null || _1 === void 0 ? void 0 : _1.grid) === null || _2 === void 0 ? void 0 : _2.gridTransparency) !== null && _3 !== void 0 ? _3 : defaultConfig.canvas.grid.gridTransparency,
                gridShape: (_6 = (_5 = (_4 = userConfig.canvas) === null || _4 === void 0 ? void 0 : _4.grid) === null || _5 === void 0 ? void 0 : _5.gridShape) !== null && _6 !== void 0 ? _6 : defaultConfig.canvas.grid.gridShape,
                crossLength: (_9 = (_8 = (_7 = userConfig.canvas) === null || _7 === void 0 ? void 0 : _7.grid) === null || _8 === void 0 ? void 0 : _8.crossLength) !== null && _9 !== void 0 ? _9 : defaultConfig.canvas.grid.crossLength,
                sheetDimension: (_12 = (_11 = (_10 = userConfig.canvas) === null || _10 === void 0 ? void 0 : _10.grid) === null || _11 === void 0 ? void 0 : _11.sheetDimension) !== null && _12 !== void 0 ? _12 : defaultConfig.canvas.grid.sheetDimension
            }
        },
        canvasProperties: (_13 = userConfig.canvasProperties) !== null && _13 !== void 0 ? _13 : defaultConfig.canvasProperties,
        shapes: (_14 = userConfig.shapes) !== null && _14 !== void 0 ? _14 : defaultConfig.shapes,
        connections: (_15 = userConfig.connections) !== null && _15 !== void 0 ? _15 : defaultConfig.connections,
        globalProperties: (_16 = userConfig.globalProperties) !== null && _16 !== void 0 ? _16 : defaultConfig.globalProperties,
        dragOptions: (_17 = userConfig.dragOptions) !== null && _17 !== void 0 ? _17 : defaultConfig.dragOptions
    };
}

// src/core/engine.ts
class ZenodeEngine {
    constructor(container, config) {
        this.shapeMap = new Map();
        this.shapes = new Map();
        this.connections = [];
        /** Placed nodes on the canvas. Source of truth for g.placed-nodes layer. */
        this.placedNodes = [];
        /** When set, next click will place a node of this type/config (preview → placed). */
        this.placementContext = null;
        this.canvasObject = {
            svg: null,
            grid: null,
            elements: null,
            canvasContainer: null,
            connections: null,
            placedNodes: null,
            guides: null,
        };
        this.container = container;
        this.config = mergeConfig(config);
        this.eventManager = new EventManager();
        this.initializeCanvas();
    }
    initializeCanvas() {
        this.canvasObject = drawCanvas(this.container ? `#${this.container.id}` : "body", this.config.canvas);
        this.svg = this.canvasObject.svg;
        this.grid = drawGrid(this.svg, this.config.canvas, this.canvasObject.grid);
        this.alignmentLine = this.svg.append("g").attr("class", "alignment-line");
        this.canvasContainerGroup = this.canvasObject.canvasContainer;
        this.zoomManager = new ZoomManager(this.canvasContainerGroup, this.svg, this.config, (eventType, event) => {
            this.eventManager.trigger(eventType, event);
        });
        console.log("SVG canvas and grid created.");
    }
    on(eventType, callback) {
        this.eventManager.on(eventType, callback);
    }
    /** Returns current placement context (shape type + config for next click). */
    getPlacementContext() {
        return this.placementContext;
    }
    /** Sets placement context so the next canvas click places a node of this type/config. */
    setPlacementContext(shapeType, shapeConfig) {
        this.placementContext = { shapeType, shapeConfig };
    }
    /** Clears placement context (e.g. after placing or cancel). */
    clearPlacementContext() {
        this.placementContext = null;
    }
    /** Removes mousemove and click handlers used for placement; stops preview. */
    removePlacementListeners() {
        this.svg.on("mousemove", null);
        this.svg.on("click", null);
    }
    /**
     * Places a node on the canvas: appends to state and re-renders g.placed-nodes.
     * @param node - Node to place (id must be unique; use generatePlacedNodeId() if creating new).
     */
    placeNode(node) {
        this.placedNodes = [...this.placedNodes, node];
        if (this.canvasObject.placedNodes) {
            renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
        }
        this.eventManager.trigger("node:placed", { node });
    }
    /** Returns a copy of the current placed nodes (immutable). */
    getPlacedNodes() {
        return [...this.placedNodes];
    }
    /**
     * Updates a placed node's position and triggers sub-renders.
     */
    updateNodePosition(id, x, y) {
        this.placedNodes = this.placedNodes.map((n) => (n.id === id ? Object.assign(Object.assign({}, n), { x, y }) : n));
        // Re-render nodes (this might be handled by the renderer d3 join,
        // but we need to ensure connections follow)
        if (this.canvasObject.connections) {
            this.reRenderConnections();
        }
        this.eventManager.trigger("node:moved", { id, x, y });
    }
    reRenderConnections() {
        if (this.canvasObject.connections) {
            renderConnections(this.canvasObject.connections, this.connections, this.placedNodes);
        }
    }
    /**
     * Converts a mouse event to canvas coordinates (with optional grid snap).
     * Used for placement and hit-testing.
     */
    getCanvasPoint(event) {
        var _a, _b;
        const gridSize = (_b = (_a = this.config.canvas.grid) === null || _a === void 0 ? void 0 : _a.gridSize) !== null && _b !== void 0 ? _b : 20;
        const zoomTransform = d3__namespace.zoomTransform(this.svg.node());
        const [cursorX, cursorY] = d3__namespace.pointer(event, this.svg.node());
        const adjustedX = (cursorX - zoomTransform.x) / zoomTransform.k;
        const adjustedY = (cursorY - zoomTransform.y) / zoomTransform.k;
        if (this.config.canvasProperties.snapToGrid) {
            return snapToGrid(adjustedX, adjustedY, gridSize);
        }
        return { x: adjustedX, y: adjustedY };
    }
    /**
     * Creates a shape on the canvas (preview on move, place on click).
     * @param shapeType - Type of shape ('rectangle', 'circle', 'rhombus').
     * @param id - Shape variant id from config (e.g. 'task0').
     * @param data - Optional inner content for preview
     */
    createShape(shapeType, id, data) {
        var _a, _b;
        const shapeList = (_b = (_a = this.config.shapes.default) === null || _a === void 0 ? void 0 : _a[shapeType]) !== null && _b !== void 0 ? _b : [];
        if (!shapeList.length) {
            console.error(`No shapes found for type "${shapeType}".`);
            return;
        }
        const shapeToFind = shapeList.find((shape) => shape.id === id);
        if (!shapeToFind) {
            console.error(`Shape ID "${id}" not found in type "${shapeType}".`);
            return;
        }
        this.removePlacementListeners();
        this.setPlacementContext(shapeType, shapeToFind);
        this.svg.on("mousemove", (event) => svgMouseMove(event, shapeType, shapeToFind, this.grid, this.config, this.canvasObject));
        this.svg.on("click", (event) => svgMouseClick(event, this));
    }
    /**
     * Creates a connection between two placed nodes by their node ids.
     * (Full connector UI is Phase 2; this records the connection in state.)
     * @param sourceNodeId - Placed node id (from getPlacedNodes()[i].id).
     * @param targetNodeId - Placed node id.
     */
    createConnection(sourceNodeId, targetNodeId) {
        const fromExists = this.placedNodes.some((n) => n.id === sourceNodeId);
        const toExists = this.placedNodes.some((n) => n.id === targetNodeId);
        if (!fromExists || !toExists) {
            console.warn(`One or both nodes do not exist. Use getPlacedNodes() to get valid node ids.`);
            return;
        }
        const connection = {
            id: `conn-${sourceNodeId}-${targetNodeId}`,
            sourceNodeId,
            targetNodeId,
            type: "straight",
        };
        this.connections = [...this.connections, connection];
        if (this.canvasObject.connections) {
            renderConnections(this.canvasObject.connections, this.connections, this.placedNodes);
        }
        this.eventManager.trigger("connection:created", { connection });
    }
    lockedTheCanvas(locked) {
        lockedCanvas(locked, this.svg, this.zoomBehaviour);
    }
    gridToggles(toggle) {
        toggleGrid(toggle);
    }
}

let engineInstance = null;
/**
 * Initializes the Zenode engine.
 * @param containerSelector The selector for the container element.
 * @param userConfig Optional custom configuration.
 * @throws Error if container is not found.
 */
function initializeCanvas(containerSelector, userConfig) {
    if (!engineInstance) {
        const inputConfig = Object.assign({}, userConfig);
        console.log(inputConfig);
        const container = document.querySelector(containerSelector);
        if (!container) {
            throw new Error(`Container '${containerSelector}' not found in DOM.`);
        }
        engineInstance = new ZenodeEngine(container, inputConfig);
    }
    else {
        console.warn("ZenodeEngine is already initialized!");
    }
}
/**
 * Creates a shape dynamically on the canvas.
 * @param type Shape type (e.g., "rectangle", "circle").
 * @param name Optional shape name.
 * @throws Error if engine is not initialized or parameters are invalid.
 */
function createShape(type, id) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initialize() first.");
    }
    if (typeof type !== "string" || !["rectangle", "circle", "rhombus"].includes(type)) {
        throw new Error(`Invalid shape type '${type}'. Supported types: rectangle, circle, rhombus.`);
    }
    engineInstance.createShape(type, id);
    // engineInstance.createShape(type, x, y, name);
}
/**
 * Creates a connection between two shapes.
 * @param from The ID or name of the first shape.
 * @param to The ID or name of the second shape.
 * @throws Error if engine is not initialized or shapes are missing.
 */
function createConnection(from, to) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initialize() first.");
    }
    if (!from || !to) {
        throw new Error("Both 'from' and 'to' shape names are required.");
    }
    engineInstance.createConnection(from, to);
}
/**
 * Returns the list of placed nodes (for use with createConnection node ids).
 */
function getPlacedNodes() {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
    }
    return engineInstance.getPlacedNodes();
}
/**
 * Connects the first two placed nodes. Convenience for demos.
 * @returns true if a connection was created, false otherwise
 */
function connectFirstTwoNodes() {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
    }
    const nodes = engineInstance.getPlacedNodes();
    if (nodes.length < 2) {
        console.warn("Place at least 2 shapes on the canvas, then click Connect.");
        return false;
    }
    engineInstance.createConnection(nodes[0].id, nodes[1].id);
    return true;
}

exports.connectFirstTwoNodes = connectFirstTwoNodes;
exports.createConnection = createConnection;
exports.createShape = createShape;
exports.getPlacedNodes = getPlacedNodes;
exports.initializeCanvas = initializeCanvas;
//# sourceMappingURL=zenode.cjs.js.map
