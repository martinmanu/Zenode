<div align="center">
  <img src="../../assets/demo.svg" width="100%" alt="Zenode Designer Preview">
</div>

<div align="center">

# @zenode/designer
**The high-performance core engine of the Zenode ecosystem.**

This package contains the D3.js-powered visual canvas. It is responsible for shape rendering, infinite panning/zooming, interaction events, and the robust history engine.

[![npm version](https://img.shields.io/npm/v/@zenode/designer?style=flat-square&color=4A90E2)](https://www.npmjs.com/package/@zenode/designer)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square)](https://www.typescriptlang.org/)

[**Live Demo →**](https://zenode-designer.vercel.app) · [**Report Bug →**](https://github.com/martinmanu/Zenode/issues)

</div>

---

## Key Capabilities

*   **D3-Native Performance**: Leverages the power of D3.js for fine-grained SVG control, ensuring thousands of nodes run smoothly at 60fps.
*   **Infinite Canvas**: A truly unrestricted panning and zooming environment with a synced SVG pattern grid.
*   **Generic History Engine**: Robust undo/redo system based on the Command pattern.
*   **Smart Selection**: Integrated single-select, lasso multi-select, and renderer-aware selection overlays.
*   **Extensible Context Pad**: A floating HTML action bar that follows your selection, fully customizable via a simple registration API.
*   **Visual Grouping**: Encapsulate multiple nodes within collective boundaries with synced movement and ghost previews.
*   **Visual Effects Suite**: Built-in support for status glows, stroke-flow animations, and progress gradients.

---

## 🚀 Installation

```bash
npm install @zenode/designer
```

## ⚡ Quick Start

```html
<div id="canvasContainer" style="width: 100vw; height: 100vh;"></div>

<script type="module">
  import * as Zenode from '@zenode/designer';

  // Initialize with optional configuration
  const engine = Zenode.initializeCanvas('#canvasContainer', {
    canvasProperties: {
      snapToGrid: true
    }
  });

  // Programmatically add a node
  Zenode.addNode({ type: 'circle', x: 200, y: 300 });
</script>
```

---

## 🛠 Complete API Reference

The Zenode Designer Engine provides a comprehensive set of APIs for managing diagram state and user interaction.

### 1. Core Lifecycle & Configuration
| API | Description |
|---|---|
| `initializeCanvas(selector, config)` | Starts the engine in the target DOM element. |
| `updateConfig(config)` | Dynamically updates engine settings (grid, colors, etc). |
| `resizeCanvas(w, h)` | Updates canvas dimensions (e.g., on window resize). |
| `clear()` | Wipes all nodes and edges from the workspace. |
| `getDiagramState()` | Returns a pure JSON snapshot (Contract via `@zenode/core`). |

### 2. Node & Edge Management
| API | Description |
|---|---|
| `addNode(config)` | Adds a node. Returns the generated or provided ID. |
| `removeNode(id)` | Deletes a node and its connections. |
| `updateNode(id, patch)` | Updates node data (position, meta). |
| `addEdge(config)` | Creates a connection. Supports `straight`, `curved`, `s-shaped`, `l-bent`. |
| `duplicateNode(id)` | Clones a node and its content. |
| `focusNode(id, opts?)` | Animates the viewport to focus on a node. |
| `groupSelection()` | Encapsulates the current selection within a visual group boundary. |
| `ungroupSelection()` | Break apart active selection or selected group. |
| `toggleGroupingSelection()` | Smart toggle: groups selected nodes, or ungroups if matching. |
| `bringToFront(ids)` | Moves nodes to the highest layer. |
| `sendToBack(ids)` | Moves nodes to the lowest layer. |

### 3. Visual Feedback & Status
| API | Description |
|---|---|
| `setNodeStatus(id, type)` | Triggers visual cues (`running`, `success`, `error`). |
| `updateNodeContent(id, cnt)` | Sets text, icons, and layout for a node. |
| `highlight(id, opts?)` | Pulses a node with target behavior/color. |

### 4. Placement & Interaction
| API | Description |
|---|---|
| `placeShapeAt(type, id, x, y)` | Immediately places a shape at exact canvas coordinates. |
| `placeShapeAtSafePos(type, id)` | Finds the nearest non-overlapping spot in viewport. |
| `handleDrop(event)` | Native DND handler: parses drop data and places shape at mouse. |
| `startPlacement(type, id, data?)` | Enters placement mode with a ghost preview FOLLOWING the mouse. |
| `cancelPlacement()` | Aborts placement mode and removes preview. |

---

## 🏗 Core Architecture

### The ShapeRenderer Contract
Zenode uses a unique renderer contract. Every shape must implement this interface, ensuring features like selection rings and ports work perfectly across any geometry.

```typescript
export interface ShapeRenderer {
  draw:      (g: D3Selection, config: ResolvedShapeConfig) => void;
  getPath:   (config: ResolvedShapeConfig) => string;     // Exact SVG path data
  getBounds: (config: ResolvedShapeConfig) => BoundingBox; // Collision/Selection box
  getPorts:  (config: ResolvedShapeConfig) => PortMap;    // Connection anchors
}
```

---

## 🌟 Support Zenode
If you find this project useful, **please consider [leaving a Star](https://github.com/martinmanu/Zenode/stargazers) on [GitHub!](https://github.com/martinmanu/Zenode)** ⭐

---

<div align="center">

**Built with D3.js · TypeScript · part of the Zenode Ecosystem.**  
[<u>GitHub</u>](https://github.com/martinmanu/Zenode)

</div>
