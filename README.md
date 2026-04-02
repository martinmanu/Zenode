<div align="center">

# Zenode Designer

**A high-performance, D3.js-powered visual workflow canvas for JavaScript.**  
Engineering-first · JSON-schema-driven · Framework-agnostic · Performance-tuned

[![npm version](https://img.shields.io/npm/v/@zenode/designer?style=flat-square&color=4A90E2)](https://www.npmjs.com/package/@zenode/designer)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/martinmanu/Zenode?style=flat-square&color=ffd700)](https://github.com/martinmanu/Zenode/stargazers)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square)](https://www.typescriptlang.org/)
[![D3.js](https://img.shields.io/badge/Powered%20by-D3.js-orange?style=flat-square)](https://d3js.org/)

</div>

---

> **`@zenode/designer`** is Layer 1 of the Zenode ecosystem — the visual canvas that powers everything. Drop it into any JavaScript project (React, Vue, Svelte, or vanilla) and get a production-grade diagramming engine with zero lock-in.

---

## Demo

<p align="center">
  <video src="./assets/demo.mp4" width="100%" autoplay loop muted playsinline style="border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);"></video>
</p>

---

## Key Capabilities

*   **D3-Native Performance**: Leverages the power of D3.js for fine-grained SVG control, ensuring thousands of nodes run smoothly at 60fps.
*   **Infinite Canvas**: A truly unrestricted panning and zooming environment with a synced SVG pattern grid.
*   **Generic History Engine**: Robust undo/redo system based on the Command pattern, capturing full state snapshots for perfect restoration.
*   **Smart Selection**: Integrated single-select, lasso multi-select, and renderer-aware selection overlays.
*   **Extensible Context Pad**: A floating HTML action bar that follows your selection, fully customizable via a simple registration API.
*   **Visual Effects Suite**: Built-in support for status glows, stroke-flow animations, and progress gradients.

---

## The Zenode Ecosystem

Zenode is built as a modular four-layer system. You can adopt one package for a specific need or use the entire stack for a complete workflow solution.

| Layer | Package | Role |
|---|---|---|
| **Layer 1** | `@zenode/designer` | **Visual Canvas**: Shapes, connections, and user interaction (This Package). |
| **Layer 2** | `@zenode/serializer` | **Data Exchange**: High-fidelity export/import (JSON, BPMN 2.0, Mermaid). |
| **Layer 3** | `@zenode/runtime` | **Execution**: Converts diagrams into executable JavaScript workflows. |
| **Layer 4** | `@zenode/transformer` | **Output Shaping**: User-defined data mapping from execution results. |

---

## Quick Start

### Installation

```bash
npm install @zenode/designer
```

### Initialization

```html
<div id="canvasContainer" style="width: 100vw; height: 100vh;"></div>

<script type="module">
  import * as Zenode from '@zenode/designer';

  // Initialize with optional configuration
  const engine = Zenode.initializeCanvas('#canvasContainer', {
    canvas: { backgroundColor: '#f8fafc' },
    canvasProperties: {
      snapToGrid: true,
      zoomEnabled: true
    }
  });

  // Create shapes programmatically
  Zenode.createShape('rectangle', 'start-node');
</script>
```

---

## Core Architecture

### The ShapeRenderer Contract

Zenode uses a unique renderer contract. Every shape — whether built-in or custom — must implement this interface. This ensures that features like selection rings, ports, and alignment guides work perfectly across any geometry.

```typescript
export interface ShapeRenderer {
  draw:      (g: D3Selection, config: ResolvedShapeConfig) => void;
  getPath:   (config: ResolvedShapeConfig) => string;     // Exact SVG path data
  getBounds: (config: ResolvedShapeConfig) => BoundingBox; // Collision/Selection box
  getPorts:  (config: ResolvedShapeConfig) => PortMap;    // Connection anchors
}
```

### D3 Layer Stack

Layers are strictly ordered to ensure predictable depth management and event bubbling:

1. `g.grid` — The infinite background pattern.
2. `g.connections` — The link/edge layer.
3. `g.placed-nodes` — The primary interactive shapes.
4. `g.preview` — Ghost previews (pointer-events: none).
5. `g.guides` — Alignment assistants.
6. `g.lasso` — Box selection overlay.

---

## Roadmap

| Component | Status | Progress |
|---|---|---|
| **Core Interaction** | ✅ | Drag, Snap, Lasso, Zoom/Pan complete |
| **Connection Engine** | ✅ | Straight, Curved, S-Shape, L-Bent routing |
| **History System** | ✅ | Full Undo/Redo command pattern |
| **Context Pad** | ✅ | Floating actions & Plugin API |
| **BPMN Parity** | 🔨 | Resize handles & lane support in progress |
| **Serialization** | ✅ | Mermaid, XML, DOT & JSON support |
| **Properties** | 🔨 | Schema-driven node panels (Layer 1) |

---

## Why Zenode?

| Feature | React Flow | BPMN.js | **Zenode** |
|---|---|---|---|
| **Agnostic** | ❌ (React only) | ✅ | ✅ (Any Framework) |
| **SVG Control** | Limited | High | **Absolute** |
| **Visual Effects** | Manual | CSS only | **Built-in (Glow/Animate)** |
| **Execution** | ❌ | ❌ | ✅ (via Layer 3) |
| **Plugin-first** | ⚠️ | ❌ | ✅ |

## 🛠 API Reference

<details>
<summary><b>View Complete Engine API (Expand)</b></summary>
<br>

The Zenode Engine is a high-performance, D3.js-powered diagramming library. This reference documented the Layer 1 (Core) APIs available for node management, viewport control, and data serialization.

### 1. Core Lifecycle & Configuration
| API | Description | Usage Example |
|---|---|---|
| `initializeCanvas(selector, config)` | Starts the engine in the target DOM element. | `Zenode.initializeCanvas('#canvas', { ... })` |
| `updateConfig(config)` | Dynamically updates engine settings. | `Zenode.updateConfig({ grid: { visible: false } })` |
| `getDiagramState()` | Returns a JSON snapshot of nodes, edges, and viewport. | `const state = Zenode.getDiagramState()` |
| `clear()` | Wipes all nodes and edges from the workspace. | `Zenode.clear()` |

### 2. Node & Edge Management
| API | Description | Usage Example |
|---|---|---|
| `addNode(config)` | Adds a node. Returns the generated or provided ID. | `const id = Zenode.addNode({ type: 'rectangle', ... })` |
| `removeNode(id)` | Deletes a node and its connections. | `Zenode.removeNode('n1')` |
| `updateNode(id, patch)` | Updates node data (position, meta). | `Zenode.updateNode('n1', { x: 200 })` |
| `addEdge(config)` | Creates a connection. Supports `type` override. | `Zenode.addEdge({ ..., type: 's-shaped' })` |
| `duplicateNode(id)` | Clones a node and its content. | `const newId = Zenode.duplicateNode('n1')` |
| `focusNode(id, opts?)` | Animates the viewport to focus on a node. | `Zenode.focusNode('n1', { zoom: 1.5 })` |

### 3. Data Serialization & Export
| API | Description | Usage Example |
|---|---|---|
| `toXML()` | Exports current state as a Zenode XML string. | `const xml = Zenode.toXML()` |
| `fromXML(xmlString)` | Restores the canvas from a Zenode XML string. | `Zenode.fromXML(myXml)` |
| `toMermaid()` | Generates a Mermaid.js flowchart script. | `console.log(Zenode.toMermaid())` |
| `toDOT()` | Generates a Graphviz/DOT language script. | `const dot = Zenode.toDOT()` |
| `validate()` | Runs structural validation (cycles, orphans). | `const result = Zenode.validate()` |

### 4. Visual Feedback & Status
| API | Description | Usage Example |
|---|---|---|
| `setNodeStatus(id, type)` | Triggers visual cues (`running`, `success`, `error`). | `engine.setNodeStatus('n1', 'error')` |
| `updateNodeContent(id, cnt)` | Sets text, icons, and layout for a node. | `Zenode.updateNodeContent('n1', { items: [...] })` |
| `highlight(id, opts?)` | Pulses a node with target behavior/color. | `engine.highlight('n1', { color: '#ff0000', duration: 3000 })` |

> [!TIP]
> **Deterministic IDs**: If you provide an `id` in `addNode(config)`, the engine will use it strictly. If not, it will return a UUID which you should captured for future calls.

</details>

---

## 🌟 Support Zenode

If you find this project useful, **please consider [leaving a Star](https://github.com/martinmanu/Zenode/stargazers) on  [<u>GitHub!</u>](https://github.com/martinmanu/Zenode) ⭐** It helps the project grow and motivates further development of the execution runtime.

---

<div align="center">

**Built with D3.js · TypeScript .**
 [<u>GitHub</u>](https://github.com/martinmanu/Zenode)

</div>