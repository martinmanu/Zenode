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

export interface CanvasProperties {
  zoomEnabled: boolean;
  zoomExtent: number[];
  zoomOnDoubleClick: boolean;
  zoomScale: number,
  zoomOnScroll: boolean;
  zoomDuration: number; // in ms
  panEnabled: boolean;
  snapToGrid: boolean;
  alignmentLines: AlignmentLines
  // defaultNodeSpacing: number;
  // dragType: string;
}

export interface AlignmentLines {
  enabled: boolean;
  color: string;
  width: number;
  dashed: boolean;
  dashArray: number[];
}

export interface Shape {
  id: string; // Unique identifier
  radius?: number;
  width?: number;
  height?: number;
  color: string;
  stroke: {
    width: number;
    color: string;
    strokeType: string;
    strokeDasharray: number[];
  };
  transparency: number,
  textColor: string;
  boxShadow: string;
  borderRadius?: BorderRadius
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
  };
  extraShapes: Shape[]; // For additional, custom shapes
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