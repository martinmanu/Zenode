import { Config } from "../model/configurationModel"
// See reusable keyboard shortcut sample:
// src/examples/keyboard-shortcuts.ts

export const testConfig: Config = {
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
    ghostPreview: {
      enabled: true,
      strokeColor: '#000000ff',
      strokeWidth: 1.5,
      strokeDashArray: [4, 4],
      fillColor: 'transparent',
      opacity: 0.7,
      filter: 'blur(0.5px)'
    },
    groupGhostPreview: {
      enabled: true,
      strokeColor: '#000000ff',
      strokeWidth: 1.5,
      strokeDashArray: [4, 4],
      fillColor: 'transparent',
      opacity: 0.7,
      filter: 'blur(0.5px)'
    },
    connectionGhostPreview: {
      enabled: true,
      strokeColor: '#000000ff',
      strokeWidth: 1.5,
      strokeDashArray: [4, 4],
      fillColor: 'transparent',
      opacity: 0.7,
      filter: 'blur(0.5px)'
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
            // Ctrl+D -> clear selection using engine API.
            (engine as { clearSelection?: () => void }).clearSelection?.();
          },
          "canvas:log-state": ({ engine }) => {
            const nodes = (engine as { getPlacedNodes?: () => unknown[] }).getPlacedNodes?.() ?? [];
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
      gridColumns: 3,
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
          "color": "#3B82F6",
          "stroke": { "width": 1.5, "color": "#1D4ED8", "strokeDasharray": [] },
          "textColor": "#1e3a5f",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#3B82F6", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        },
      ],
      "rectangle": [
        {
          "id": "task0",
          "width": 60,
          "height": 60,
          "color": "#6366F1",
          "borderRadius": { "leftTop": 5, "leftBottom": 5, "rightTop": 5, "rightBottom": 5 },
          "stroke": { "width": 1.5, "color": "#4338CA", "strokeDasharray": [6, 3] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#6366F1", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        },
        {
          "id": "task1",
          "width": 240,
          "height": 120,
          "color": "#8B5CF6",
          "borderRadius": { "leftTop": 5, "leftBottom": 5, "rightTop": 5, "rightBottom": 5 },
          "stroke": { "width": 1.5, "color": "#6D28D9", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 3px 5px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#8B5CF6", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        },
        {
          "id": "long-card",
          "width": 200,
          "height": 80,
          "color": "#F8FAFC",
          "borderRadius": { "leftTop": 8, "leftBottom": 8, "rightTop": 8, "rightBottom": 8 },
          "stroke": { "width": 1, "color": "#CBD5E1", "strokeDasharray": [] },
          "textColor": "#0f172a",
          "boxShadow": "0px 10px 15px -3px rgba(0, 0, 0, 0.08)",
          "transparency": 0.9,
          "overlay": { "enabled": true, "color": "#3b82f6", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "rhombus": [
        {
          "id": "rhombus1",
          "width": 80,
          "height": 80,
          "color": "#EC4899",
          "stroke": { "width": 1.5, "color": "#BE185D", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#EC4899", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "pentagon": [
        {
          "id": "pentagon1",
          "width": 80,
          "height": 80,
          "color": "#F97316",
          "stroke": { "width": 1.5, "color": "#C2410C", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#F97316", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "semicircle": [
        {
          "id": "semicircle1",
          "width": 100,
          "height": 50,
          "color": "#14B8A6",
          "stroke": { "width": 1.5, "color": "#0F766E", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#14B8A6", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "octagon": [
        {
          "id": "octagon1",
          "width": 80,
          "height": 80,
          "color": "#EF4444",
          "stroke": { "width": 1.5, "color": "#B91C1C", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#EF4444", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "star": [
        {
          "id": "star1",
          "width": 80,
          "height": 80,
          "color": "#EAB308",
          "stroke": { "width": 1.5, "color": "#A16207", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#EAB308", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "oval": [
        {
          "id": "oval1",
          "width": 80,
          "height": 120,
          "color": "#06B6D4",
          "stroke": { "width": 1.5, "color": "#0E7490", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#06B6D4", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "triangle": [
        {
          "id": "triangle1",
          "width": 80,
          "height": 80,
          "color": "#22C55E",
          "stroke": { "width": 1.5, "color": "#15803D", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#22C55E", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "trapezoid": [
        {
          "id": "trapezoid1",
          "width": 100,
          "height": 60,
          "color": "#7C3AED",
          "stroke": { "width": 1.5, "color": "#5B21B6", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#7C3AED", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "parallelogram": [
        {
          "id": "parallelogram1",
          "width": 100,
          "height": 60,
          "color": "#F59E0B",
          "stroke": { "width": 1.5, "color": "#B45309", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#F59E0B", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "kite": [
        {
          "id": "kite1",
          "width": 80,
          "height": 100,
          "color": "#10B981",
          "stroke": { "width": 1.5, "color": "#047857", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#10B981", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "hexagon": [
        {
          "id": "hexagon1",
          "width": 80,
          "height": 80,
          "color": "#0EA5E9",
          "stroke": { "width": 1.5, "color": "#0369A1", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#0EA5E9", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "heptagon": [
        {
          "id": "heptagon1",
          "width": 80,
          "height": 80,
          "color": "#D946EF",
          "stroke": { "width": 1.5, "color": "#A21CAF", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#D946EF", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "nonagon": [
        {
          "id": "nonagon1",
          "width": 80,
          "height": 80,
          "color": "#FB923C",
          "stroke": { "width": 1.5, "color": "#C2410C", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#FB923C", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        }
      ],
      "decagon": [
        {
          "id": "decagon1",
          "width": 80,
          "height": 80,
          "color": "#34D399",
          "stroke": { "width": 1.5, "color": "#059669", "strokeDasharray": [] },
          "textColor": "#000000",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#34D399", "strokeWidth": 2, "opacity": 1, "type": "line" },
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
        dashed: false,
        animated: false,
        lineStyle: {
          dashArray: [8, 4],
          animation: { type: "flow", speed: 10 },
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
        dashed: false,
        animated: false,
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
        dashed: false,
        animated: false,
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
        dashed: false,
        animated: false,
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
