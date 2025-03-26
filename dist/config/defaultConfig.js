export const defaultConfig = {
    canvas: {
        type: "dotted",
        innerPointColor: "#000000",
        backgroundColor: "#ffffff",
        gridSize: 20,
        locked: false
    },
    canvasProperties: {
        zoomEnabled: true,
        panEnabled: true,
        snapToGrid: true,
        defaultNodeSpacing: 50,
        dragType: "smooth"
    },
    shapes: {
        default: {
            circle: {
                radius: 30,
                color: "#008000",
                stroke: { width: 2, color: "#000000" },
                textColor: "#ffffff",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
            },
            rectangle: {
                width: 120,
                height: 60,
                color: "#0000ff",
                borderRadius: { leftTop: 3, leftBottom: 3, rightTop: 3, rightBottom: 3 },
                stroke: { width: 2, color: "#000000" },
                textColor: "#ffffff",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
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
//# sourceMappingURL=defaultConfig.js.map