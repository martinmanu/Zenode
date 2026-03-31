import type { VisualState, NodeContent } from "../types/index.js";
export interface Connection {
    id: string;
    source: string;
    target: string;
    type: string;
    label?: string;
    visualState?: VisualState;
}
export interface Node {
    id: string;
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    name?: string;
    icon?: string;
    data?: any;
    visualState?: VisualState;
}
/** A node that has been placed on the canvas. Stored in engine state. */
export interface PlacedNode {
    id: string;
    type: string;
    /** Config variant id (e.g. "task0") for style lookup */
    shapeVariantId: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    rotation?: number;
    /** Original dimensions at placement — used to constrain resize min/max */
    baseDimensions?: {
        width?: number;
        height?: number;
        radius?: number;
    };
    /** User-defined data attached to the node */
    meta: Record<string, unknown>;
    visualState?: VisualState;
    /** Content items (text, icon, image) + layout mode rendered inside the shape */
    content?: NodeContent;
}
export interface ShapeConfig {
    type: string;
    width?: number;
    height?: number;
    radius?: number;
    color?: string;
    strokeWidth?: number;
    strokeColor?: string;
    textColor?: string;
    boxShadow?: string;
}
export interface ShapePreviewData {
    type: 'text' | 'svg' | 'image';
    position: {
        x: number;
        y: number;
    };
    size: number;
    color?: string;
}
export interface CanvasElements {
    svg: any;
    grid: any;
    elements: any;
    canvasContainer: any;
    /** Layer for connection lines (below placed nodes) */
    connections: any;
    /** Layer for ghost connection (highest layer, but below guides) */
    ghostConnection: any;
    /** Layer for placed nodes (above grid/connections, below preview) */
    placedNodes: any;
    /** Layer for alignment guides (highest layer) */
    guides: any;
    /** Layer for lasso selection rectangle */
    lasso: any;
}
