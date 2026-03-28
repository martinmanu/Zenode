# Zenode Project Analysis & Roadmap

## Project Idea Prompt
> **Zenode**: A high-performance, D3.js-powered workflow UI visualizer designed for total developer control. It offers a "plug-and-play" architecture where users can define custom shapes, grid systems, and granular event handlers through a rich JSON-driven configuration. Zenode is built to be the flexible backbone for any diagramming tool, process flow visualizer, or logic-based UI editor.

## Current State: What is Done
The foundation of the engine is well-structured and uses a modern TypeScript-first approach with D3.js for rendering.

### Core Engine & Canvas
- [x] **D3.js Integration**: Solid base for SVG manipulation and high-performance rendering.
- [x] **Modular Engine**: [ZenodeEngine](file:///c:/Users/marti/OneDrive/Documents/Zenode/Zenode/src/core/engine.ts#14-118) centralizes canvas initialization, element management, and state.
- [x] **Zoom & Pan**: Fully implemented with configurable extents, scroll, and double-click behaviors.
- [x] **Customizable Grid**: Support for dotted, sheet, line, and cross grid types with configurable size, color, and transparency.
- [x] **Configuration Merger**: Robust system to merge user-provided configs with defaults.

### Components & Shapes
- [x] **Primitive Shapes**: Implementations for `Rectangle` (with per-corner border radius), `Circle`, and `Rhombus`.
- [x] **Shape Preview**: Real-time preview of shapes on the canvas before placement, including snapping to grid.
- [x] **Asset Management**: Basic structure for markers and SVG assets.

### Events & Models
- [x] **Rich Config Model**: Detailed interfaces for every aspect of the UI (Canvas, Shapes, Connections, Global Properties).
- [x] **Basic Event Flow**: Initial setup for `mouseMove` and `mouseClick` events.

---

## Roadmap: What Should Be Done Next
To reach the goal of a "fully customizable workflow UI", several key features need implementation or refinement:

### 1. Shape Lifecycle & Interaction
- [ ] **Shape Placement**: Complete the `mouseClick` logic to move a shape from "preview" to a permanent "placed" state.
- [ ] **Drag & Drop**: Implement the ability to select and move placed nodes around the canvas with snapping support.
- [ ] **Deletion & Selection**: Logic for deleting shapes and multi-selection (Lasso tool).

### 2. Advanced Connections
- [ ] **Dynamic Connectors**: Implementation of Straight, Curved, S-Shaped, and L-Bent lines.
- [ ] **Routing Logic**: Smart routing to prevent lines from overlapping shapes or to ensure clean intersections.
- [ ] **Connector Anchors**: Specific "ports" on shapes where connections can start or end.

### 3. Customization & Extensibility (The "Core" Promise)
- [ ] **Custom Shape Registry**: A formal way for users to register their own SVG templates or HTML components as nodes.
- [ ] **Node Callbacks**: Mapping user-defined event handlers (`onClick`, `onHover`, `onUpdate`) from the config to actual DOM/SVG listeners.
- [ ] **Plugin System**: Fully implement the `PluginManager` to allow third-party extensions (e.g., auto-layout, export to PNG/PDF).

### 4. Persistence & Tooling
- [ ] **JSON State Export**: Ability to export the current canvas state to a JSON file and re-load it perfectly.
- [ ] **Alignment Lines**: Implementation of visual guides when moving shapes to align them with others.
