// src/core/engine.ts
import { drawCanvas, lockedCanvas } from "../components/canvas/canvas.js";
import { drawGrid, toggleGrid } from "../components/canvas/grid.js";
import { Config } from "../model/configurationModel.js";
import { EventManager } from "./eventManager.js";
import { ZoomManager } from "./zoom&PanManager.js";

export class ZenodeEngine {
  public container!: HTMLElement | null;
  private config: any;
  public svg: any;
  private grid: any;
  private alignmentLine: any;
  private elements: any;
  private zoomBehaviour: any;
  private shapes: Map<string, any> = new Map();
  private connections: any[] = [];
  private eventManager: EventManager;
  public zoomManager!: ZoomManager;
  public canvasObject: {
    svg: any;
    grid: any;
    elements: any;
    canvasContainer: any;
  } = { svg: null, grid: null, elements: null, canvasContainer: null };
  private canvasContainerGroup: any;

  constructor(container: HTMLElement | null, config: Config | {}) {
    this.container = container;
    this.config = config;
    this.eventManager = new EventManager();
    this.initializeCanvas();
  }

  initializeCanvas() {
    this.canvasObject = drawCanvas(
      this.container ? `#${this.container.id}` : "body",
      this.config.canvas
    );
    this.svg = this.canvasObject.svg;

    this.grid = drawGrid(this.svg, this.config.canvas, this.canvasObject.grid);
    this.alignmentLine = this.svg.append("g").attr("class", "alignment-line");
    this.canvasContainerGroup = this.canvasObject.canvasContainer;
    this.zoomManager = new ZoomManager(
      this.canvasContainerGroup,
      this.svg,
      this.config,
      (eventType: any, event: any) => {
        this.eventManager.trigger(eventType, event);
      }
    );

    console.log("SVG canvas and grid created.");
  }

  on(eventType: string, callback: (event: any) => void) {
    this.eventManager.on(eventType, callback);
  }

  /**
   * Creates a shape on the canvas.
   * @param type The type of shape ('rectangle' or 'circle').
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   * @param name Optional name (used as an identifier).
   */
  createShape(type: string, x: number, y: number, name = "") {
    if (this.shapes.has(name)) {
      throw new Error(`A shape with the name '${name}' already exists.`);
    }

    const shape = { type, x, y, name };
    this.shapes.set(name, shape);
    console.log(`Shape created:`, shape);
    // Actual shape creation logic here
    this.eventManager.trigger("shapePlaced", shape);

  }

  // Not done yet
  /**
   * Creates a connection between two shapes.
   * @param from The name of the first shape.
   * @param to The name of the second shape.
   */
  createConnection(from: string, to: string) {
    if (!this.shapes.has(from) || !this.shapes.has(to)) {
      throw new Error(`One or both shapes ('${from}', '${to}') do not exist.`);
    }

    const connection = { from, to };
    this.connections.push(connection);
    console.log(`Connection created:`, connection);
  }

  lockedTheCanvas(locked: boolean) {
    lockedCanvas(locked, this.svg, this.zoomBehaviour)
  }

  gridToggles(toggle: boolean) {
    toggleGrid(toggle)
  }
}

let engineInstance: ZenodeEngine | null = null;

export function initializeCanvas(
  container: HTMLElement | null,
  config: Config | {}
) {
  if (!engineInstance) {
    engineInstance = new ZenodeEngine(container, config);
    console.log("Canvas initialized");
  } else {
    console.log("Canvas already initialized");
  }
  return engineInstance;
}

export function createShape(type: string, x: number, y: number, name?: string) {
  if (!engineInstance) {
    throw new Error("Engine is not initialized. Call initializeCanvas first.");
  }
  return engineInstance.createShape(type, x, y, name);
}

export function gridToggle(toggle: boolean){
  if (!engineInstance) {
    throw new Error("Engine is not initialized. Call initializeCanvas first.");
  }
  return engineInstance.gridToggles(toggle);
}

export function lockCanvas(isLocked: boolean) {
  if (!engineInstance) {
    throw new Error("Engine is not initialized. Call initializeCanvas first.");
  }
  engineInstance.lockedTheCanvas(isLocked);
}

export function alignmentLineToggle(toggle: boolean) {

}

export function deleteShape(toggle: boolean , shapeid: number) {
  
}

export function resetCanvas(config: Config){

}

export function activateLassoTool(activate: boolean) {

}

export function createConnection(from: string, to: string) {
}
