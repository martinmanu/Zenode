/// <reference types="typings/d3-cdn.js" />
import { Canvas } from "../../model/configurationModel.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
export declare function drawCanvas(containerSelector: string, canvasConfig: Canvas): d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
