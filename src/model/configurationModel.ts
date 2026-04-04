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
  position:
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";
  offset: { x: number; y: number };
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
  labelBackground?: string; // e.g. 'white' or '#ffffff'
  labelPadding?: number;
  labelBorderRadius?: number;
  icon?: string | null;
  clickFunction?: (() => void) | null;
  animation?: { type: string; speed: number }; // e.g. { type: 'flow', speed: 1 }
  markerEnd?: string; // "arrow", "circle", "none"
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
  grid: Grid
  height: number;
  width: number;
  locked: boolean;
  canvasClasses: string[]
}

export interface Grid {
  gridType: string; // dotted , sheet , line , cross
  gridSize: number;
  gridEnabled: boolean;
  gridTransparency: number
  gridColor: string;
  gridShape: string //circle ,square , works only for dotted
  gridDimension: number //radi for circle or width/height for square
  sheetDimension?: number // 3x3 or 4x4 for gridtype as sheet
  crossLength?: number // applicable only for type cross  , higher the number larger the cross and viseversa
}

export interface GhostPreviewStyle {
  enabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  strokeDashArray: number[];
  fillColor: string;
  opacity: number;
  filter: string; // e.g. "blur(1px)"
}

export interface VisualEffects {
  highlight: {
    color: string;
    duration: number;
    scale: number;
    intensity: number;
  };
  focus: {
    padding: number;
    duration: number;
    defaultZoom: number;
  };
}

export interface CanvasProperties {
  zoomEnabled: boolean;
  zoomExtent: number[];
  zoomOnDoubleClick: boolean;
  zoomScale: number,
  zoomOnScroll: boolean;
  zoomDuration: number; // in ms
  panEnabled: boolean;
  snapToGrid: boolean;
  alignmentLines: AlignmentLines;
  ports?: PortStyle;
  lassoStyle: LassoStyle;
  ghostConnection: GhostConnectionStyle;
  ghostPreview?: GhostPreviewStyle;
  connectionGhostPreview?: GhostPreviewStyle;
  allowMultipleConnections: boolean;
  keyboardShortcuts: KeyboardShortcuts;
  contextPad?: ContextPadConfig;
  visualEffects?: VisualEffects;
  // defaultNodeSpacing: number;
  // dragType: string;
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
  id: string; // Unique identifier
  radius?: number,
  width?: number,
  height?: number,
  color: string,
  stroke: {
    width: number,
    color: string,
    strokeDasharray: number[],
  },
  overlay: Overlay,
  previewEnabled: boolean,
  previewTransparency: number,
  transparency: number,
  textColor: string,
  boxShadow: string,
  borderRadius?: BorderRadius
}

export interface Overlay {
  enabled: boolean,
  color: string,
  opacity: number,
  strokeWidth: number,
  type: 'line' | 'dash'
}

export interface Shapes {
  default: {
    circle?: Shape[];    // Allow multiple circle definitions
    rectangle?: Shape[]; // Allow multiple rectangle definitions
    rhombus?: Shape[];   // Allow multiple rhombus definitions
    hexagon?: Shape[];   // Allow multiple hexagon definitions
    triangle?: Shape[];  // Allow multiple triangle definitions
    pentagon?: Shape[];  // Allow multiple pentagon definitions
    parallelogram?: Shape[]; // Allow multiple parallelogram definitions
    semicircle?: Shape[];    // Allow multiple semicircle definitions
    octagon?: Shape[];       // Allow multiple octagon definitions
    star?: Shape[];          // Allow multiple star definitions
    oval?: Shape[];
    trapezoid?: Shape[];
    kite?: Shape[];
    heptagon?: Shape[];
    nonagon?: Shape[];
    decagon?: Shape[];
  };
  extraShapes: Shape[]; // For additional, custom shapes
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
  historyLimit?: number;
}