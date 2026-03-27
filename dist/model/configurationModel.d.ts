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
    backgroundColor: string;
    grid: Grid;
    height: number;
    width: number;
    locked: boolean;
    canvasClasses: string[];
}
export interface Grid {
    gridType: string;
    gridSize: number;
    gridEnabled: boolean;
    gridTransparency: number;
    gridColor: string;
    gridShape: string;
    gridDimension: number;
    sheetDimension?: number;
    crossLength?: number;
}
export interface CanvasProperties {
    zoomEnabled: boolean;
    zoomExtent: number[];
    zoomOnDoubleClick: boolean;
    zoomScale: number;
    zoomOnScroll: boolean;
    zoomDuration: number;
    panEnabled: boolean;
    snapToGrid: boolean;
    alignmentLines: AlignmentLines;
    lassoStyle: LassoStyle;
    keyboardShortcuts: KeyboardShortcuts;
}
export interface LassoStyle {
    enabled: boolean;
    strokeColor: string;
    strokeWidth: number;
    dashed: boolean;
    dashArray: number[];
    fillColor: string;
    fillOpacity: number;
    cursor: string;
    activeCursor: string;
}
export interface KeyboardShortcutContext {
    event: KeyboardEvent;
    action: string;
    selectedNodeIds: string[];
    engine: unknown;
}
export type KeyboardShortcutHandler = (ctx: KeyboardShortcutContext) => boolean | void;
export interface KeyboardShortcutCallbacks {
    onDeleteSelection?: KeyboardShortcutHandler;
    onClearSelection?: KeyboardShortcutHandler;
    onKeyDown?: KeyboardShortcutHandler;
    /**
     * Additional action handlers matched against keyboardShortcuts.customBindings.
     * Return false to prevent default handling.
     */
    custom?: Record<string, KeyboardShortcutHandler>;
}
export interface KeyboardShortcuts {
    enabled: boolean;
    deleteSelection: string[];
    clearSelection: string[];
    customBindings?: Record<string, string[]>;
    callbacks?: KeyboardShortcutCallbacks;
}
export interface AlignmentLines {
    enabled: boolean;
    color: string;
    width: number;
    dashed: boolean;
    dashArray: number[];
    /** 'full' = infinite lines across entire canvas, 'partial' = short segment between nodes */
    guideLineMode: 'full' | 'partial';
}
export interface Shape {
    id: string;
    radius?: number;
    width?: number;
    height?: number;
    color: string;
    stroke: {
        width: number;
        color: string;
        strokeDasharray: number[];
    };
    overlay: Overlay;
    previewEnabled: boolean;
    previewTransparency: number;
    transparency: number;
    textColor: string;
    boxShadow: string;
    borderRadius?: BorderRadius;
}
export interface Overlay {
    enabled: boolean;
    color: string;
    opacity: number;
    strokeWidth: number;
    type: 'line' | 'dash';
}
export interface Shapes {
    default: {
        circle?: Shape[];
        rectangle?: Shape[];
        rhombus?: Shape[];
        hexagon?: Shape[];
        triangle?: Shape[];
        pentagon?: Shape[];
        parallelogram?: Shape[];
    };
    extraShapes: Shape[];
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
