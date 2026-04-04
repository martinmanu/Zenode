import * as d3 from 'd3';

class ContextPadRenderer {
    constructor(container) {
        this.padElement = null;
        this.currentTarget = null;
        this.currentActions = [];
        this.container = container;
    }
    /**
     * Renders the context pad for a specific target.
     */
    render(target, actions, engine) {
        this.hide();
        if (actions.length === 0)
            return;
        // Sort actions by order (lower is first)
        const sortedActions = [...actions].sort((a, b) => { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 100) - ((_b = b.order) !== null && _b !== void 0 ? _b : 100); });
        this.currentTarget = target;
        this.currentActions = sortedActions;
        this.padElement = document.createElement("div");
        this.padElement.className = "zenode-context-pad";
        this.padElement.style.position = "absolute";
        this.renderButtons(engine);
        this.container.appendChild(this.padElement);
        this.updatePosition(engine);
        this.applyStyles(engine);
        // Initialize Lucide icons if the library is available globally
        if (typeof window.lucide !== 'undefined') {
            window.lucide.createIcons({
                nameAttr: 'data-lucide',
                attrs: {
                    width: '16px',
                    height: '16px'
                }
            });
        }
        // Emit framework event
        engine.emit("contextpad:open", { target: this.currentTarget, actions: this.currentActions });
    }
    /**
     * Applies configurable styles to the pad and buttons.
     */
    applyStyles(engine) {
        if (!this.padElement)
            return;
        const config = engine.config.canvasProperties.contextPad || {};
        const style = config.style || {};
        // Apply pad container styles
        if (style.backgroundColor)
            this.padElement.style.background = style.backgroundColor;
        if (style.borderColor)
            this.padElement.style.borderColor = style.borderColor;
        if (style.borderWidth)
            this.padElement.style.borderWidth = style.borderWidth;
        if (style.borderRadius)
            this.padElement.style.borderRadius = style.borderRadius;
        if (style.boxShadow)
            this.padElement.style.boxShadow = style.boxShadow;
        if (style.backdropBlur) {
            this.padElement.style.backdropFilter = `blur(${style.backdropBlur}) saturate(180%)`;
            this.padElement.style.webkitBackdropFilter = `blur(${style.backdropBlur}) saturate(180%)`;
        }
        if (style.padding)
            this.padElement.style.padding = style.padding;
        // Apply layout
        const layout = config.layout || "horizontal";
        if (layout === "grid") {
            this.padElement.style.display = "grid";
            this.padElement.style.gridTemplateColumns = `repeat(${config.gridColumns || 3}, 1fr)`;
            this.padElement.style.flexDirection = ""; // reset flex
        }
        else {
            this.padElement.style.display = "flex";
            this.padElement.style.flexDirection = layout === "vertical" ? "column" : "row";
            this.padElement.style.gridTemplateColumns = ""; // reset grid
        }
        // Apply button styles via CSS variables on the container
        if (style.buttonWidth)
            this.padElement.style.setProperty('--zenode-context-btn-width', style.buttonWidth);
        if (style.buttonHeight)
            this.padElement.style.setProperty('--zenode-context-btn-height', style.buttonHeight);
        if (style.buttonPadding)
            this.padElement.style.setProperty('--zenode-context-btn-padding', style.buttonPadding);
        if (style.buttonMargin)
            this.padElement.style.setProperty('--zenode-context-btn-margin', style.buttonMargin);
        if (style.iconColor)
            this.padElement.style.setProperty('--zenode-context-btn-color', style.iconColor);
        if (style.buttonHoverColor) {
            this.padElement.style.setProperty('--zenode-context-btn-hover', style.buttonHoverColor);
        }
        if (style.buttonActiveColor) {
            this.padElement.style.setProperty('--zenode-context-btn-active', style.buttonActiveColor);
        }
    }
    /**
     * Renders the buttons inside the pad.
     */
    renderButtons(engine) {
        if (!this.padElement || !this.currentTarget)
            return;
        this.padElement.innerHTML = "";
        this.currentActions.forEach(action => {
            const btn = document.createElement("button");
            btn.className = `zenode-context-btn ${action.group || ""}`;
            btn.innerHTML = action.icon;
            btn.title = action.tooltip;
            // Apply individual action style overrides if present
            if (action.style) {
                if (action.style.color)
                    btn.style.color = action.style.color;
                if (action.style.hoverColor)
                    btn.style.setProperty('--zenode-context-btn-hover', action.style.hoverColor);
                if (action.style.activeColor)
                    btn.style.setProperty('--zenode-context-btn-active', action.style.activeColor);
            }
            const disabled = action.isDisabled && action.isDisabled(this.currentTarget, engine);
            const active = action.isActive && action.isActive(this.currentTarget, engine);
            if (disabled) {
                btn.disabled = true;
                btn.classList.add("disabled");
            }
            else {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    // Emit click event
                    engine.emit("contextpad:action:click", { action, target: this.currentTarget });
                    action.handler(this.currentTarget, engine, e);
                    // Refresh pad after action
                    this.update(engine);
                };
            }
            if (active) {
                btn.classList.add("active");
            }
            this.padElement.appendChild(btn);
        });
    }
    /**
     * Updates only the states of the buttons without re-rendering the whole pad.
     */
    update(engine) {
        if (!this.padElement || !this.currentTarget)
            return;
        this.renderButtons(engine);
        // Initialize Lucide icons if the library is available globally
        if (typeof window.lucide !== 'undefined') {
            window.lucide.createIcons({
                nameAttr: 'data-lucide',
                attrs: {
                    width: '16px',
                    height: '16px'
                }
            });
        }
    }
    /**
     * Updates the pad position based on the current zoom transform.
     */
    updatePosition(engine) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        if (!this.padElement || !this.currentTarget)
            return;
        const config = engine.config.canvasProperties.contextPad || {
            position: "top-right",
            offset: { x: 10, y: -10 }};
        const svg = engine.svg;
        const transform = d3.zoomTransform(svg.node());
        let x = 0;
        let y = 0;
        if (this.currentTarget.kind === 'node') {
            const id = this.currentTarget.id;
            // Fetch latest data from engine to ensure we have latest coordinates during drag
            const node = engine.getPlacedNode(id);
            if (!node)
                return;
            const style = engine.getShapeStyle(node);
            // Prioritize actual node dimensions (updated during resize) over static shape variant config
            let w = ((_b = (_a = node.width) !== null && _a !== void 0 ? _a : style === null || style === void 0 ? void 0 : style.width) !== null && _b !== void 0 ? _b : 100);
            let h = ((_d = (_c = node.height) !== null && _c !== void 0 ? _c : style === null || style === void 0 ? void 0 : style.height) !== null && _d !== void 0 ? _d : 100);
            // Handle circular shapes where dimensions are defined by radius
            if (node.type === 'circle') {
                const r = (_f = (_e = node.radius) !== null && _e !== void 0 ? _e : style === null || style === void 0 ? void 0 : style.radius) !== null && _f !== void 0 ? _f : 30;
                w = r * 2;
                h = r * 2;
            }
            // node.x and node.y are the center of the node.
            // Convert to top-left of the bounding box.
            let canvasX = node.x - w / 2;
            let canvasY = node.y - h / 2;
            // Apply anchor position to the shape's bounding box
            switch (config.position) {
                case "top-right":
                    canvasX += w;
                    break;
                case "top-left": break;
                case "bottom-right":
                    canvasX += w;
                    canvasY += h;
                    break;
                case "bottom-left":
                    canvasY += h;
                    break;
                case "top-center":
                    canvasX += w / 2;
                    break;
                case "bottom-center":
                    canvasX += w / 2;
                    canvasY += h;
                    break;
            }
            // Project to screen coordinate system
            x = canvasX * transform.k + transform.x;
            y = canvasY * transform.k + transform.y;
        }
        else {
            // For edges, position at midpoint
            const edgeId = this.currentTarget.id;
            const svgPath = (_g = engine.container) === null || _g === void 0 ? void 0 : _g.querySelector(`.connection[data-connection-id="${edgeId}"] path.connection-line`);
            if (svgPath && typeof svgPath.getTotalLength === 'function') {
                const totalLen = svgPath.getTotalLength();
                const midpoint = svgPath.getPointAtLength(totalLen / 2);
                x = midpoint.x * transform.k + transform.x;
                y = midpoint.y * transform.k + transform.y;
            }
            else {
                x = transform.x;
                y = transform.y;
            }
        }
        // Calculate pad dimensions for proper offset adjustment
        const padWidth = this.padElement.offsetWidth;
        this.padElement.offsetHeight;
        // Configuration offsets
        const baseOffsetX = (_j = (_h = config.offset) === null || _h === void 0 ? void 0 : _h.x) !== null && _j !== void 0 ? _j : 10;
        const baseOffsetY = (_l = (_k = config.offset) === null || _k === void 0 ? void 0 : _k.y) !== null && _l !== void 0 ? _l : -10;
        let finalX = x;
        let finalY = y;
        // Refined alignment logic to prevent overlap regardless of position type
        const position = config.position || "top-right";
        if (position.includes("right")) {
            finalX += baseOffsetX;
        }
        else if (position.includes("left")) {
            finalX -= (padWidth + baseOffsetX);
        }
        else if (position.includes("center")) {
            finalX -= padWidth / 2;
        }
        if (position.includes("top")) {
            finalY += baseOffsetY;
        }
        else if (position.includes("bottom")) {
            finalY -= baseOffsetY; // If offset.y is -10 (standard), this moves it down by 10
        }
        this.padElement.style.left = `${finalX}px`;
        this.padElement.style.top = `${finalY}px`;
        // Re-apply styles ensures that if the config was updated (e.g. testConfig.ts), 
        // the visuals update immediately during the next drag/zoom frame.
        this.applyStyles(engine);
    }
    /**
     * Hides and removes the context pad.
     */
    hide(engine) {
        if (this.padElement) {
            if (engine)
                engine.emit("contextpad:close", { target: this.currentTarget });
            this.padElement.remove();
            this.padElement = null;
        }
        // Guarantee sweep of any ghost instances created during rapid interaction
        if (this.container) {
            const ghosts = this.container.querySelectorAll(".zenode-context-pad");
            ghosts.forEach(g => g.remove());
        }
        this.currentTarget = null;
        this.currentActions = [];
    }
}

export { ContextPadRenderer };
//# sourceMappingURL=renderer.js.map
