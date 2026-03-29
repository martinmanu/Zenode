import { Config } from "../model/configurationModel.js";
export declare class ZoomManager {
    private zoomBehaviour;
    private container;
    private config;
    constructor(container: any, svg: any, config: Config, triggerEvent: Function);
    zoomBy(svg: any, factor: number, duration?: number): void;
    panBy(svg: any, dx: number, dy: number): void;
    zoomTo(svg: any, scale: number, duration?: number): void;
    centerOn(svg: any, point: {
        x: number;
        y: number;
    }, scale?: number, duration?: number): void;
    getZoomBehaviour(): any;
}
