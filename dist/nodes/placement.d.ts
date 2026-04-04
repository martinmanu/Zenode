/**
 * Renders placed nodes using D3 data join. Keeps g.placed-nodes in sync with engine state.
 */
import * as d3 from "d3";
import { PlacedNode, VisualGroup } from "../model/interface.js";
import { Config } from "../model/configurationModel.js";
import { DragApi } from "../events/drag.js";
import { ShapeRegistry } from "./registry.js";
/** Minimal API for rendering and interaction */
export interface RenderApi extends DragApi {
    shapeRegistry: ShapeRegistry;
    getSelectedNodeIds(): string[];
    setSelectedNodeIds(ids: string[], primaryId?: string): void;
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
    rotateNode(id: string, rotation: number, recordHistory?: boolean): void;
    updateNodeDimensions(id: string, dimensions: {
        width?: number;
        height?: number;
        radius?: number;
    }, recordHistory?: boolean): void;
    updateNodePosition(id: string, x: number, y: number, recordHistory?: boolean): void;
    beginOperation(nodeId: string, type: 'drag' | 'rotate' | 'resize'): void;
    endOperation(): void;
    createDragBehavior(): d3.DragBehavior<SVGGElement, any, any>;
    getActiveOperation(): {
        type: string;
        nodeId: string;
        originalData: PlacedNode;
        selectionStates?: Map<string, PlacedNode>;
    } | null;
    getEditingNodeId(): string | null;
    getVisualGroups(): VisualGroup[];
    getGroupBounds(groupId: string, overrideNodes?: Map<string, PlacedNode>): {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
    getGroupPorts(groupId: string): Record<string, {
        x: number;
        y: number;
    }> | null;
    isConnectionModeEnabled?(): boolean;
    config: Config;
    ghostsLayer?: any;
}
/**
 * Renders the placed nodes layer using a D3 data join. Call after state changes.
 * @param placedNodesGroup - D3 selection for g.placed-nodes
 * @param placedNodes - Current array of placed nodes
 * @param config - Engine config for shape styles
 */
export declare function renderPlacedNodes(placedNodesGroup: d3.Selection<SVGGElement, unknown, null, undefined>, placedNodes: PlacedNode[], api: RenderApi): void;
