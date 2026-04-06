import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { RenderApi } from "../nodes/placement.js";

interface HandleData {
    x: number;
    y: number;
    cursor: string;
    type: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
}

/**
 * Creates a resize behavior for node handles (NW, N, NE, E, SE, S, SW, W).
 * Handles coordinate compensation so the opposite handle stays fixed.
 */
export function createResizeBehavior(api: RenderApi) {
    let initialDimensions: { x: number, y: number, w: number, h: number } | null = null;
    let initialPointers = { x: 0, y: 0 };

    return d3.drag<SVGRectElement, HandleData>()
        .on("start", function (event, handle) {
            event.sourceEvent?.stopPropagation();
            const g = d3.select(this.parentNode!.parentNode as SVGGElement);
            const node = g.datum() as PlacedNode;
            
            initialDimensions = {
                x: node.x,
                y: node.y,
                w: node.width ?? 120,
                h: node.height ?? 60
            };

            const svgGroupNode = api.canvasObject.elements.node() as SVGGElement;
            const [px, py] = d3.pointer(event.sourceEvent, svgGroupNode);
            initialPointers = { x: px, y: py };

            api.beginOperation(node.id, 'resize');
        })
        .on("drag", function (event, handle) {
            if (!initialDimensions) return;
            const g = d3.select(this.parentNode!.parentNode as SVGGElement);
            const node = g.datum() as PlacedNode;

            const svgGroupNode = api.canvasObject.elements.node() as SVGGElement;
            const [px, py] = d3.pointer(event.sourceEvent, svgGroupNode);
            const dx = px - initialPointers.x;
            const dy = py - initialPointers.y;

            let { x, y, w, h } = initialDimensions;
            const minSize = 20;

            // Logic for each handle
            if (handle.type.includes('e')) w = Math.max(minSize, w + dx);
            if (handle.type.includes('s')) h = Math.max(minSize, h + dy);
            
            if (handle.type.includes('w')) {
                const newW = Math.max(minSize, w - dx);
                x = x - (newW - w) / 2; // Compensate for centered layout
                w = newW;
            }
            if (handle.type.includes('n')) {
                const newH = Math.max(minSize, h - dy);
                y = y - (newH - h) / 2;
                h = newH;
            }

            // Correct for centered coordinates: 
            // In Zenode, nodes are centered at (x,y). 
            // If we drag 'e', the width increases and 'x' must shift by half the increase 
            // to keep the 'w' (left) side fixed in visual space.
            let finalX = initialDimensions.x;
            let finalY = initialDimensions.y;

            if (handle.type.includes('e')) finalX += (w - initialDimensions.w) / 2;
            if (handle.type.includes('w')) finalX -= (w - initialDimensions.w) / 2;
            if (handle.type.includes('s')) finalY += (h - initialDimensions.h) / 2;
            if (handle.type.includes('n')) finalY -= (h - initialDimensions.h) / 2;

            api.updateNodePosition(node.id, finalX, finalY, false);
            api.updateNodeDimensions(node.id, { width: w, height: h }, false);
        })
        .on("end", function (event, d) {
            api.endOperation();
            initialDimensions = null;
        });
}
