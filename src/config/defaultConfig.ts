export const config = {
  canvas: {
    type: "dotted", // "plain", "lined", "dotted"
    innerPointColor: "#000000",
    backgroundColor: "#ffffff",
    gridSize: 20, // Should align with globalProperties
  },
  canvasProperties: {
    zoomEnabled: true,
    panEnabled: true,
    snapToGrid: true,
    defaultNodeSpacing: 50,
  },
  shapes: {
    default: {
      circle: {
        radius: 30,
        color: "#008000",
        stroke: { width: 2, color: "#000000" },
        textColor: "#ffffff",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      },
      rectangle: {
        width: 120,
        height: 60,
        color: "#0000ff",
        stroke: { width: 2, color: "#000000" },
        textColor: "#ffffff",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      },
    },
    extraShapes: [
      {
        name: "hexagon",
        d3Function: (svg: any) => {
          return svg
            .append("polygon")
            .attr("points", "30,0 60,15 60,45 30,60 0,45 0,15")
            .attr("fill", "#ff6600")
            .attr("stroke", "#333333")
            .attr("stroke-width", 2)
        },
      },
    ],
  },
  connections: {
    default: {
      straight: {
        type: "line",
        style: "solid",
        color: "#000000",
        width: 2,
      },
      curved: {
        type: "bezier",
        style: "smooth",
        color: "#666666",
        width: 2,
      },
    },
    custom: {
      dotted: {
        type: "line",
        style: "dashed",
        color: "#ff0000",
        width: 2,
      },
    },
  },
  globalProperties: {
    nodeSpacing: 80,
    connectionGap: 10,
    animationEnabled: true,
    validateGridSize: (gridSize: number, shapeWidth: number) => {
      return gridSize >= shapeWidth / 2; // Ensures grid size and shapes align visually
    },
  },
};
