import { Canvas } from "../../model/configurationModel.js";
export declare function drawCanvas(containerSelector: string, canvasConfig: Canvas): {
    svg: any;
    grid: any;
    elements: any;
    canvasContainer: any;
    connections: any;
    placedNodes: any;
    guides: any;
    lasso: any;
};
export declare function lockedCanvas(locked: boolean, svg: any, zoomBehaviour: any): void;
