/**
 * Renders connection lines on g.connections layer. Straight line from source to target node center.
 */
import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { VisualState } from "../types/index.js";
export interface StoredConnection {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    type: string;
    visualState?: VisualState;
}
/**
 * Draws all connections as straight lines between node centers.
 */
export declare function renderConnections(connectionsGroup: d3.Selection<SVGGElement, unknown, null, undefined>, connections: StoredConnection[], placedNodes: PlacedNode[]): void;
