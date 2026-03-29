import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { Shape } from "../model/configurationModel.js";
import { ShapeRegistry } from "./registry.js";
import { ResolvedShapeConfig } from "../types/index.js";
export declare function buildResolvedShapeConfig(node: PlacedNode, style: Shape): ResolvedShapeConfig;
export declare function renderSelectionRing(selection: d3.Selection<SVGGElement, PlacedNode, any, any>, node: PlacedNode, style: Shape, shapeRegistry: ShapeRegistry, stroke: string, pad?: number): void;
