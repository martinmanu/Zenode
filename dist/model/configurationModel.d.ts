export interface CanvasConfig {
    type: "plain" | "lined" | "dotted";
    innerPointColor?: string;
    backgroundColor?: string;
    gridSize?: number;
    locked?: boolean;
}
export interface CanvasProperties {
    zoomEnabled?: boolean;
    panEnabled?: boolean;
    snapToGrid?: boolean;
    defaultNodeSpacing?: number;
    dragType?: "smooth" | "instant" | "onDragEnd";
}
export interface ShapeStyle {
    radius?: number;
    color?: string;
    stroke?: {
        width?: number;
        color?: string;
    };
    textColor?: string;
    boxShadow?: string;
    width?: number;
    height?: number;
    borderRadius?: {
        leftTop?: number;
        leftBottom?: number;
        rightTop?: number;
        rightBottom?: number;
    };
}
export interface ShapesConfig {
    default: {
        circle?: ShapeStyle;
        rectangle?: ShapeStyle;
    };
    extraShapes?: Array<{
        name: string;
        d3Function?: Function;
    }>;
}
export interface LineStyle {
    dashArray?: number[];
    innerTextEnabled?: boolean;
    innerText?: string;
    innerTextColor?: string;
    icon?: string | null;
    clickFunction?: Function | null;
}
export interface ConnectionConfig {
    type: string;
    style: string;
    color: string;
    width: number;
    lineStyle?: LineStyle;
}
export interface ConnectionsConfig {
    default: {
        straight?: ConnectionConfig;
        curved?: ConnectionConfig;
        sShaped?: ConnectionConfig;
        lBent?: ConnectionConfig;
    };
    custom?: {
        dotted?: ConnectionConfig;
    };
}
export interface GlobalProperties {
    nodeSpacing?: number;
    connectionGap?: number;
    animationEnabled?: boolean;
}
export interface DragOptions {
    enableDrag?: boolean;
    dragMode?: "smooth" | "instant";
    connectionDraw?: "onDrag" | "onDragEnd";
}
export interface ZenodeConfig {
    canvas?: CanvasConfig;
    canvasProperties?: CanvasProperties;
    shapes?: ShapesConfig;
    connections?: ConnectionsConfig;
    globalProperties?: GlobalProperties;
    dragOptions?: DragOptions;
}
