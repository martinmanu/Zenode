import { Config } from "../model/configurationModel"

export const testConfig: Config = {
  canvas: {
    grid:{
      gridEnabled: true,
      gridType: "sheet",
      gridColor: "#0000FF",
      gridTransparency: 0.8,
      gridSize: 25,
      gridShape: 'circle',
      gridDimension: 0.5,
      sheetDimension: 4
    },
    backgroundColor: "#FFFFFF",
    width: 1000,
    height: 600,
    locked: false
  },
  canvasProperties: {
    zoomEnabled: true,
    panEnabled: true,
    snapToGrid: true,
    defaultNodeSpacing: 60,
    dragType: "smooth"
  },
  shapes: {
    default: {
      circle: {
        radius: 50,
        color: "#FF6347",
        stroke: { width: 3, color: "#000000" },
        textColor: "#FFFFFF",
        boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.2)"
      },
      rectangle: {
        width: 140,
        height: 70,
        color: "#32CD32",
        borderRadius: { leftTop: 5, leftBottom: 5, rightTop: 5, rightBottom: 5 },
        stroke: { width: 3, color: "#000000" },
        textColor: "#FFFFFF",
        boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.2)"
      }
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
