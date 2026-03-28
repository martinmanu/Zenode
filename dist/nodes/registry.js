class ShapeRegistry {
    constructor() {
        this.renderers = new Map();
    }
    register(name, renderer) {
        this.renderers.set(name, renderer);
    }
    get(name) {
        const renderer = this.renderers.get(name);
        if (!renderer) {
            throw new Error(`Shape "${name}" is not registered in ShapeRegistry`);
        }
        return renderer;
    }
    has(name) {
        return this.renderers.has(name);
    }
    list() {
        return [...this.renderers.keys()];
    }
}

export { ShapeRegistry };
//# sourceMappingURL=registry.js.map
