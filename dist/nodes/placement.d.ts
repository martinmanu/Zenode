/**
 * Renders placed nodes using D3 data join. Keeps g.placed-nodes in sync with engine state.
 */
import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { DragApi } from "../events/drag.js";
/** Minimal API for rendering and interaction */
export interface RenderApi extends DragApi {
}
/**
 * Renders the placed nodes layer using a D3 data join. Call after state changes.
 * @param placedNodesGroup - D3 selection for g.placed-nodes
 * @param placedNodes - Current array of placed nodes
 * @param config - Engine config for shape styles
 */
export declare function renderPlacedNodes(placedNodesGroup: d3.Selection<SVGGElement, unknown, null, undefined>, placedNodes: PlacedNode[], api: RenderApi): void;
