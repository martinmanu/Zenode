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
export interface ContextPadConfig {
    enabled: boolean;
    trigger: "hover" | "select";
    position: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
    offset: {
        x: number;
        y: number;
    };
    showDefaults: boolean;
    suppressDefaults?: string[];
    layout?: "horizontal" | "vertical" | "grid";
    gridColumns?: number;
    style?: {
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: string;
        borderRadius?: string;
        boxShadow?: string;
        backdropBlur?: string;
        padding?: string;
        buttonSize?: number;
        buttonWidth?: string;
        buttonHeight?: string;
        buttonPadding?: string;
        buttonMargin?: string;
        iconColor?: string;
        buttonHoverColor?: string;
        buttonActiveColor?: string;
    };
}
export interface LineStyle {
    dashArray: number[];
    innerTextEnabled: boolean;
    innerText: string;
    innerTextColor: string;
    innerTextSize?: number;
    labelBackground?: string;
    labelPadding?: number;
    labelBorderRadius?: number;
    icon?: string | null;
    clickFunction?: (() => void) | null;
    animation?: {
        type: string;
        speed: number;
    };
    markerEnd?: string;
}
export interface Connection {
    type: string;
    style: string;
    color: string;
    width: number;
    dashed?: boolean;
    animated?: boolean;
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
    ports?: PortStyle;
    lassoStyle: LassoStyle;
    ghostConnection: GhostConnectionStyle;
    allowMultipleConnections: boolean;
    keyboardShortcuts: KeyboardShortcuts;
    contextPad?: ContextPadConfig;
}
export interface PortStyle {
    enabled: boolean;
    radius: number;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    opacity: number;
    showOnHoverOnly: boolean;
    cursor: string;
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
export interface GhostConnectionStyle {
    enabled: boolean;
    color: string;
    strokeWidth: number;
    dashed: boolean;
    dashArray: number[];
    opacity: number;
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
export interface AlignmentGuideStyle {
    enabled: boolean;
    color: string;
    width: number;
    dashed: boolean;
    dashArray: number[];
}
export interface AlignmentLines {
    enabled: boolean;
    color: string;
    width: number;
    dashed: boolean;
    dashArray: number[];
    alignmentThreshold: number;
    /** Optional per-edge overrides. Empty object {} means "use master alignment style". */
    edgeGuides: Partial<AlignmentGuideStyle>;
    /** Optional per-center overrides. Empty object {} means "use master alignment style". */
    centerGuides: Partial<AlignmentGuideStyle>;
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
    defaultType: string;
    default: {
        straight: Connection;
        curved: Connection;
        's-shaped': Connection;
        'l-bent': Connection;
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
