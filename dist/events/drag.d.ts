import * as d3 from "d3";
import { PlacedNode, CanvasElements, VisualGroup } from "../model/interface.js";
import { Config } from "../model/configurationModel.js";
import { ShapeRegistry } from "../nodes/registry.js";
export interface DragApi {
    updateNodePosition(id: string, x: number, y: number, recordHistory?: boolean, skipVisualRefresh?: boolean): void;
    getPlacedNodes(): PlacedNode[];
    config: Config;
    shapeRegistry: ShapeRegistry;
    canvasObject: CanvasElements;
    /** SVG root node — needed for correct pointer coordinate transform */
    svgNode: SVGSVGElement;
    setSelectedNodeIds(ids: string[], primaryId?: string): void;
    panBy?: (dx: number, dy: number) => void;
    beginOperation(nodeId: string, type: 'drag' | 'rotate' | 'resize'): void;
    endOperation(): void;
    getSelectedNodeIds(): string[];
    getVisualGroups(): VisualGroup[];
    getGroupBounds(groupId: string, overrideNodes?: Map<string, PlacedNode>): any | null;
}
export declare function createDragBehavior(api: DragApi): d3.DragBehavior<SVGGElement, PlacedNode, PlacedNode | d3.SubjectPosition>;
