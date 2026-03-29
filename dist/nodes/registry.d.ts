import { ShapeRenderer } from "../types/index.js";
export declare class ShapeRegistry {
    private renderers;
    register(name: string, renderer: ShapeRenderer): void;
    get(name: string): ShapeRenderer;
    has(name: string): boolean;
    list(): string[];
}
