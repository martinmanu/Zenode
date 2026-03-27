import { defaultConfig } from '../config/defaultConfig.js';
import * as d3 from 'd3';

class ZoomManager {
    constructor(container, svg, config, triggerEvent) {
        this.container = container;
        this.config = config;
        this.zoomBehaviour = d3.zoom()
            .scaleExtent(this.config.canvasProperties.zoomExtent)
            .translateExtent([
            [-1e4, -1e4], [10000, 10000]
        ])
            .filter((event) => {
            // When lasso tool is enabled, block drag-pan so background drag draws lasso instead.
            if (event.type === "mousedown" && svg.attr("data-lasso-enabled") === "true")
                return false;
            if (event.type === "dblclick")
                return false;
            if (!this.config.canvasProperties.zoomOnScroll && event.type === "wheel")
                return false;
            if (!this.config.canvasProperties.panEnabled && event.type === "mousedown")
                return false;
            if (event.type === "wheel")
                return event.ctrlKey || event.metaKey || event.button === 1;
            return true;
        })
            .on("start", (event) => triggerEvent("zoomStart", event))
            .on("zoom", (event) => {
            this.container.attr("transform", event.transform);
            triggerEvent("zoom", event);
        })
            .on("end", (event) => triggerEvent("zoomEnd", event));
        svg.call(this.zoomBehaviour);
        const initialZoom = config.canvasProperties.zoomScale || defaultConfig.canvasProperties.zoomScale;
        const zoomDuration = config.canvasProperties.zoomDuration || defaultConfig.canvasProperties.zoomDuration;
        const initialTransform = d3.zoomIdentity.scale(initialZoom);
        svg.call(this.zoomBehaviour.transform, initialTransform).transition().duration(zoomDuration);
        //addMarkers
    }
}

export { ZoomManager };
//# sourceMappingURL=zoom_PanManager.js.map
