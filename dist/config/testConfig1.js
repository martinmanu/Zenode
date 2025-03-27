export const testConfig = {
    canvas: {
        grid: {
            gridEnabled: false, // No grid lines, more freedom
            gridType: "line", // Line grid for a clear view
            gridColor: "#FF6347", // Tomato red for grid color
            gridTransparency: 0.5, // 50% transparency for grid
            gridSize: 30, // Slightly larger grid size
            gridShape: 'square',
            gridDimension: 1.5
        },
        backgroundColor: "#F0F8FF", // Alice blue background
        width: 1200, // Bigger canvas
        height: 700, // Bigger canvas height
        locked: true // Lock the canvas size and properties
    },
    canvasProperties: {
        zoomEnabled: false, // Disable zooming
        panEnabled: true, // Enable panning
        snapToGrid: false, // Disable snapping to grid
        defaultNodeSpacing: 70, // Slightly bigger node spacing
        dragType: "smooth" // Keep drag smooth
    },
    shapes: {
        default: {
            circle: {
                radius: 40, // Bigger circle
                color: "#FFD700", // Golden color for circle
                stroke: { width: 3, color: "#8B0000" }, // Dark red border
                textColor: "#00008B", // Dark blue text
                boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.3)" // More pronounced shadow
            },
            rectangle: {
                width: 150, // Wider rectangle
                height: 80, // Taller rectangle
                color: "#32CD32", // Lime green rectangle
                borderRadius: { leftTop: 10, leftBottom: 10, rightTop: 10, rightBottom: 10 },
                stroke: { width: 3, color: "#8B0000" }, // Dark red border
                textColor: "#00008B", // Dark blue text
                boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.3)" // More pronounced shadow
            }
        },
        extraShapes: [
            {
                type: "triangle",
                size: 100,
                color: "#FF4500", // Orange red triangle
                stroke: { width: 2, color: "#000000" }, // Black border
                textColor: "#FFFFFF", // White text
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)"
            }
        ]
    },
    connections: {
        default: {
            straight: {
                type: "line",
                style: "dotted", // Dotted lines for a dynamic look
                color: "#DC143C", // Crimson color
                width: 3, // Thicker line
                lineStyle: {
                    dashArray: [5, 5], // Dotted style
                    innerTextEnabled: true, // Inner text enabled
                    innerText: "Connection", // Label text for connection
                    innerTextColor: "#000000", // Black text color
                    icon: null,
                    clickFunction: null
                }
            },
            curved: {
                type: "bezier",
                style: "smooth",
                color: "#4682B4", // Steel blue color
                width: 3,
                lineStyle: {
                    dashArray: [10, 5], // Dotted with larger gaps
                    innerTextEnabled: true,
                    innerText: "Curved Path", // Label for curved connection
                    innerTextColor: "#FFFFFF", // White text color
                    icon: null,
                    clickFunction: null
                }
            },
            sShaped: {
                type: "s-shaped",
                style: "smooth",
                color: "#2E8B57", // Sea green color
                width: 3,
                lineStyle: {
                    dashArray: [3, 6], // Smaller dotted style
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
                color: "#FF1493", // Deep pink color
                width: 3,
                lineStyle: {
                    dashArray: [4, 6], // Dotted L-shaped line
                    innerTextEnabled: true,
                    innerText: "L-Bend", // Label for L-bend connection
                    innerTextColor: "#000000", // Black text color
                    icon: null,
                    clickFunction: null
                }
            }
        },
        custom: []
    },
    globalProperties: {
        nodeSpacing: 100, // More space between nodes
        connectionGap: 15, // Bigger gap between connections
        animationEnabled: false, // Disable animations for performance
        validateGridSize: 50 // Custom grid size validation
    },
    dragOptions: {
        enableDrag: true,
        dragMode: "smooth",
        connectionDraw: "onDragEnd"
    }
};
//# sourceMappingURL=testConfig1.js.map