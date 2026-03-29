import { Config } from "../model/configurationModel.js";
import { defaultConfig } from "../config/defaultConfig.js";
import * as d3 from "d3";

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
        // When lasso tool is enabled, block drag-pan so background drag draws lasso instead.
        if (event.type === "mousedown" && svg.attr("data-lasso-enabled") === "true") return false;
        if (event.type === "dblclick") return false;
        if (!this.config.canvasProperties.zoomOnScroll && event.type === "wheel") return false;
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
  }

  public zoomBy(svg: any, factor: number, duration: number = 300): void {
    const currentTransform = d3.zoomTransform(svg.node());
    const targetScale = currentTransform.k * factor;
    svg.transition()
      .duration(duration)
      .call(this.zoomBehaviour.scaleBy, factor);
  }

  public panBy(svg: any, dx: number, dy: number): void {
    this.zoomBehaviour.translateBy(svg, dx, dy);
  }

  public zoomTo(svg: any, scale: number, duration: number = 300): void {
    svg.transition()
      .duration(duration)
      .call(this.zoomBehaviour.scaleTo, scale);
  }

  public centerOn(svg: any, point: { x: number; y: number }, scale?: number, duration: number = 500): void {
    const width = parseFloat(svg.attr("width") || window.innerWidth.toString());
    const height = parseFloat(svg.attr("height") || window.innerHeight.toString());
    
    const targetScale = scale ?? d3.zoomTransform(svg.node()).k;
    
    // Calculate transform to center the point
    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(targetScale)
      .translate(-point.x, -point.y);

    svg.transition()
      .duration(duration)
      .call(this.zoomBehaviour.transform, transform);
  }

  public getZoomBehaviour(): any {
    return this.zoomBehaviour;
  }
}
