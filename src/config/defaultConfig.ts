import { Config } from "../model/configurationModel"

export const defaultConfig: Config = {
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
      dashArray: [2, 3],
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
        color: 'var(--zenode-guide-color, #ffaa00)',
        width: 2,
        dashed: true,
        dashArray: [2, 3]
      },
      guideLineMode: 'full'
    },
    ports: {
      enabled: true,
      radius: 5,
      fillColor: 'var(--zenode-port-color, #4A90E2)',
      strokeColor: '#ffffff',
      strokeWidth: 1,
      opacity: 1,
      showOnHoverOnly: true,
      cursor: 'crosshair'
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
    ghostConnection: {
      enabled: true,
      color: 'var(--zenode-selection-color, #4A90E2)',
      strokeWidth: 2,
      dashed: true,
      dashArray: [4, 4],
      opacity: 1
    },
    ghostPreview: {
      enabled: true,
      strokeColor: 'var(--zenode-accent, #3b82f6)',
      strokeWidth: 1.5,
      strokeDashArray: [4, 4],
      fillColor: 'transparent',
      opacity: 0.4,
      filter: 'blur(1px)'
    },
    connectionGhostPreview: {
        enabled: true,
        strokeColor: 'var(--zenode-accent, #3b82f6)',
        strokeWidth: 1.5,
        strokeDashArray: [4, 4],
        fillColor: 'transparent',
        opacity: 0.4,
        filter: 'blur(1px)'
    },
    allowMultipleConnections: true,
    keyboardShortcuts: {
      enabled: true,
      deleteSelection: ["Delete", "Backspace"],
      clearSelection: ["Escape"],
      customBindings: {},
      callbacks: {}
    },
    contextPad: {
      enabled: true,
      trigger: "select",
      position: "top-right",
      offset: { x: 15, y: -10 },
      showDefaults: true,
      layout: "grid",
      gridColumns: 2,
      style: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "rgba(200, 200, 200, 1)",
        borderWidth: "1px",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        backdropBlur: "0px",
        padding: "4px",
        buttonWidth: "28px",
        buttonHeight: "28px",
        buttonPadding: "4px",
        buttonMargin: "2px",
        iconColor: "#333333",
        buttonHoverColor: "rgba(230, 230, 230, 1)",
        buttonActiveColor: "rgba(124, 172, 255, 1)"
      }
    },
    visualEffects: {
      highlight: {
        color: '#ffdd00',
        duration: 3000,
        scale: 1.2,
        intensity: 2.5
      },
      focus: {
        padding: 60,
        duration: 1000,
        defaultZoom: 1.2
      }
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
          "width": 120,
          "height": 60,
          "color": "#6366F1",
          "borderRadius": { "leftTop": 4, "leftBottom": 4, "rightTop": 4, "rightBottom": 4 },
          "stroke": { "width": 1.5, "color": "#4338CA", "strokeDasharray": [] },
          "textColor": "#ffffff",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.08)",
          "transparency": 0.35,
          "overlay": { "enabled": true, "color": "#6366F1", "strokeWidth": 2, "opacity": 1, "type": "line" },
          'previewEnabled': true,
          'previewTransparency': 0.4
        },
        {
          "id": "task1",
          "width": 100,
          "height": 50,
          "color": "#8B5CF6",
          "borderRadius": { "leftTop": 5, "leftBottom": 5, "rightTop": 5, "rightBottom": 5 },
          "stroke": { "width": 1.5, "color": "#6D28D9", "strokeDasharray": [] },
          "textColor": "#ffffff",
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
        },
        {
          "id": "group",
          "width": 200,
          "height": 150,
          "color": "transparent",
          "borderRadius": { "leftTop": 0, "leftBottom": 0, "rightTop": 0, "rightBottom": 0 },
          "stroke": { "width": 1.5, "color": "#94a3b8", "strokeDasharray": [8, 4] },
          "textColor": "#64748b",
          "boxShadow": "none",
          "transparency": 1,
          "overlay": { "enabled": false, "color": "#3b82f6", "strokeWidth": 2, "opacity": 1, "type": "line" },
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
          "textColor": "#ffffff",
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
          "textColor": "#ffffff",
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
          "textColor": "#ffffff",
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
          "textColor": "#ffffff",
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
          "textColor": "#ffffff",
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
          "textColor": "#ffffff",
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
          "textColor": "#ffffff",
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
          "textColor": "#ffffff",
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
          "textColor": "#ffffff",
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
          "textColor": "#ffffff",
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
          "textColor": "#ffffff",
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
          "textColor": "#ffffff",
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
          "textColor": "#ffffff",
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
          "textColor": "#ffffff",
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
          dashArray: [8, 8],
          animation: { type: "flow", speed: 2 },
          markerEnd: "none",
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
        lineStyle: {
          dashArray: [],
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
        lineStyle: {
          dashArray: [],
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
        lineStyle: {
          dashArray: [],
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
