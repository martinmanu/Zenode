import { CanvasElements, ShapePreviewData } from "../model/interface.js";
import { Config, Shape } from "../model/configurationModel.js";
import { ShapeRegistry } from "../nodes/registry.js";
export declare function svgMouseMove(event: MouseEvent | null, shapeType: string, shapeToFind: Shape, grid: any, config: Config, canvasObject: CanvasElements, data?: ShapePreviewData, registry?: ShapeRegistry, manualPoint?: {
    x: number;
    y: number;
}): {
    x: number;
    y: number;
};
export declare function removeAllPreview(canvasObject: CanvasElements): void;
