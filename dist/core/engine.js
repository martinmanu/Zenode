export class ZenodeEngine {
    constructor(container, config) {
        this.shapes = new Map(); // Using Map for efficient lookups
        this.connections = [];
        this.container = container ? container : null;
        this.config = config;
        this.initializeCanvas();
    }
    initializeCanvas() {
        console.log("Canvas initialized in:", this.container);
        // Setup canvas, grid, etc.
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
    let x = new ZenodeEngine(null, {});
    if (x.container == null) {
        console.log("Canvas not initialized");
    }
    else {
        console.log("Canvas initialized");
        return { canvas: "Initialized" };
    }
    x.initializeCanvas();
}
export function createShape(type, x, y, name) {
    return new ZenodeEngine(null, {}).createShape(type, x, y, name);
}
// export function createConnection(from: string, to: string) {
//     return new ZenodeEngine(null, {}).createConnection(from, to);
// }
//# sourceMappingURL=engine.js.map