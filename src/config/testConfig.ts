import { Config } from "../model/configurationModel"

export const testConfig: Config = {
  canvas: {
    grid:{
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
    width: 1000,
    height: 600,
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
      color: '#000000',
      width: 2,
      dashed: true,
      dashArray: [2,3]
    }
    // defaultNodeSpacing: 60,
    // dragType: "smooth"
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
          "color": "#CDFE9B",
          "borderRadius": { "leftTop": 50, "leftBottom": 50, "rightTop": 5, "rightBottom": 5 },
          "stroke": { "width": 2, "color": "#000000",  "strokeDasharray": [6, 3]},
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
          "width": 240,
          "height": 120,
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
