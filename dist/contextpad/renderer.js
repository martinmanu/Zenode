import '../node_modules/d3-transition/src/selection/index.js';
import transform from '../node_modules/d3-zoom/src/transform.js';

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
                    action.handler(this.currentTarget, engine);
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
    }
    /**
     * Updates the pad position based on the current zoom transform.
     */
    updatePosition(engine) {
        var _a, _b, _c, _d, _e, _f;
        if (!this.padElement || !this.currentTarget)
            return;
        const config = engine.config.canvasProperties.contextPad || {
            position: "top-right",
            offset: { x: 10, y: -10 }};
        const svg = engine.svg;
        const transform$1 = transform(svg.node());
        let x = 0;
        let y = 0;
        if (this.currentTarget.kind === 'node') {
            const id = this.currentTarget.id;
            // Fetch latest data from engine to ensure we have latest coordinates during drag
            const node = engine.getPlacedNode(id);
            if (!node)
                return;
            const style = engine.getShapeStyle(node);
            const w = ((_a = style === null || style === void 0 ? void 0 : style.width) !== null && _a !== void 0 ? _a : 100);
            const h = ((_b = style === null || style === void 0 ? void 0 : style.height) !== null && _b !== void 0 ? _b : 100);
            // Base canvas coordinates
            let canvasX = node.x;
            let canvasY = node.y;
            // Apply anchor position
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
            // Project to screen
            x = canvasX * transform$1.k + transform$1.x;
            y = canvasY * transform$1.k + transform$1.y;
        }
        else {
            // For edges, position at midpoint
            x = transform$1.x;
            y = transform$1.y;
        }
        // Apply offset from config
        const offsetX = (_d = (_c = config.offset) === null || _c === void 0 ? void 0 : _c.x) !== null && _d !== void 0 ? _d : 10;
        const offsetY = (_f = (_e = config.offset) === null || _e === void 0 ? void 0 : _e.y) !== null && _f !== void 0 ? _f : -10;
        let finalX = x + offsetX;
        let finalY = y + offsetY;
        // --- Containment Logic ---
        // Ensure the pad stays within the container viewport
        const padRect = this.padElement.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        const padding = 10; // Margin from edges
        // Clamp X
        if (finalX + padRect.width > containerRect.width - padding) {
            finalX = containerRect.width - padRect.width - padding;
        }
        if (finalX < padding) {
            finalX = padding;
        }
        // Clamp Y
        if (finalY + padRect.height > containerRect.height - padding) {
            finalY = containerRect.height - padRect.height - padding;
        }
        if (finalY < padding) {
            finalY = padding;
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
        this.currentTarget = null;
        this.currentActions = [];
    }
}

export { ContextPadRenderer };
//# sourceMappingURL=renderer.js.map
