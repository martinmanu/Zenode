// See reusable keyboard shortcut sample:
// src/examples/keyboard-shortcuts.ts
const testConfig = {
    canvas: {
        grid: {
            gridEnabled: true,
            gridType: "dotted",
            gridColor: "#0000FF",
            gridTransparency: 0.5,
            gridSize: 20,
            gridShape: 'circle',
            gridDimension: 1,
            sheetDimension: 4,
            crossLength: 10
        },
        backgroundColor: "#FFFFFF",
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
            color: '#ad1111',
            width: 2,
            dashed: true,
            dashArray: [2, 3],
            guideLineMode: 'full'
        },
        lassoStyle: {
            enabled: true,
            strokeColor: '#4A90E2',
            strokeWidth: 1,
            dashed: true,
            dashArray: [4, 2],
            fillColor: '#4A90E2',
            fillOpacity: 0.12,
            cursor: 'crosshair',
            activeCursor: 'crosshair'
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
        }
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

export { testConfig };
//# sourceMappingURL=testConfig.js.map
