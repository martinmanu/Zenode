import { D3Selection, VisualState } from "../types/index.js";
/**
 * Applies renderer-agnostic visual effects on top of geometry.
 * Effects are strictly visual and never modify getPath/getBounds/getPorts behavior.
 */
export declare function applyEffects(g: D3Selection, path: string, visualState?: VisualState): void;
