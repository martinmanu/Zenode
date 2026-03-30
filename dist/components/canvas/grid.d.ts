import * as d3 from "d3";
import { Canvas } from "../../model/configurationModel.js";
export declare function drawGrid(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, canvasConfig: Canvas, grid: d3.Selection<SVGGElement, unknown, HTMLElement, any>): d3.Selection<SVGGElement, unknown, HTMLElement, any>;
export declare function updateGridTransform(svg: d3.Selection<any, any, any, any>, transform: any): void;
export declare function toggleGrid(enable: boolean): void;
