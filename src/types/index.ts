import type * as d3 from "d3";
import type { BorderRadius, Shape } from "../model/configurationModel.js";

export type D3Selection = d3.Selection<SVGGElement, unknown, null, undefined>;

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PortMap {
  top?: { x: number; y: number };
  bottom?: { x: number; y: number };
  left?: { x: number; y: number };
  right?: { x: number; y: number };
  center?: { x: number; y: number };
  [key: string]: { x: number; y: number } | undefined;
}

/**
 * Fully resolved shape config used by renderers.
 * Coordinates are in node-local space for drawing (typically x=0, y=0 at group center).
 */
export interface ResolvedShapeConfig {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  borderRadius?: BorderRadius;
  color: string;
  stroke: Shape["stroke"];
  transparency: number;
}

export interface ThemeConfig {
  [key: string]: unknown;
}

export interface VisualState {
  status?: "idle" | "running" | "success" | "error" | "warning";
  effects?: {
    glow?: { color?: string; intensity?: number };
    strokeAnimation?: { type: "flow"; speed?: number };
    gradientFlow?: { progress: number; fromColor: string; toColor: string };
  };
}

// --- Node Content Types ---

/**
 * Controls how text/icon items are spatially composed inside a node.
 */
export type ContentLayout =
  | 'text-only'       // text centered in shape (default)
  | 'icon-only'       // only an icon, centered
  | 'center'          // first item centered
  | 'icon-top-text'   // icon above text, stacked vertically
  | 'icon-left-text'; // icon left of text, side by side

/**
 * A single renderable item inside a node — text, inline SVG icon, or image URL.
 */
export interface NodeContentItem {
  kind: 'text' | 'icon' | 'image';
  value: string;          // text string | raw SVG string | image URL
  fontSize?: number;      // px, default 12
  fontWeight?: string;    // '400' | '600' | '700'
  fontFamily?: string;    // default inherit
  color?: string;          // fill/stroke color
  opacity?: number;       // 0-1
  offsetX?: number;       // fine offset from calculated position
  offsetY?: number;
  iconSize?: number;      // icon/image render size in px, default 20
  padding?: number;       // inset from shape edge
  maxWidth?: number;      // text wrapping max width in px
  textAlign?: 'left' | 'center' | 'right'; // default center
}

/**
 * Full content descriptor — stored in PlacedNode.content.
 */
export interface NodeContent {
  layout: ContentLayout;
  items: NodeContentItem[];
}

export interface ShapeRenderer {
  draw: (g: D3Selection, config: ResolvedShapeConfig, theme: ThemeConfig) => void;
  getPath: (config: ResolvedShapeConfig) => string;
  getBounds: (config: ResolvedShapeConfig) => BoundingBox;
  getPorts: (config: ResolvedShapeConfig) => PortMap;
}

// --- Context Pad Types ---

export type ContextPadTarget =
  | { kind: "node"; id: string; data: any }
  | { kind: "edge"; id: string; data: any };

// --- Public API Integration ---

/**
 * Public configuration for adding or updating a node.
 */
export interface NodeConfig {
  id?: string;            // if not provided, UUID is generated
  type: string;           // 'circle', 'rectangle', etc.
  shapeVariantId: string; // e.g. 'circle1', 'task1'
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation?: number;
  parentId?: string;
  visualState?: VisualState;
  content?: NodeContent;
  meta?: Record<string, any>;
}

/**
 * Public representation of a node on the canvas.
 */
export interface NodeData extends NodeConfig {
  id: string; // Guaranteed ID
}

/**
 * Public configuration for adding or updating a connection.
 */
export interface EdgeConfig {
  id?: string;               // if not provided, UUID is generated
  sourceNodeId: string;
  sourcePortId: string;      // 'top', 'bottom', etc.
  targetNodeId: string;
  targetPortId: string;
  type?: string;             // 'straight', 'curved', 's-shaped', 'l-bent'
  meta?: Record<string, any>;
}

/**
 * Public representation of a connection on the canvas.
 */
export interface EdgeData extends EdgeConfig {
  id: string; // Guaranteed ID
}

export interface ContextPadAction {
  id: string;
  icon: string; // SVG string or emoji
  tooltip: string;
  group?: "primary" | "secondary" | "danger" | string;
  targets?: Array<"node" | "edge">;
  appliesTo?: string[]; // node/edge types
  order?: number;
  handler: (target: ContextPadTarget, engine: any, event: MouseEvent) => void;
  isVisible?: (target: ContextPadTarget, engine: any) => boolean;
  isDisabled?: (target: ContextPadTarget, engine: any) => boolean;
  isActive?: (target: ContextPadTarget, engine: any) => boolean;
  style?: {
    color?: string;
    hoverColor?: string;
    activeColor?: string;
  };
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
    buttonSize?: number; // legacy, keeping for compat
    buttonWidth?: string;
    buttonHeight?: string;
    buttonPadding?: string;
    buttonMargin?: string;
    iconColor?: string;
    buttonHoverColor?: string;
    buttonActiveColor?: string;
  };
}