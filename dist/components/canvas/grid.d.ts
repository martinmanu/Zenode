/// <reference types="typings/d3-cdn.js" />
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { Canvas } from "../../model/configurationModel.js";
export declare function drawGrid(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, canvasConfig: Canvas, grid: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>): d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
export declare function createSquareGrid(canvasConfig: any, // Replace 'any' with your actual Canvas type if available
grid: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>): d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
