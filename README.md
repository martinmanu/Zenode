<div align="center">

# ⚡ Zenode Designer

**A high-performance, D3.js-powered visual workflow canvas for JavaScript.**  
Framework-agnostic · JSON-config-driven · Open-core · TypeScript-first

[![npm version](https://img.shields.io/npm/v/@zenode/designer?style=flat-square&color=4A90E2)](https://www.npmjs.com/package/@zenode/designer)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square)](https://www.typescriptlang.org/)
[![D3.js](https://img.shields.io/badge/Powered%20by-D3.js-orange?style=flat-square)](https://d3js.org/)

</div>

---

> **`@zenode/designer`** is Layer 1 of the Zenode ecosystem — the visual canvas that powers everything. Drop it into any JavaScript project (React, Vue, Svelte, or vanilla) and get a production-grade diagramming engine with zero lock-in.

---

## ✨ Feature Highlights

| Feature | Description |
|---|---|
| 🎨 **SVG Canvas** | D3.js powered, zoom, pan, configurable extents |
| 📐 **Grid System** | Dotted, sheet, line, cross — fully configurable |
| 🔷 **Shape System** | Rectangle, Circle, Rhombus — all via `ShapeRenderer` contract |
| 🔌 **Plugin API** | Register custom shapes & context pad actions |
| 🧲 **Smart Snap** | Grid snapping + alignment guides during drag |
| 🔗 **Connections** | Straight, curved, S-shaped, L-bent + Smart Routing (Pro) |
| 🎛 **Context Pad** | Floating HTML action pad, fully extensible |
| 🌊 **Visual Effects** | Glow, stroke-flow animation, gradient progress |
| ⌨️ **Keyboard Shortcuts** | Configurable delete, escape, custom bindings |
| 🔵 **Lasso Selection** | Multi-select with configurable lasso style |
| 🔑 **License System** | Free/Pro tier gating built-in |

---

## 🏗 The Zenode Ecosystem

Zenode is modular by design — adopt one package, expand naturally.

```
@zenode/designer       ← Layer 1 — Visual canvas (THIS PACKAGE)
@zenode/serializer     ← Layer 2 — Export/import formats
@zenode/runtime        ← Layer 3 — Workflow execution engine
@zenode/transformer    ← Layer 4 — Output shape transformation

@zenode/core           ← All four layers pre-wired
```

Each package is independently installable and speaks the same JSON dialect.

---

## 🚀 Quick Start

### Install

```bash
npm install @zenode/designer
# or via CDN
<script src="https://cdn.zenode.dev/zenode.min.js"></script>
```

### 10-Line Setup

```html
<div id="canvas"></div>

<script type="module">
  import * as Zenode from '@zenode/designer';

  Zenode.initializeCanvas('#canvas', {
    canvas: { width: 800, height: 600, backgroundColor: '#1a1a2e' },
    canvasProperties: { zoomEnabled: true, panEnabled: true, snapToGrid: true }
  });

  Zenode.createShape('rectangle', 'node-1');
  Zenode.createShape('circle', 'node-2');
</script>
```

---

## 🧩 Core Architecture

### The ShapeRenderer Contract

Every shape — built-in or custom — implements this interface. This single contract drives overlays, selection rings, port anchors, alignment guides, lasso hit-testing, and export.

```typescript
export interface ShapeRenderer {
  draw:      (g: D3Selection, config: ResolvedShapeConfig, theme: ThemeConfig) => void;
  getPath:   (config: ResolvedShapeConfig) => string;     // exact SVG path
  getBounds: (config: ResolvedShapeConfig) => BoundingBox; // axis-aligned bbox
  getPorts:  (config: ResolvedShapeConfig) => PortMap;    // connection anchor points
}
```

**Why this matters:** If a rectangle has `borderRadius: { leftTop: 50, rightTop: 50 }` (a pill shape), the selection ring must draw the same pill — not a plain rect. `getPath()` guarantees this for *every* shape, including your custom ones.

### D3 Layer Stack (strict order)

```
1. g.grid           ← background grid
2. g.connections    ← connection lines
3. g.placed-nodes   ← placed shapes
4. g.preview        ← drag-preview (pointer-events: none)
5. g.guides         ← alignment guides (pointer-events: none)
6. g.lasso          ← lasso selection rect
   HTML overlay     ← context pad (never in SVG stack)
```

---

## 📖 Configuration Reference

```typescript
Zenode.initializeCanvas('#canvas', {
  canvas: {
    width: 1200,
    height: 800,
    backgroundColor: '#1a1a2e',
    locked: false,
    grid: {
      gridEnabled: true,
      gridType: 'dotted',     // 'dotted' | 'line' | 'cross' | 'sheet'
      gridSize: 20,
      gridColor: '#2a2a4a',
      gridTransparency: 0.5
    }
  },

  canvasProperties: {
    zoomEnabled: true,
    zoomExtent: [0.1, 4],
    panEnabled: true,
    snapToGrid: true,

    alignmentLines: {
      enabled: true,
      color: '#ffaa00',
      alignmentThreshold: 8
    },

    lassoStyle: {
      enabled: true,
      strokeColor: '#4A90E2',
      fillColor: 'rgba(74,144,226,0.08)'
    },

    keyboardShortcuts: {
      enabled: true,
      deleteSelection: ['Delete', 'Backspace'],
      clearSelection: ['Escape'],
      customBindings: { 'canvas:log': ['Ctrl+Shift+L'] },
      callbacks: {
        onDeleteSelection: ({ selectedNodeIds }) => console.log('deleted', selectedNodeIds),
        custom: { 'canvas:log': ({ engine }) => console.log(engine) }
      }
    },

    ghostConnection: {
      enabled: true,
      color: '#4A90E2',
      dashed: true
    },

    contextPad: {
      enabled: true,
      trigger: 'select',          // 'select' | 'hover'
      position: 'top-right',      // 'top-right' | 'top-left' | 'bottom-right' | etc.
      offset: { x: 10, y: -10 },
      showDefaults: true,
      suppressDefaults: [],        // e.g. ['duplicate']
      layout: 'horizontal',        // 'horizontal' | 'vertical' | 'grid'
      gridColumns: 3,
      style: {
        backgroundColor: 'rgba(28,28,30,0.85)',
        borderRadius: '12px',
        backdropBlur: '12px',
        buttonWidth: '32px',
        buttonHeight: '32px',
        iconColor: '#ebebf5'
      }
    }
  }
});
```

---

## 🔷 Working with Shapes

### Built-in Shapes

```typescript
Zenode.createShape('rectangle', 'task-1');
Zenode.createShape('circle',    'event-1');
Zenode.createShape('rhombus',   'gateway-1');
```

### Custom Shape via Plugin

```typescript
const engine = Zenode.getEngine();

engine.registerShape('hexagon', {
  draw(g, config, theme) {
    g.append('path')
      .attr('d', this.getPath(config))
      .attr('fill', config.color)
      .attr('stroke', config.stroke.color);
  },
  getPath(config) {
    const { x, y, width: w, height: h } = config;
    const cx = x + w / 2, cy = y + h / 2;
    const r = Math.min(w, h) / 2;
    return d3.line()(
      Array.from({ length: 6 }, (_, i) => [
        cx + r * Math.cos((i * Math.PI) / 3 - Math.PI / 6),
        cy + r * Math.sin((i * Math.PI) / 3 - Math.PI / 6)
      ])
    ) + 'Z';
  },
  getBounds(c) { return { x: c.x, y: c.y, width: c.width, height: c.height }; },
  getPorts(c) {
    return {
      top:    { x: c.x + c.width / 2, y: c.y },
      bottom: { x: c.x + c.width / 2, y: c.y + c.height },
      left:   { x: c.x,               y: c.y + c.height / 2 },
      right:  { x: c.x + c.width,     y: c.y + c.height / 2 },
      center: { x: c.x + c.width / 2, y: c.y + c.height / 2 }
    };
  }
});

// Now 'hexagon' works with selection, ports, alignment, export — zero extra code.
Zenode.createShape('hexagon', 'hex-1');
```

---

## 🔗 Connections

Hover any placed node to reveal its ports (top, bottom, left, right, center). Click-drag from a port to another to create a connection.

```typescript
// Programmatic connection
Zenode.createConnection('node-1', 'node-2');

// Set active type before drawing
Zenode.setActiveConnectionType('curved'); // 'straight' | 'curved' | 's-shaped' | 'l-bent'

// Connection labels
Zenode.setConnectionLabel('Approved', true);

// Connection mode toggle
Zenode.setConnectionModeEnabled(true);
```

### Connection Types

| Type | Description |
|---|---|
| `straight` | Direct line between ports |
| `curved` | Cubic bezier with direction handles |
| `s-shaped` | Smooth S-curve bezier |
| `l-bent` | Orthogonal L-shaped routing |
| `smart` | Obstacle-avoidance routing **(Pro)** |

---

## 🎛 Context Action Pad

The Context Pad is a floating HTML toolbar that appears near selected nodes or edges. It is **fully extensible via the plugin API**.

### Registering a Custom Action

```typescript
const engine = Zenode.getEngine();

engine.registerContextPadAction({
  id:      'run-node',
  icon:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5,3 19,12 5,21"/>
            </svg>`,
  tooltip: 'Run this step',
  order:   5,
  targets: ['node'],              // 'node' | 'edge' | both
  style: {
    color:      '#4ade80',
    hoverColor: 'rgba(74,222,128,0.15)'
  },
  handler(target, engine) {
    engine.updateNodeVisualState(target.id, { status: 'running' });
    // ... trigger your execution logic
  },
  isDisabled(target, engine) {
    return target.data?.meta?.locked === true;
  }
});
```

### Suppressing Default Actions

Remove a built-in action globally:

```typescript
engine.unregisterContextPadAction('duplicate');
```

Or suppress per-config:

```typescript
Zenode.initializeCanvas('#canvas', {
  canvasProperties: {
    contextPad: { suppressDefaults: ['duplicate', 'properties'] }
  }
});
```

### Default Actions

| ID | Icon | Target | Description |
|---|---|---|---|
| `delete` | 🗑 | both | Delete selected node/edge |
| `connect` | → | node | Enter ghost-line draw mode |
| `edit-label` | ✏️ | both | Inline label editing |
| `properties` | ⚙️ | both | Emits `contextpad:properties` event |
| `duplicate` | ⧉ | node | Duplicate node with offset |

### Context Pad Events

```typescript
engine.on('contextpad:open',       ({ target }) => console.log('opened for', target));
engine.on('contextpad:close',      ()           => console.log('closed'));
engine.on('contextpad:action:click', ({ actionId, target }) => {});
engine.on('contextpad:properties', ({ target }) => {
  // open your own side panel / modal
  myPropertiesPanel.open(target);
});
```

---

## 🌊 Visual Effects & Node Status

Apply live visual states to nodes and edges — perfect for workflow execution feedback.

```typescript
// Node status
Zenode.updateNodeVisualState('node-1', {
  status: 'running'   // 'idle' | 'running' | 'success' | 'error' | 'warning'
});

// Custom effects
Zenode.updateNodeVisualState('node-1', {
  effects: {
    glow:            { color: '#4A90E2', intensity: 0.8 },
    strokeAnimation: { type: 'flow', speed: 1.5 },
  }
});

// Edge gradient progress
Zenode.updateEdgeVisualState('edge-1', {
  effects: {
    gradientFlow: { progress: 0.65, fromColor: '#4A90E2', toColor: '#34ebb4' }
  }
});
```

---

## 🔌 Plugin System

```typescript
const MyPlugin = {
  name: 'my-automation-plugin',
  install(engine) {
    // Add custom shapes
    engine.registerShape('custom-task', myRenderer);

    // Add context pad actions
    engine.registerContextPadAction({
      id: 'run-node',
      icon: '▶',
      tooltip: 'Execute',
      targets: ['node'],
      handler: (target, engine) => myExecutor.run(target.id)
    });

    // Subscribe to events
    engine.on('node:placed', ({ nodeId }) => console.log('placed', nodeId));
  }
};

engine.use(MyPlugin);
```

---

## 🎮 Canvas Controls API

```typescript
// Zoom & pan
Zenode.zoomIn();
Zenode.zoomOut();
Zenode.focusOnSelectedNode();

// Lasso
Zenode.setLassoEnabled(true);

// License
Zenode.setLicense('ZEN-PRO-XXXX-XXXX');
Zenode.getLicenseTier(); // 'free' | 'pro'

// Smart routing (Pro)
Zenode.setSmartRoutingEnabled(true);

// Get nodes
Zenode.getPlacedNodes(); // returns all placed node data
```

---

## 🎨 CSS Theming

Override any aspect of the designer via CSS variables:

```css
:root {
  /* Canvas */
  --zenode-canvas-bg:          #1a1a2e;
  --zenode-grid-color:         #2a2a4a;

  /* Selection */
  --zenode-selection-color:    #4A90E2;
  --zenode-guide-color:        #ffaa00;
  --zenode-port-color:         #4A90E2;

  /* Node Status */
  --zenode-status-running:     #60a5fa;
  --zenode-status-success:     #4ade80;
  --zenode-status-error:       #f87171;
  --zenode-status-warning:     #fbbf24;

  /* Context Pad */
  --zenode-contextpad-bg:      rgba(28, 28, 30, 0.85);
  --zenode-contextpad-border:  rgba(255, 255, 255, 0.1);
  --zenode-contextpad-shadow:  0 8px 32px rgba(0,0,0,0.4);
  --zenode-contextpad-radius:  12px;
  --zenode-context-btn-hover:  rgba(255,255,255,0.1);
  --zenode-context-btn-active: rgba(74,144,226,0.2);
  --zenode-context-btn-width:  32px;
  --zenode-context-btn-height: 32px;
  --zenode-context-btn-color:  #ebebf5;
}
```

---

## 🗺 Roadmap

### Layer 1 — `@zenode/designer`

| Phase | Status | Description |
|---|---|---|
| P1 · Core Shape Lifecycle | ✅ | Placement, drag, snapping, selection, lasso, effects |
| P2 · Connections | ✅ | Ports, drawing, 4 types, smart routing (Pro), labels |
| P3 · Context Action Pad | ✅ | HTML overlay, plugin API, default actions, events |
| P2+ · Connection Markers | ⬜ | Arrowheads, dasharray, animated flow |
| P4 · Swimlanes / Pools | ⬜ | Lane containers, child clamping, cross-lane ports |
| P5 · BPMN Parity | ⬜ | Copy/paste, resize handles, node search, groups |
| P6 · Full Public API | ⬜ | Status, validation, undo/redo, schema panels |

### Future Packages

| Package | Status | Description |
|---|---|---|
| `@zenode/serializer` | ⬜ | JSON, BPMN 2.0, Mermaid, DOT, DSL export |
| `@zenode/runtime` | ⬜ | Diagram-as-workflow execution engine |
| `@zenode/transformer` | ⬜ | User-defined output shaping |
| `@zenode/core` | ⬜ | All four layers pre-wired |

---

## ⚖️ Pricing

| Tier | Price | Features |
|---|---|---|
| **Open Source** | Free | Core canvas, shapes, connections, context pad, visual effects |
| **Pro** | $149/yr | Smart routing, minimap, themes, PNG export, undo 200 steps |
| **Team** | $499/yr | BPMN 2.0 export, real-time collaboration, priority support |
| **Embed License** | $200/mo | OEM/white-label, no attribution, iframe-safe UMD |

---

## 🆚 Why Zenode?

| | React Flow | BPMN.js | JointJS+ | **Zenode** |
|---|---|---|---|---|
| Framework agnostic | ❌ | ✅ | ✅ | ✅ |
| Open source core | ✅ | ✅ | ❌ | ✅ |
| Custom shapes API | ⚠️ | ❌ | ✅ | ✅ |
| Plugin context pad | ❌ | ❌ | ❌ | ✅ |
| Visual effects | ❌ | ❌ | ❌ | ✅ |
| JS workflow execution | ❌ | ❌ | ❌ | ✅ (Layer 3) |
| Embeddable UMD | ⚠️ | ❌ | ⚠️ | ✅ |
| Price | Free | Free | $1200+/yr | Free/$149/yr |

---

## 🧪 Architecture Rules (for Contributors)

Before writing any code, ask:

1. **State mutation?** → Command pattern + `engine.emit(event)`.
2. **Rendering something?** → D3 data join on the correct layer group.
3. **Overlay / selection ring?** → `registry.get(node.type).getPath(node)` — never a plain `<rect>`.
4. **New shape?** → Must implement full `ShapeRenderer`: `draw`, `getPath`, `getBounds`, `getPorts`.
5. **Button near a node?** → `engine.registerContextPadAction()` — never hardcode.
6. **Context pad position?** → Always from current D3 zoom transform — never cached screen coords.
7. **Premium feature?** → Gate via `LicenseManager.check('feature-name')`.
8. **CSS value?** → `--zenode-*` variable — never hardcoded.

---

## 📁 Package Structure

```
src/
├── core/
│   ├── engine.ts          ← ZenodeEngine — full public API
│   ├── canvas.ts
│   ├── grid.ts
│   └── license.ts
├── nodes/
│   ├── registry.ts        ← ShapeRegistry
│   ├── placement.ts
│   ├── selection.ts       ← Uses renderer.getBounds
│   ├── overlay.ts         ← Uses renderer.getPath (never plain rect)
│   ├── ports.ts
│   └── shapes/
│       ├── rectangle.ts   ← Implements ShapeRenderer
│       ├── circle.ts
│       └── rhombus.ts
├── contextpad/
│   ├── registry.ts        ← ContextPadRegistry
│   ├── renderer.ts        ← HTML overlay, position from D3 zoom transform
│   ├── defaults.ts        ← delete, connect, edit-label, properties, duplicate
│   └── index.ts
├── connections/
│   ├── manager.ts
│   ├── drawing.ts
│   └── paths/
│       ├── straight.ts
│       ├── curved.ts
│       ├── s-shaped.ts
│       └── l-bent.ts
├── effects/
│   └── engine.ts          ← applyEffects(g, path, visualState)
├── types/
│   └── index.ts           ← ALL interfaces (ShapeRenderer, ContextPadAction, VisualState...)
└── zenode.css             ← CSS variable definitions
```

---

## 📜 License

MIT © Zenode — free forever for open source. [Commercial licenses](https://zenode.dev/pricing) available.

---

<div align="center">

**Built with ❤️ on D3.js · TypeScript · SVG**

[Docs](https://zenode.dev) · [Live Demo](https://demo.zenode.dev) · [NPM](https://npmjs.com/package/@zenode/designer) · [Discord](https://discord.gg/zenode)

</div>