import * as d3 from "d3";
import { PlacedNode, CanvasElements } from "../model/interface.js";
import { Config } from "../model/configurationModel.js";
export interface DragApi {
    updateNodePosition(id: string, x: number, y: number): void;
    getPlacedNodes(): PlacedNode[];
    config: Config;
    canvasObject: CanvasElements;
}
/**
 * Creates and returns a D3 drag behavior for placed nodes.
 */
export declare function createDragBehavior(api: DragApi): d3.DragBehavior<SVGGElement, PlacedNode, PlacedNode | d3.SubjectPosition>;
