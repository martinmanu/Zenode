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

export interface ShapeRenderer {
  draw: (g: D3Selection, config: ResolvedShapeConfig, theme: ThemeConfig) => void;
  getPath: (config: ResolvedShapeConfig) => string;
  getBounds: (config: ResolvedShapeConfig) => BoundingBox;
  getPorts: (config: ResolvedShapeConfig) => PortMap;
}