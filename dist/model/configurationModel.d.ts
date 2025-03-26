export interface Stroke {
    width: number;
    color: string;
}
export interface BorderRadius {
    leftTop: number;
    leftBottom: number;
    rightTop: number;
    rightBottom: number;
}
export interface Shape {
    radius?: number;
    width?: number;
    height?: number;
    color: string;
    stroke: Stroke;
    textColor: string;
    boxShadow: string;
    borderRadius?: BorderRadius;
}
export interface LineStyle {
    dashArray: number[];
    innerTextEnabled: boolean;
    innerText: string;
    innerTextColor: string;
    icon?: string | null;
    clickFunction?: (() => void) | null;
}
export interface Connection {
    type: string;
    style: string;
    color: string;
    width: number;
    lineStyle: LineStyle;
}
export interface Canvas {
    type: string;
    innerPointColor: string;
    backgroundColor: string;
    gridSize: number;
    locked: boolean;
}
export interface CanvasProperties {
    zoomEnabled: boolean;
    panEnabled: boolean;
    snapToGrid: boolean;
    defaultNodeSpacing: number;
    dragType: string;
}
export interface Shapes {
    default: {
        circle: Shape;
        rectangle: Shape;
    };
    extraShapes: any[];
}
export interface Connections {
    default: {
        straight: Connection;
        curved: Connection;
        sShaped: Connection;
        lBent: Connection;
    };
    custom: any[];
}
export interface GlobalProperties {
    nodeSpacing: number;
    connectionGap: number;
    animationEnabled: boolean;
    validateGridSize?: number | null;
}
export interface DragOptions {
    enableDrag: boolean;
    dragMode: string;
    connectionDraw: string;
}
export interface Config {
    canvas: Canvas;
    canvasProperties: CanvasProperties;
    shapes: Shapes;
    connections: Connections;
    globalProperties: GlobalProperties;
    dragOptions: DragOptions;
}
