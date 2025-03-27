// src/core/engine.ts
import { drawCanvas } from "../components/canvas/canvas.js";
import { drawGrid } from "../components/canvas/grid.js";
export class ZenodeEngine {
    constructor(container, config) {
        this.shapes = new Map(); // Using Map for efficient lookups
        this.connections = [];
        this.canvasObject = { svg: null, grid: null, elements: null };
        this.container = container;
        this.config = config;
        this.initializeCanvas();
    }
    initializeCanvas() {
        console.log("Canvas initialized in:", this.container);
        // Setup canvas, grid, etc.
        console.log("Initializing SVG canvas using D3...");
        // Create the canvas using D3
        this.canvasObject = drawCanvas(this.container ? `#${this.container.id}` : "body", this.config.canvas);
        this.svg = this.canvasObject.svg;
        this.grid = this.canvasObject.grid;
        this.elements = this.canvasObject.elements;
        // Draw the grid on the canvas
        drawGrid(this.svg, this.config.canvas, this.grid);
        console.log("SVG canvas and grid created.");
    }
    createShape(type, x, y, name = "") {
        if (this.shapes.has(name)) {
            throw new Error(`A shape with the name '${name}' already exists.`);
        }
        const shape = { type, x, y, name };
        this.shapes.set(name, shape);
        console.log(`Shape created:`, shape);
        // Actual shape creation logic here
    }
    // Not done yet
    createConnection(from, to) {
        if (!this.shapes.has(from) || !this.shapes.has(to)) {
            throw new Error(`One or both shapes ('${from}', '${to}') do not exist.`);
        }
        const connection = { from, to };
        this.connections.push(connection);
        console.log(`Connection created:`, connection);
    }
}
export function initializeCanvas() {
    let engineInstance = new ZenodeEngine(null, {});
    if (engineInstance.container == null) {
        console.log("Canvas not initialized");
    }
    else {
        console.log("Canvas initialized");
        return { canvas: "Initialized" };
    }
    engineInstance.initializeCanvas();
}
export function createShape(type, x, y, name) {
    return new ZenodeEngine(null, {}).createShape(type, x, y, name);
}
// export function createConnection(from: string, to: string) {
//     return new ZenodeEngine(null, {}).createConnection(from, to);
// }
//# sourceMappingURL=engine.js.map