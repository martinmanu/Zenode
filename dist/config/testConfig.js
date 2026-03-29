// See reusable keyboard shortcut sample:
// src/examples/keyboard-shortcuts.ts
const testConfig = {
    canvas: {
        grid: {
            gridEnabled: true,
            gridType: "dotted",
            gridColor: "#2b88deff",
            gridTransparency: 0.5,
            gridSize: 20,
            gridShape: 'circle',
            gridDimension: 1,
            sheetDimension: 4,
            crossLength: 10
        },
        backgroundColor: "#ffffffff",
        width: 800,
        height: 500,
        canvasClasses: ["test-canvas"],
        locked: false
    },
    canvasProperties: {
        zoomEnabled: true,
        zoomExtent: [0.1, 8],
        zoomOnDoubleClick: true,
        zoomOnScroll: true,
        zoomScale: 0.55,
        zoomDuration: 600,
        panEnabled: true,
        snapToGrid: true,
        alignmentLines: {
            enabled: true,
            color: '#1ee80c',
            width: 2,
            dashed: true,
            dashArray: [2, 3],
            alignmentThreshold: 5,
            edgeGuides: {
                enabled: true,
                color: '#340ce8',
                width: 2,
                dashed: true,
                dashArray: [2, 3],
            },
            centerGuides: {
                enabled: true,
                color: '#d9e80c',
                width: 2,
                dashed: true,
                dashArray: [2, 3],
            },
            guideLineMode: 'full'
        },
        lassoStyle: {
            enabled: true,
            strokeColor: '#005bc4',
            strokeWidth: 1,
            dashed: true,
            dashArray: [4, 2],
            fillColor: '#619fe787',
            fillOpacity: 0.12,
            cursor: 'crosshair',
            activeCursor: 'crosshair'
        },
        allowMultipleConnections: true,
        ghostConnection: {
            enabled: true,
            color: '#005bc4',
            strokeWidth: 2,
            dashed: true,
            dashArray: [4, 4],
            opacity: 1
        },
        keyboardShortcuts: {
            enabled: true,
            deleteSelection: ["Delete", "Backspace"],
            clearSelection: ["Escape"],
            customBindings: {
                "selection:clear": ["Ctrl+D"],
                "canvas:log-state": ["Ctrl+Shift+L"]
            },
            callbacks: {
                onDeleteSelection: ({ selectedNodeIds }) => {
                    console.log("[keys] delete selection", selectedNodeIds);
                    // return false here if you want to fully override default delete behavior.
                },
                onClearSelection: ({ engine }) => {
                    console.log("[keys] clear selection");
                    // Example plugin-style hook usage:
                    // (engine as any).emit?.("plugin:selection:cleared");
                },
                custom: {
                    "selection:clear": ({ engine }) => {
                        var _a, _b;
                        // Ctrl+D -> clear selection using engine API.
                        (_b = (_a = engine).clearSelection) === null || _b === void 0 ? void 0 : _b.call(_a);
                    },
                    "canvas:log-state": ({ engine }) => {
                        var _a, _b, _c;
                        const nodes = (_c = (_b = (_a = engine).getPlacedNodes) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : [];
                        console.log("[keys] nodes on canvas:", nodes.length);
                    }
                }
            }
        },
        ports: {
            enabled: true,
            radius: 5,
            fillColor: "#ffffff",
            strokeColor: "#000000",
            strokeWidth: 1,
            opacity: 1,
            showOnHoverOnly: false,
            cursor: "crosshair"
        },
        contextPad: {
            enabled: true,
            trigger: "select",
            position: "top-right",
            offset: { x: 10, y: -10 },
            showDefaults: true,
            layout: "grid", // Options: "horizontal", "vertical", "grid"
            gridColumns: 2,
            style: {
                backgroundColor: "rgba(255, 255, 255, 0)", // White background a la BPMN
                borderColor: "rgba(200, 200, 200, 0)",
                borderWidth: "1px",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0)",
                backdropBlur: "0px",
                padding: "4px",
                buttonWidth: "28px",
                buttonHeight: "28px",
                buttonPadding: "4px",
                buttonMargin: "2px",
                iconColor: "#202020ff",
                buttonHoverColor: "rgba(198, 255, 196, 1)",
                buttonActiveColor: "rgba(124, 172, 255, 1)"
            }
        }
        // dragType: "smooth"
    },
    shapes: {
        default: {
            "circle": [
                {
                    "id": "circle1",
                    "radius": 30,
                    "color": "#ff00008e",
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
                    "width": 60,
                    "height": 60,
                    "color": "#CDFE9B",
                    "borderRadius": { "leftTop": 50, "leftBottom": 50, "rightTop": 5, "rightBottom": 5 },
                    "stroke": { "width": 2, "color": "#000000", "strokeDasharray": [6, 3] },
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
                    "width": 240,
                    "height": 120,
                    "color": "#00ffff4c",
                    "borderRadius": { "leftTop": 5, "leftBottom": 5, "rightTop": 5, "rightBottom": 5 },
                    "stroke": { "width": 6, "color": "#0af7ffff", "strokeDasharray": [] },
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
                },
                {
                    "id": "rectangle1",
                    "width": 150,
                    "height": 75,
                    "color": "#3b82f64c",
                    "borderRadius": { "leftTop": 12, "leftBottom": 12, "rightTop": 12, "rightBottom": 12 },
                    "stroke": { "width": 2, "color": "#3b82f6", "strokeDasharray": [] },
                    "textColor": "#ffffff",
                    "boxShadow": "0px 4px 10px rgba(0, 0, 0, 0.2)",
                    "transparency": 1,
                    "overlay": {
                        "enabled": true,
                        "color": "white",
                        "strokeWidth": 2,
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
                    "color": "#ff005188",
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
        defaultType: "straight",
        default: {
            straight: {
                type: "line",
                style: "solid",
                color: "#000000",
                width: 2,
                dashed: true, // Example toggle
                animated: true, // Example toggle
                lineStyle: {
                    dashArray: [8, 4],
                    animation: { type: "flow", speed: 5 },
                    markerEnd: "arrow",
                    innerTextEnabled: false,
                    innerText: "",
                    innerTextColor: "#000000",
                    innerTextSize: 12,
                    labelBackground: "#ffffff",
                    labelPadding: 4,
                    labelBorderRadius: 4,
                    icon: null,
                    clickFunction: null
                }
            },
            curved: {
                type: "bezier",
                style: "smooth",
                color: "#666666",
                width: 2,
                dashed: true,
                animated: true,
                lineStyle: {
                    dashArray: [8, 4],
                    animation: { type: "flow", speed: 2 },
                    markerEnd: "arrow",
                    innerTextEnabled: false,
                    innerText: "",
                    innerTextColor: "#000000",
                    innerTextSize: 12,
                    labelBackground: "#ffffff",
                    labelPadding: 4,
                    labelBorderRadius: 4,
                    icon: null,
                    clickFunction: null
                }
            },
            's-shaped': {
                type: "s-shaped",
                style: "smooth",
                color: "#333333",
                width: 2,
                dashed: true,
                animated: true,
                lineStyle: {
                    dashArray: [4, 2],
                    animation: { type: "flow", speed: 1 },
                    markerEnd: "arrow",
                    innerTextEnabled: false,
                    innerText: "",
                    innerTextColor: "#000000",
                    innerTextSize: 12,
                    labelBackground: "#ffffff",
                    labelPadding: 4,
                    labelBorderRadius: 4,
                    icon: null,
                    clickFunction: null
                }
            },
            'l-bent': {
                type: "l-bent",
                style: "cornered",
                color: "#444444",
                width: 2,
                dashed: true,
                animated: true,
                lineStyle: {
                    dashArray: [8, 4],
                    animation: { type: "flow", speed: 2 },
                    markerEnd: "arrow",
                    innerTextEnabled: false,
                    innerText: "",
                    innerTextColor: "#000000",
                    innerTextSize: 12,
                    labelBackground: "#ffffff",
                    labelPadding: 4,
                    labelBorderRadius: 4,
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

export { testConfig };
//# sourceMappingURL=testConfig.js.map
