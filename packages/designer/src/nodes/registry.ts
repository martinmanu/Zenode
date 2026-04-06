import { ShapeRenderer } from "@zenode/core";

export class ShapeRegistry {
  private renderers = new Map<string, ShapeRenderer>();

  register(name: string, renderer: ShapeRenderer): void {
    this.renderers.set(name, renderer);
  }

  get(name: string): ShapeRenderer {
    const renderer = this.renderers.get(name);
    if (!renderer) {
      throw new Error(`Shape "${name}" is not registered in ShapeRegistry`);
    }
    return renderer;
  }

  has(name: string): boolean {
    return this.renderers.has(name);
  }

  list(): string[] {
    return [...this.renderers.keys()];
  }
}
