import { Config } from "../model/configurationModel.js";
export declare class ZoomManager {
    private zoomBehaviour;
    private container;
    private config;
    constructor(container: any, svg: any, config: Config, triggerEvent: Function);
}
