import { CanvasElements, ShapePreviewData } from "../model/interface.js";
import { Config, Shape } from "../model/configurationModel.js";
export declare function svgMouseMove(event: MouseEvent, shapeType: string, shapeToFind: Shape, grid: any, config: Config, canvasObject: CanvasElements, data?: ShapePreviewData): void;
export declare function removeAllPreview(canvasObject: CanvasElements): void;
