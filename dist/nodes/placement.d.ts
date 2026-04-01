/**
 * Renders placed nodes using D3 data join. Keeps g.placed-nodes in sync with engine state.
 */
import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { DragApi } from "../events/drag.js";
import { ShapeRegistry } from "./registry.js";
/** Minimal API for rendering and interaction */
export interface RenderApi extends DragApi {
    shapeRegistry: ShapeRegistry;
    getSelectedNodeIds(): string[];
    setSelectedNodeIds(ids: string[]): void;
    getCanvasPoint(event: MouseEvent): {
        x: number;
        y: number;
    };
    startConnectionDrag(sourceNodeId: string, sourcePortId: string, startPoint: {
        x: number;
        y: number;
    }): void;
    updateConnectionDrag(currentPoint: {
        x: number;
        y: number;
    }): void;
    endConnectionDrag(targetNodeId?: string, targetPortId?: string): void;
    isDrawingConnection(): boolean;
    rotateNode(id: string, rotation: number): void;
    updateNodeDimensions(id: string, dimensions: {
        width?: number;
        height?: number;
        radius?: number;
    }): void;
    beginOperation(nodeId: string, type: 'drag' | 'rotate' | 'resize'): void;
    endOperation(): void;
    getActiveOperation(): {
        type: string;
        nodeId: string;
        originalData: PlacedNode;
    } | null;
}
/**
 * Renders the placed nodes layer using a D3 data join. Call after state changes.
 * @param placedNodesGroup - D3 selection for g.placed-nodes
 * @param placedNodes - Current array of placed nodes
 * @param config - Engine config for shape styles
 */
export declare function renderPlacedNodes(placedNodesGroup: d3.Selection<SVGGElement, unknown, null, undefined>, placedNodes: PlacedNode[], api: RenderApi): void;
