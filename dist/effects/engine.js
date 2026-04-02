import * as d3 from 'd3';

const EFFECTS_STYLE_ID = "zenode-effects-style";
const FLOW_KEYFRAME = "zenode-stroke-flow";
function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
function safeId(value) {
    return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}
function ensureEffectsStyle() {
    if (typeof document === "undefined")
        return;
    if (document.getElementById(EFFECTS_STYLE_ID))
        return;
    const style = document.createElement("style");
    style.id = EFFECTS_STYLE_ID;
    style.textContent = `
@keyframes ${FLOW_KEYFRAME} {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: -16; }
}
@keyframes zenode-pulse {
  0%   { opacity: 0.4; stroke-width: 2px; }
  50%  { opacity: 1.0; stroke-width: 4px; }
  100% { opacity: 0.4; stroke-width: 2px; }
}
@keyframes zenode-shake {
  0%, 100% { transform: translateX(0); }
  25%      { transform: translateX(-2px); }
  75%      { transform: translateX(2px); }
}
`;
    document.head.appendChild(style);
}
function ensureDefs(svg) {
    let defs = svg.select("defs.zenode-effects-defs");
    if (defs.empty()) {
        defs = svg.append("defs").attr("class", "zenode-effects-defs");
    }
    return defs;
}
function ensureGlowFilter(defs, color, intensity) {
    const filterId = `zenode-glow-${safeId(color)}-${Math.round(intensity * 100)}`;
    if (!defs.select(`#${filterId}`).empty())
        return filterId;
    const filter = defs
        .append("filter")
        .attr("id", filterId)
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
    filter
        .append("feDropShadow")
        .attr("dx", 0)
        .attr("dy", 0)
        .attr("stdDeviation", Math.max(0.8, intensity * 2))
        .attr("flood-color", color)
        .attr("flood-opacity", Math.min(1, 0.55 + intensity * 0.25));
    return filterId;
}
function ensureGradient(defs, fromColor, toColor, progress) {
    const gradientId = `zenode-grad-${safeId(fromColor)}-${safeId(toColor)}-${Math.round(progress * 100)}`;
    if (!defs.select(`#${gradientId}`).empty())
        return gradientId;
    const p = clamp01(progress);
    const g = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
    g.append("stop").attr("offset", "0%").attr("stop-color", fromColor);
    g.append("stop").attr("offset", `${Math.round(p * 100)}%`).attr("stop-color", toColor);
    g.append("stop").attr("offset", "100%").attr("stop-color", toColor).attr("stop-opacity", 0.2);
    return gradientId;
}
/**
 * Applies renderer-agnostic visual effects on top of geometry.
 * Effects are strictly visual and never modify getPath/getBounds/getPorts behavior.
 */
function applyEffects(g, path, visualState) {
    var _a, _b, _c, _d, _e;
    g.selectAll(".effect-overlay").remove();
    const effects = visualState === null || visualState === void 0 ? void 0 : visualState.effects;
    if (!effects)
        return;
    const svgNode = (_a = g.node()) === null || _a === void 0 ? void 0 : _a.ownerSVGElement;
    if (!svgNode)
        return;
    ensureEffectsStyle();
    const svg = d3.select(svgNode);
    const defs = ensureDefs(svg);
    const overlay = g
        .append("path")
        .attr("class", "effect-overlay")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "var(--zenode-selection-color, #4A90E2)")
        .attr("stroke-width", 2)
        .style("pointer-events", "none");
    let hasAnyEffect = false;
    if (effects.glow) {
        const intensity = Math.max(0.1, (_b = effects.glow.intensity) !== null && _b !== void 0 ? _b : 1);
        const color = (_c = effects.glow.color) !== null && _c !== void 0 ? _c : "var(--zenode-status-running, #5DADE2)";
        const filterId = ensureGlowFilter(defs, color, intensity);
        overlay
            .attr("stroke", color)
            .attr("stroke-width", Math.max(2, intensity * 3))
            .attr("filter", `url(#${filterId})`)
            .attr("opacity", 0.85);
        hasAnyEffect = true;
    }
    if (((_d = effects.strokeAnimation) === null || _d === void 0 ? void 0 : _d.type) === "flow") {
        const speed = Math.max(0.2, (_e = effects.strokeAnimation.speed) !== null && _e !== void 0 ? _e : 1);
        const durationSec = 1 / speed;
        overlay
            .attr("stroke-dasharray", "8 8")
            .style("animation", `${FLOW_KEYFRAME} ${durationSec.toFixed(3)}s linear infinite`);
        hasAnyEffect = true;
    }
    if (effects.gradientFlow) {
        const p = clamp01(effects.gradientFlow.progress);
        const gradientId = ensureGradient(defs, effects.gradientFlow.fromColor, effects.gradientFlow.toColor, p);
        overlay.attr("stroke", `url(#${gradientId})`);
        const overlayNode = overlay.node();
        if (overlayNode) {
            const totalLength = Math.max(1, overlayNode.getTotalLength());
            overlay.attr("stroke-dasharray", `${totalLength * p} ${totalLength}`);
        }
        hasAnyEffect = true;
    }
    if (!hasAnyEffect) {
        overlay.remove();
    }
    // --- NODE STATUS EFFECTS ---
    if ((visualState === null || visualState === void 0 ? void 0 : visualState.status) && visualState.status !== "idle") {
        const status = visualState.status;
        let statusColor = "var(--zenode-selection-color)";
        let shouldPulse = false;
        let shouldShake = false;
        switch (status) {
            case "running":
                statusColor = "var(--zenode-status-running, #3b82f6)";
                shouldPulse = true;
                break;
            case "success":
                statusColor = "var(--zenode-status-success, #10b981)";
                break;
            case "error":
                statusColor = "var(--zenode-status-error, #ef4444)";
                shouldShake = true;
                break;
            case "warning":
                statusColor = "var(--zenode-status-warning, #f59e0b)";
                break;
        }
        const statusOverlay = g.append("path")
            .attr("class", "effect-overlay status-overlay")
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke", statusColor)
            .attr("stroke-width", 3)
            .style("pointer-events", "none");
        if (shouldPulse) {
            statusOverlay.style("animation", "zenode-pulse 1.5s ease-in-out infinite");
        }
        if (shouldShake) {
            g.style("animation", "zenode-shake 0.15s ease-in-out 3");
            // remove shake animation class after it runs?
            // Since we re-draw the layer frequently, it's better to just fire it on entry if needed.
            // But for now, a short persistent shake is probably fine if status is error.
        }
        const filterId = ensureGlowFilter(defs, statusColor, 0.8);
        statusOverlay.attr("filter", `url(#${filterId})`);
    }
}

export { applyEffects };
//# sourceMappingURL=engine.js.map
