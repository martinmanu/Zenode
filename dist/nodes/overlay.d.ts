import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { Shape, Config } from "../model/configurationModel.js";
import { ShapeRegistry } from "./registry.js";
import { ResolvedShapeConfig } from "../types/index.js";
export declare function buildResolvedShapeConfig(node: PlacedNode, style: Shape): ResolvedShapeConfig;
export declare function renderSelectionRing(selection: d3.Selection<SVGGElement, PlacedNode, any, any>, node: PlacedNode, style: Shape, shapeRegistry: ShapeRegistry, stroke: string, pad?: number): void;
/**
 * Renders 8-point interactive resize handles around a selected node.
 */
export declare function renderResizeHandles(group: d3.Selection<SVGGElement, PlacedNode, any, any>, node: PlacedNode, style: Shape, api: any): void;
export declare function getNodeRect(node: PlacedNode, api: {
    config: Config;
    shapeRegistry: ShapeRegistry;
}): NodeRect | null;
export declare function getShapeStyle(node: PlacedNode, config: Config): Shape | undefined;
export interface NodeRect {
    left: number;
    right: number;
    top: number;
    bottom: number;
    cx: number;
    cy: number;
}
