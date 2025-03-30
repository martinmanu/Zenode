import { Config } from "../model/configurationModel.js";
import { defaultConfig } from "../config/defaultConfig.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export class ZoomManager {
  private zoomBehaviour: any;
  private container: any;
  private config: any;

  constructor(container: any, svg: any, config: Config, triggerEvent: Function) {
    this.container = container;
    this.config = config;

    this.zoomBehaviour = d3.zoom()
      .scaleExtent(this.config.canvasProperties.zoomExtent)
      .translateExtent([
        [-10000, -10000], [10000, 10000]
      ])
      .filter((event: any) => {
        if (!this.config.canvasProperties.zoomOnScroll && event.type === "wheel") return false;
        if (!this.config.canvasProperties.zoomOnDoubleClick && event.type === "dblclick") return false;
        if (!this.config.canvasProperties.panEnabled && event.type === "mousedown") return false;
        if (event.type === "wheel") return event.ctrlKey || event.metaKey || event.button === 1;
        return true;
      })
      .on("start", (event) => triggerEvent("zoomStart", event))
      .on("zoom", (event) => {
        this.container.attr("transform", event.transform);
        triggerEvent("zoom", event);
      })
      .on("end", (event) => triggerEvent("zoomEnd", event));

      svg.call(this.zoomBehaviour);
      const initialZoom = config.canvasProperties.zoomScale || defaultConfig.canvasProperties.zoomScale
      const zoomDuration = config.canvasProperties.zoomDuration || defaultConfig.canvasProperties.zoomDuration
      const initialTransform = d3.zoomIdentity.scale(initialZoom);
      svg.call(this.zoomBehaviour.transform, initialTransform).transition().duration(zoomDuration);
      //addMarkers
  }
  
}
