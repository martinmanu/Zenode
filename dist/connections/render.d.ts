import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { VisualState } from "../types/index.js";
export interface StoredConnection {
    id: string;
    sourceNodeId: string;
    sourcePortId: string;
    targetNodeId: string;
    targetPortId: string;
    type: string;
    visualState?: VisualState;
    dashed?: boolean;
    animated?: boolean;
}
/**
 * Draws all connections using the specialized path calculators.
 */
export declare function renderConnections(connectionsGroup: d3.Selection<SVGGElement, unknown, null, undefined>, connections: StoredConnection[], placedNodes: PlacedNode[], engine?: any): void;
/**
 * Renders a ghost connection line from a port to the current mouse position.
 */
export declare function renderGhostConnection(ghostGroup: d3.Selection<SVGGElement, unknown, null, undefined>, from: {
    x: number;
    y: number;
}, to: {
    x: number;
    y: number;
}, style?: any, // GhostConnectionStyle
type?: string, sourcePortId?: string, targetPortId?: string): void;
