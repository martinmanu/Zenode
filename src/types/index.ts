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
  top: { x: number; y: number };
  bottom: { x: number; y: number };
  left: { x: number; y: number };
  right: { x: number; y: number };
  center: { x: number; y: number };
  [key: string]: { x: number; y: number };
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

export interface ContextPadAction {
  id: string;
  icon: string; // SVG string or emoji
  tooltip: string;
  group?: "primary" | "secondary" | "danger" | string;
  targets?: Array<"node" | "edge">;
  appliesTo?: string[]; // node/edge types
  order?: number;
  handler: (target: ContextPadTarget, engine: any) => void;
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