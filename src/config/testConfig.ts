import { Config } from "../model/configurationModel"

export const testConfig: Config = {
  canvas: {
    grid:{
      gridEnabled: true,
      gridType: "cross",
      gridColor: "#0000FF",
      gridTransparency: 0.4,
      gridSize: 40,
      gridShape: 'square',
      gridDimension: 1,
      sheetDimension: 4,
      crossLength: 10
    },
    backgroundColor: "#FFFFFF",
    width: 800,
    height: 600,
    canvasClasses: ["test-canvas"],
    locked: false
  },
  canvasProperties: {
    zoomEnabled: true,
    zoomExtent: [0.1, 4],
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
          "stroke": { "width": 2, "color": "#000000", "strokeType": 'straight', "strokeDasharray": []},
          "textColor": "#ffffff",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.1)",
          "transparency" : 1
        },
      ],
      "rectangle": [
        {
          "id": "task0",
          "width": 120,
          "height": 60,
          "color": "#0000ff",
          "borderRadius": { "leftTop": 3, "leftBottom": 3, "rightTop": 3, "rightBottom": 3 },
          "stroke": { "width": 2, "color": "#000000", "strokeType": 'straight', "strokeDasharray": []},
          "textColor": "#ffffff",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.1)",
          "transparency" : 1
        },
        {
          "id": "task1",
          "width": 100,
          "height": 50,
          "color": "#00FFFF",
          "borderRadius": { "leftTop": 5, "leftBottom": 5, "rightTop": 5, "rightBottom": 5 },
          "stroke": { "width": 2, "color": "#000000", "strokeType": 'straight', "strokeDasharray": []},
          "textColor": "#000000",
          "boxShadow": "0px 3px 5px rgba(0, 0, 0, 0.1)",
          "transparency" : 1
        }
      ],
      "rhombus": [
        {
          "id": "rhombus1",
          "width": 80,
          "height": 80,
          "color": "#FF00FF",
          "stroke": { "width": 2, "color": "#000000", "strokeType": 'straight', "strokeDasharray": []},
          "textColor": "#ffffff",
          "boxShadow": "0px 4px 6px rgba(0, 0, 0, 0.1)",
          "transparency" : 1
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
