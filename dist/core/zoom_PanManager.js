import { defaultConfig } from '../config/defaultConfig.js';
import '../node_modules/d3-transition/src/selection/index.js';
import zoom from '../node_modules/d3-zoom/src/zoom.js';
import transform, { identity } from '../node_modules/d3-zoom/src/transform.js';

class ZoomManager {
    constructor(container, svg, config, triggerEvent) {
        this.container = container;
        this.config = config;
        this.zoomBehaviour = zoom()
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
        const initialTransform = identity.scale(initialZoom);
        svg.call(this.zoomBehaviour.transform, initialTransform).transition().duration(zoomDuration);
    }
    zoomBy(svg, factor, duration = 300) {
        const currentTransform = transform(svg.node());
        currentTransform.k * factor;
        svg.transition()
            .duration(duration)
            .call(this.zoomBehaviour.scaleBy, factor);
    }
    zoomTo(svg, scale, duration = 300) {
        svg.transition()
            .duration(duration)
            .call(this.zoomBehaviour.scaleTo, scale);
    }
    centerOn(svg, point, scale, duration = 500) {
        const width = parseFloat(svg.attr("width") || window.innerWidth.toString());
        const height = parseFloat(svg.attr("height") || window.innerHeight.toString());
        const targetScale = scale !== null && scale !== void 0 ? scale : transform(svg.node()).k;
        // Calculate transform to center the point
        const transform$1 = identity
            .translate(width / 2, height / 2)
            .scale(targetScale)
            .translate(-point.x, -point.y);
        svg.transition()
            .duration(duration)
            .call(this.zoomBehaviour.transform, transform$1);
    }
}

export { ZoomManager };
//# sourceMappingURL=zoom_PanManager.js.map
