import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { Config } from "../model/configurationModel.js";
import { ShapeRegistry } from "./registry.js";
/**
 * Renders connection ports for a node.
 * @param nodeGroup - The D3 selection of the node's <g> element
 * @param node - The node data
 * @param config - The engine configuration
 * @param registry - The shape registry to get the renderer
 */
export declare function renderPorts(nodeGroup: d3.Selection<SVGGElement, PlacedNode, any, any>, node: PlacedNode, config: Config, registry: ShapeRegistry, engine: any): void;
