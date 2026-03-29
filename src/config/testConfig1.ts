import { Config } from "../model/configurationModel";

export const testConfig: Config = {
  canvas: {
    grid: {
      gridEnabled: false, // No grid lines, more freedom
      gridType: "line", // Line grid for a clear view
      gridColor: "#FF6347", // Tomato red for grid color
      gridTransparency: 0.5, // 50% transparency for grid
      gridSize: 30, // Slightly larger grid size
      gridShape: "square", // square or circle
      gridDimension: 1.5,
    },
    backgroundColor: "#F0F8FF", // Alice blue background
    width: 1200, // Bigger canvas
    canvasClasses: ["test1-canvas"], //user can assign css classes
    height: 700, // Bigger canvas height
    locked: true, // Lock the canvas size and properties
  },
  canvasProperties: {
    zoomExtent: [0.1, 10], //MIN ZOOM  and Max zoom
    zoomEnabled: false, // Disable zooming
    zoomOnDoubleClick: true,
    zoomScale: 0.55,
    zoomDuration: 600, // in as ms
    zoomOnScroll: true,
    panEnabled: true, // Enable panning
    snapToGrid: false, // Disable snapping to grid
    alignmentLines: {
      enabled: true,
      color: '#000000',
      width: 2,
      dashed: true,
      dashArray: [2,3],
      alignmentThreshold: 5,
      edgeGuides: {
        enabled: true,
        color: '#000000',
        width: 2,
        dashed: true,
        dashArray: [2, 3]
      },
      centerGuides: {
        enabled: true,
        color: '#ffaa00',
        width: 2,
        dashed: true,
        dashArray: [2, 3]
      },
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
    allowMultipleConnections: true,
    ghostConnection: {
      enabled: true,
      color: '#4A90E2',
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
        "selection:clear": ["Ctrl+D"]
      },
      callbacks: {}
    },
    ports: {
      enabled: true,
      radius: 5,
      fillColor: '#4A90E2',
      strokeColor: '#ffffff',
      strokeWidth: 1,
      opacity: 1,
      showOnHoverOnly: true,
      cursor: 'crosshair'
    }
    // dragType: "smooth", // Keep drag smooth
  },
  shapes: {
    default: {
      "circle": [
        {
          "id": "circle1",
          "radius": 30,
          "color": "#008000",
          "stroke": { "width": 2, "color": "#000000", "strokeDasharray": []},
          "textColor": "#ffffff",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.1)",
          "transparency" : 1,
          "overlay": {
            "enabled": true,  // Enable selection overlay
            "color": "blue",  // Example color
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
          "stroke": { "width": 2, "color": "#000000", "strokeDasharray": []},
          "textColor": "#ffffff",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.1)",
          "transparency" : 1,
          "overlay": {
            "enabled": true,  // Enable selection overlay
            "color": "blue",  // Example color
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
          "stroke": { "width": 2, "color": "#000000", "strokeDasharray": []},
          "textColor": "#000000",
          "boxShadow": "0px 3px 5px rgba(0, 0, 0, 0.1)",
          "transparency" : 1,
          "overlay": {
            "enabled": true,  // Enable selection overlay
            "color": "blue",  // Example color
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
          "stroke": { "width": 2, "color": "#000000", "strokeDasharray": []},
          "textColor": "#ffffff",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.1)",
          "transparency" : 1,
          "overlay": {
            "enabled": true,  // Enable selection overlay
            "color": "blue",  // Example color
            "strokeWidth": 2, // Example stroke width
            "opacity": 1,
            "type": "line"
          },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ]
    },
    extraShapes: [
    ],
  },
  connections: {
    defaultType: "straight",
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
          innerTextSize: 12,
          labelBackground: "#ffffff",
          labelPadding: 4,
          labelBorderRadius: 4,
          icon: null,
          clickFunction: null,
        },
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
          innerTextSize: 12,
          labelBackground: "#4682B4",
          labelPadding: 4,
          labelBorderRadius: 4,
          icon: null,
          clickFunction: null,
        },
      },
      's-shaped': {
        type: "s-shaped",
        style: "smooth",
        color: "#2E8B57", // Sea green color
        width: 3,
        lineStyle: {
          dashArray: [3, 6], // Smaller dotted style
          innerTextEnabled: false,
          innerText: "",
          innerTextColor: "#000000",
          innerTextSize: 12,
          labelBackground: "#ffffff",
          labelPadding: 4,
          labelBorderRadius: 4,
          icon: null,
          clickFunction: null,
        },
      },
      'l-bent': {
        type: "l-bent",
        style: "cornered",
        color: "#FF1493", // Deep pink color
        width: 3,
        lineStyle: {
          dashArray: [4, 6], // Dotted L-shaped line
          innerTextEnabled: true,
          innerText: "L-Bend", // Label for L-bend connection
          innerTextColor: "#000000", // Black text color
          innerTextSize: 12,
          labelBackground: "#ffffff",
          labelPadding: 4,
          labelBorderRadius: 4,
          icon: null,
          clickFunction: null,
        },
      },
    },
    custom: [],
  },
  globalProperties: {
    nodeSpacing: 100, // More space between nodes
    connectionGap: 15, // Bigger gap between connections
    animationEnabled: false, // Disable animations for performance
    validateGridSize: 50, // Custom grid size validation
  },
  dragOptions: {
    enableDrag: true,
    dragMode: "smooth",
    connectionDraw: "onDragEnd",
  },
};
