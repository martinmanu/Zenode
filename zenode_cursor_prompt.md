# 🧠 Zenode — AI Coding Prompt (Cursor / Claude Code / Copilot)

Paste this entire prompt at the start of your Cursor session or as a persistent `.cursorrules` file in your project root.

---

## 🗂 Project Context

You are working on **Zenode** — a high-performance, D3.js-powered workflow UI visualizer built for total developer control. It is a **framework-agnostic, JSON-config-driven diagramming engine** built in TypeScript.

The goal is to build this into a **dual-license open-core product** and eventually an **embeddable SaaS widget** that other SaaS teams can drop into their own products. Think React Flow Pro or JointJS+ — but built on D3.js, which gives fine-grained SVG control and framework independence (React, Vue, Angular, Svelte, vanilla JS all work).

### Competitive Positioning
- **React Flow**: React-only, massive adoption but locked to React ecosystem.
- **JointJS+**: Framework-agnostic but heavy, complex API, expensive commercial tier.
- **GoJS**: Commercial-only, Canvas-based, restrictive licensing.
- **Zenode's edge**: D3-native, framework-agnostic, zero-abstraction SVG control, JSON-first config, BPMN-compatible XML export, live node status system, workflow validation engine, plug-and-play API. Developers get more control with less magic.

---

## 📦 Distribution Model

Zenode is distributed as a **tiered NPM + CDN package**:

```
@zenode/core          ← Free, open source (MIT)
@zenode/pro           ← Paid, closed source
@zenode/react         ← React convenience wrapper
@zenode/vue           ← Vue convenience wrapper
zenode.min.js         ← CDN/UMD drop-in (jsDelivr / unpkg)
```

### Monetisation Tiers

| Tier | Price | Features |
|---|---|---|
| **Open Source** | Free | Core engine, basic shapes, JSON/XML export, node status, validation |
| **Pro** | $149/year | Auto-layout, PNG export, minimap, unlimited undo, custom themes |
| **Team** | $499/year | Real-time collaboration, BPMN export, priority support |
| **Embed License** | $200/mo | OEM rights, white-label, no attribution required |

All premium features must be gated via `LicenseManager`. The embed license is the primary B2B revenue target.

---

## ✅ What Is Already Built

Do not rebuild these — treat them as stable foundations:

- D3.js SVG canvas with zoom & pan (configurable extents, scroll, double-click reset)
- Grid system: dotted, sheet, line, cross types with configurable size, color, transparency
- Modular `ZenodeEngine` class: canvas init, element management, state
- Primitive shapes: `Rectangle` (per-corner border radius), `Circle`, `Rhombus`
- Shape preview with real-time grid snapping before placement
- **Shape Placement**: `mouseClick` logic transitions preview → placed state, stored in `placedNodes` state, rendered in `g.placed-nodes` layer.
- Configuration merger: merges user configs with typed defaults
- Basic event scaffolding: `mouseMove`, `mouseClick`
- Asset management structure: markers, SVG assets
- Rich TypeScript config interfaces: Canvas, Shapes, Connections, GlobalProperties

---

## 🧩 Shape Renderer Contract — The Core Plugin Architecture

> ⚠️ **This must be set up before Phase 1.3.** Every system that touches a shape — overlay, selection ring, connection ports, alignment guides, lasso hit-testing, export — depends on this contract. Getting it wrong now means rewriting core later.

### The Problem It Solves

Shapes in Zenode can have arbitrary geometry (pill shapes, hexagons, stars, custom SVGs). The overlay, selection ring, and port anchors must **always match the actual rendered shape**, not a generic bounding box. The only way to guarantee this is to make every shape renderer responsible for describing its own geometry.

**The bug this prevents:** If a rectangle has `borderRadius: { leftTop: 50, leftBottom: 50, rightTop: 5, rightBottom: 5 }` (a pill/stadium shape), the selection overlay must draw the same pill path — not a plain rectangle. A plain `<rect>` overlay on a pill shape is wrong and will always be wrong unless the renderer owns the path.

### The ShapeRenderer Interface

Every shape — built-in or custom — MUST implement this interface. Define it in `src/types/index.ts` and enforce it everywhere:

```typescript
// src/types/index.ts
export interface ShapeRenderer {
  /**
   * Draws the shape into the provided D3 group element.
   * Called once on placement, again on config/theme change.
   */
  draw: (
    g: D3Selection,
    config: ResolvedShapeConfig,
    theme: ThemeConfig
  ) => void;

  /**
   * Returns the SVG path string for this shape's exact geometry.
   * Used by: overlay, selection ring, hit-testing, lasso, ports, export.
   * NEVER draw a plain rect/circle as overlay — always call getPath().
   */
  getPath: (config: ResolvedShapeConfig) => string;

  /**
   * Returns the axis-aligned bounding box.
   * Used by: alignment guides, lasso selection, auto-layout, viewport fit.
   */
  getBounds: (config: ResolvedShapeConfig) => BoundingBox;

  /**
   * Returns connection port anchor positions for this shape.
   * Used by: connection drawing, port hover circles, path recalculation.
   * Must recompute correctly after the node is moved or resized.
   */
  getPorts: (config: ResolvedShapeConfig) => PortMap;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PortMap {
  top:    { x: number; y: number };
  bottom: { x: number; y: number };
  left:   { x: number; y: number };
  right:  { x: number; y: number };
  center: { x: number; y: number };
  [key: string]: { x: number; y: number }; // custom ports
}
```

### The Shape Registry

All shape renderers — built-in and custom — are registered here. The engine always looks up renderers from this registry; it never calls shape-specific code directly.

```typescript
// src/nodes/registry.ts
export class ShapeRegistry {
  private renderers = new Map<string, ShapeRenderer>();

  register(name: string, renderer: ShapeRenderer): void {
    this.renderers.set(name, renderer);
  }

  get(name: string): ShapeRenderer {
    const r = this.renderers.get(name);
    if (!r) throw new Error(`Shape "${name}" is not registered in ShapeRegistry`);
    return r;
  }

  has(name: string): boolean {
    return this.renderers.has(name);
  }

  list(): string[] {
    return [...this.renderers.keys()];
  }
}

// Engine boot — register all built-ins first:
registry.register('rectangle', RectangleRenderer);
registry.register('circle',    CircleRenderer);
registry.register('rhombus',   RhombusRenderer);
```

### How the Overlay MUST Be Drawn

**Never** draw the overlay as a plain `<rect>`. Always call `getPath()` from the renderer:

```typescript
// ❌ WRONG — ignores actual shape geometry
g.append('rect')
  .attr('width', node.width)
  .attr('height', node.height)
  .attr('stroke', overlayColor);

// ✅ CORRECT — matches exact shape, works for any renderer
const renderer = registry.get(node.type);
const overlayPath = renderer.getPath(node);

g.append('path')
  .attr('d', overlayPath)
  .attr('fill', 'none')
  .attr('stroke', overlayColor)
  .attr('stroke-width', overlay.strokeWidth)
  .attr('stroke-dasharray', overlay.type === 'dashed' ? '4,3' : 'none')
  .attr('pointer-events', 'none');  // ← critical, must never intercept mouse events
```

### Built-in Rectangle Renderer — Reference Implementation

This shows how `borderRadius` config maps to correct SVG path math. All four corners are independent:

```typescript
// src/nodes/shapes/rectangle.ts
export const RectangleRenderer: ShapeRenderer = {
  draw(g, config, theme) {
    g.append('path')
      .attr('d', this.getPath(config))
      .attr('fill', config.color)
      .attr('fill-opacity', config.transparency ?? 1)
      .attr('stroke', config.stroke.color)
      .attr('stroke-width', config.stroke.width)
      .attr('stroke-dasharray', config.stroke.strokeDasharray.join(','));
  },

  getPath(config) {
    const { x, y, width, height, borderRadius } = config;
    const tl = borderRadius?.leftTop    ?? 0;
    const bl = borderRadius?.leftBottom ?? 0;
    const tr = borderRadius?.rightTop   ?? 0;
    const br = borderRadius?.rightBottom?? 0;
    // SVG path with per-corner radius:
    return [
      `M ${x + tl} ${y}`,
      `H ${x + width - tr}`,
      `Q ${x + width} ${y} ${x + width} ${y + tr}`,
      `V ${y + height - br}`,
      `Q ${x + width} ${y + height} ${x + width - br} ${y + height}`,
      `H ${x + bl}`,
      `Q ${x} ${y + height} ${x} ${y + height - bl}`,
      `V ${y + tl}`,
      `Q ${x} ${y} ${x + tl} ${y}`,
      'Z'
    ].join(' ');
  },

  getBounds(config) {
    return { x: config.x, y: config.y, width: config.width, height: config.height };
  },

  getPorts(config) {
    const { x, y, width, height } = config;
    return {
      top:    { x: x + width / 2, y },
      bottom: { x: x + width / 2, y: y + height },
      left:   { x,                y: y + height / 2 },
      right:  { x: x + width,     y: y + height / 2 },
      center: { x: x + width / 2, y: y + height / 2 },
    };
  }
};
```

### Developer-Facing Custom Shape API

This is what a developer using Zenode writes to add any custom shape. They only know D3 — they never touch engine internals:

```typescript
// Developer registers a hexagon shape:
engine.registerShape('hexagon', {
  draw(g, config, theme) {
    g.append('path')
      .attr('d', this.getPath(config))
      .attr('fill', config.color)
      .attr('stroke', config.stroke.color)
      .attr('stroke-width', config.stroke.width);
  },

  getPath(config) {
    const { x, y, width, height } = config;
    const cx = x + width / 2, cy = y + height / 2;
    return [0,1,2,3,4,5].map(i => {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const px = cx + (width  / 2) * Math.cos(angle);
      const py = cy + (height / 2) * Math.sin(angle);
      return `${i === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`;
    }).join(' ') + ' Z';
  },

  getBounds(config) {
    return { x: config.x, y: config.y, width: config.width, height: config.height };
  },

  getPorts(config) {
    const { x, y, width, height } = config;
    return {
      top:    { x: x + width / 2, y },
      bottom: { x: x + width / 2, y: y + height },
      left:   { x,                y: y + height / 2 },
      right:  { x: x + width,     y: y + height / 2 },
      center: { x: x + width / 2, y: y + height / 2 },
    };
  }
});

// Registered shapes appear automatically in the shape palette.
// Overlay, selection, ports, lasso, export all work with zero extra code.
```

### SVG String Shortcut (for simple shapes)

For developers who don't want to write D3, accept a raw SVG template string. Zenode auto-generates `getPath`/`getBounds` from the viewBox:

```typescript
engine.registerShape('star', {
  svg: `<path d="M 50,0 L 61,35 L 98,35 L 68,57 L 79,91
                  L 50,70 L 21,91 L 32,57 L 2,35 L 39,35 Z"
             fill="{{color}}" stroke="{{stroke.color}}" />`,
  viewBox: '0 0 100 100'
  // Engine handles scaling, {{token}} replacement, getPath derivation
});
```

### Plugin System

A plugin is any object with a `name` and an `install` function. It receives the full engine instance and can hook into events, register shapes, and extend the API:

```typescript
// src/types/index.ts
export interface ZenodePlugin {
  name: string;
  install(engine: ZenodeEngine): void;
}

// Example: a plugin that registers a shape library
const MyShapesPlugin: ZenodePlugin = {
  name: 'my-shapes',
  install(engine) {
    engine.registerShape('hexagon', HexagonRenderer);
    engine.registerShape('cloud',   CloudRenderer);
    engine.registerShape('star',    StarRenderer);
    engine.on('node:placed', ({ nodeData }) => {
      console.log('Node placed by my-shapes plugin:', nodeData);
    });
  }
};

engine.use(MyShapesPlugin);

// Built-in plugins shipped with Zenode:
// AutoLayoutPlugin  — Dagre / force-directed layout
// ExportPlugin      — PNG / SVG / JSON / BPMN
// MinimapPlugin     — Overview minimap (Pro)
// CollaborationPlugin — Real-time multiplayer (Pro/Team)
```

### Where This Fits in the Build Order

```
RIGHT NOW (during Phase 1.2 bug fix)
└── Define ShapeRenderer interface in src/types/index.ts
└── Create ShapeRegistry in src/nodes/registry.ts
└── Rewrite RectangleRenderer, CircleRenderer, RhombusRenderer to implement it
└── Fix overlay code to call renderer.getPath() — never draw its own rect

PHASE 1.3 (Selection)
└── Lasso hit-testing uses renderer.getBounds()
└── Selection ring uses renderer.getPath()
└── Zero per-shape special cases needed

PHASE 2.1 (Ports)
└── Port anchors come from renderer.getPorts()
└── Works automatically for every registered shape including custom ones

PHASE 3.1 (Custom Shape Registry — now just making registry public)
└── engine.registerShape() is already the internal call, just export it
└── engine.use(plugin) for plugin installation
└── Document ShapeRenderer interface as the public extension API
└── Ship hexagon + star as example plugins in /examples
```

> **Key principle:** Plugin support is not a feature added in Phase 3. It is the natural result of building the internal registry correctly in Phase 1. Making `engine.registerShape()` and `engine.use()` public IS the plugin system.

---

## 🚧 Full Roadmap — Work Through Phases In Order

---

### PHASE 1 — Core Shape Lifecycle

**1.1 — Shape Placement [DONE]**
- Complete `mouseClick` logic to transition a shape from "preview" → "placed" state.
- Placed shapes stored in `placedNodes[]` in `ZenodeEngine` state.
- Each placed node has: `id` (nanoid), `type`, `x`, `y`, `width`, `height`, `meta: {}`.
- Render placed shapes in `g.placed-nodes` layer above grid, below preview.

**1.2 — Drag & Drop [DONE (current scope)]**
- Implement D3 drag behavior on placed nodes.
- During drag, snap node position to active grid size.
- Show alignment hints when a dragged node aligns horizontally or vertically with another node.
- On drag end, update node position in engine state.

> ⚠️ **Known Bug Checklist for 1.2:**
> - Alignment guide lines persisting after drag end → clear `g.guides` on `dragend`
> - Wrong anchor points on connections → use `d3.pointer(event, svgRoot)` not `event.x/y`
> - No visual selection state on nodes → add CSS variable `--zenode-selection-color` ring
> - Drag firing on wrong element → check `d3.event.defaultPrevented` in click handlers
> - State mutation bugs → always spread: `{...node, x, y}`, never mutate in place
> - Guide/preview layers intercepting mouse events → add `pointer-events: none` on `g.guides` and `g.preview`

**1.3 — Selection & Multi-Selection**
- Single click on placed node: select it (highlight with `--zenode-selection-color` ring).
- Click on empty canvas: deselect all.
- Lasso (click-drag on empty canvas): select all nodes whose bounding boxes intersect.
- `Escape` clears selection. `Delete` / `Backspace` deletes selected nodes.
- Keyboard shortcuts must be configurable via `canvasProperties.keyboardShortcuts`.
- Support callback hooks for custom key handling (delete, clear selection, custom action map).

**1.3 Extension — Visual Effects System (Minimal, Renderer-Agnostic)**

Add a visual effects layer that works for **all** shapes and connections without changing geometry contracts.

#### 🧠 Core Rules
- Effects are purely visual — they must **NOT** affect:
  - `getPath()`
  - `getBounds()`
  - `getPorts()`
- Effects are applied **after** `renderer.draw(...)`.
- Must work for all shapes via `ShapeRenderer`.

#### 🧩 Add `VisualState` in `src/types/index.ts`

```typescript
export interface VisualState {
  status?: 'idle' | 'running' | 'success' | 'error' | 'warning';
  effects?: {
    glow?: { color?: string; intensity?: number };
    strokeAnimation?: { type: 'flow'; speed?: number };
    gradientFlow?: { progress: number; fromColor: string; toColor: string };
  };
}
```

Attach visual state to both entities:
- `node.visualState`
- `edge.visualState`

#### ⚙️ Effects Engine

Create:
- `src/effects/engine.ts`

Public API:

```typescript
applyEffects(g: D3Selection, path: string, visualState?: VisualState): void
```

#### 🔌 Mandatory Integration Pattern

After every draw:

```typescript
renderer.draw(g, node, theme);
effectsEngine.applyEffects(g, renderer.getPath(node), node.visualState);
```

Same integration rule applies to connections/edges.

#### ✨ Implement ONLY these effects now
- ✅ **Glow**
  - SVG `<filter>` + blur
  - Reuse via `<defs>`
- ✅ **Stroke Flow**
  - `stroke-dasharray` + animated `stroke-dashoffset`
- ✅ **Gradient Progress** *(edges only)*
  - `<linearGradient>`
  - Use `progress` from `0 → 1`

#### 🔁 Visual State Update APIs

```typescript
engine.updateNodeVisualState(id, patch)
engine.updateEdgeVisualState(id, patch)
```

- Updates must be immutable.
- Trigger re-render after update.

#### 🚫 Do NOT build yet
- Wave distortion
- Complex animation orchestration
- Shader systems

> 🔥 **Key Principle:** `ShapeRenderer = geometry`, `EffectsEngine = visuals`. Never mix them.

**1.4 — Alignment Guides [DONE]**
- Detect edge/center alignment with other nodes during drag.
- Render temporary SVG line in `--zenode-guide-color` at aligned axis.
- Hide guides immediately on drag end.
- Alignment guides are now renderer-bounds-aware (`getBounds`) for accurate shape alignment.
- Edge guides and center guides are independently configurable via `canvasProperties.alignmentLines`.
- Guide styling supports enable/disable, color, stroke width, dashed, and dash array for both guide types.
- Alignment threshold is configurable (`alignmentThreshold`) and guide rendering is throttled via `requestAnimationFrame`.

---

### PHASE 2 — Connections System

**2.1 — Connector Anchors (Ports)**
- Each placed node exposes ports: `top`, `bottom`, `left`, `right`, `center`.
- Ports rendered as small circles on hover (`r=5`, fill `--zenode-port-color`).
- Hover changes cursor to `crosshair`.
- Port positions recompute when node is moved.

**2.2 — Drawing Connections**
- Click + drag from a port initiates a connection.
- Show a live ghost connector line following the mouse.
- Dropping on another port finalises the connection → stored in `ZenodeEngine.connections[]`.
- Each connection has: `id`, `sourceNodeId`, `sourcePort`, `targetNodeId`, `targetPort`, `type`, `label?`.

**2.3 — Connector Types**
- `straight`: direct line between ports
- `curved`: cubic bezier, handles auto-computed from port direction
- `s-shaped`: S-curve bezier for same-side connections
- `l-bent`: orthogonal L-shaped connector (two right-angle segments)

**2.4 — Smart Routing** *(Pro feature — gate via LicenseManager)*
- Orthogonal connectors: A* or grid-based routing around placed nodes.
- Bezier connectors: handles long enough to always produce non-degenerate curves.

**2.5 — Connection Labels**
- Optional text label at midpoint.
- Editable via double-click (inline `<foreignObject>` input or SVG `<text>` edit).

---

### PHASE 3 — Public API Surface (Plug-and-Play)

This is the core developer-facing API. Every method must be documented with JSDoc. This is what makes Zenode a plug-and-play library.

**3.1 — Node API**
```typescript
engine.addNode(config: NodeConfig): string          // returns nodeId
engine.removeNode(id: string): void
engine.updateNode(id: string, patch: Partial<NodeConfig>): void
engine.getNode(id: string): NodeData | null
engine.getAllNodes(): NodeData[]
engine.focusNode(id: string): void                  // pan/zoom to node
engine.highlight(id: string, durationMs?: number): void  // visual pulse
engine.lock(): void                                 // disable all interaction
engine.unlock(): void
engine.setReadOnly(bool: boolean): void
```

**3.2 — Edge/Connection API**
```typescript
engine.addEdge(config: EdgeConfig): string          // returns edgeId
engine.removeEdge(id: string): void
engine.getEdge(id: string): EdgeData | null
engine.getAllEdges(): EdgeData[]
engine.getPath(fromNodeId: string, toNodeId: string): string[]  // node ID array
```

**3.3 — Live Node Status API** *(Free — major DX differentiator)*
```typescript
engine.setNodeStatus(id: string, status: NodeStatus): void
// NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'warning'
// Each status maps to a visual style:
//   running  → animated pulse ring
//   success  → green checkmark badge
//   error    → red border + shake animation
//   warning  → amber badge
//   idle     → default appearance
```
This is essential for developers building CI/CD visualisers, n8n-style tools, or approval workflow UIs. No other JS diagramming library ships this natively.

**3.4 — Workflow Validation Engine** *(Free — unique feature)*
```typescript
engine.addRule(rule: BuiltInRule | CustomRule): void
// Built-in rules:
//   'no-cycles'             → DAG enforcement
//   'all-nodes-connected'   → no orphan nodes
//   'single-entry-point'    → exactly one START node
//   'single-exit-point'     → exactly one END node
//   'max-depth'             → configurable depth limit

engine.validate(): ValidationResult
// Returns: { valid: boolean, errors: ValidationError[], warnings: ValidationWarning[] }

engine.on('validation:error', handler)
engine.on('validation:pass', handler)
```

**3.5 — Export / Import API**
```typescript
engine.toJSON(): ZenodeState                     // full serialisable state
engine.fromJSON(state: ZenodeState): void        // restore from JSON
engine.toXML(): string                           // generic XML workflow format
engine.toBPMN(): string                          // BPMN 2.0 compatible XML ← Pro
engine.fromBPMN(xml: string): void              // import BPMN ← Pro
engine.toMermaid(): string                       // Mermaid diagram syntax ← Free
engine.toDOT(): string                           // Graphviz DOT format ← Free
engine.toImage(format: 'png' | 'svg'): Promise<Blob>  // ← Pro
```

> ⚠️ **BPMN export is a Pro/Team tier differentiator.** No other JS diagramming library ships proper BPMN 2.0 export. This opens doors to enterprise BPM integrations (Camunda, Activiti, Flowable, SAP).

**3.6 — Canvas / Viewport API**
```typescript
engine.clear(): void
engine.reset(): void                             // clear + reset zoom/pan
engine.zoomTo(level: number): void
engine.panTo(x: number, y: number): void
engine.fitToScreen(): void
engine.getViewport(): ViewportState
engine.setTheme(theme: ThemeConfig): void        // ← Pro
engine.enableMinimap(): void                     // ← Pro
engine.disableMinimap(): void
```

**3.7 — Event API**
```typescript
engine.on('node:placed', handler)
engine.on('node:moved', handler)
engine.on('node:deleted', handler)
engine.on('node:selected', handler)
engine.on('node:click', handler)
engine.on('node:doubleclick', handler)
engine.on('edge:created', handler)
engine.on('edge:deleted', handler)
engine.on('workflow:change', handler)           // fires on any mutation
engine.on('validation:error', handler)
engine.on('export:complete', handler)
engine.off(event, handler)
engine.once(event, handler)
// All handlers receive: { nodeId?, edgeId?, data, event, engine }
```

---

### PHASE 4 — Unique Differentiator Features

**4.1 — Schema-Driven Node Property Panels**
- Each node type can declare a `schema` in its config:
```typescript
{
  type: 'http-request',
  label: 'HTTP Request',
  schema: {
    url:    { type: 'string',  required: true,  label: 'URL' },
    method: { type: 'select',  options: ['GET', 'POST', 'PUT', 'DELETE'] },
    headers:{ type: 'keyvalue', label: 'Headers' },
    body:   { type: 'textarea', label: 'Request Body' }
  }
}
```
- Zenode auto-renders a property panel UI in the right sidebar when that node is selected.
- No UI code needed from the developer — the schema drives it.
- Values stored in `node.meta` and emitted via `node:config:change` event.

**4.2 — Workflow Simulation / Step Runner** *(Pro — "wow" feature)*
```typescript
engine.simulate(inputData?: Record<string, unknown>): SimulationController

// SimulationController:
controller.step()          // advance one node
controller.play(delayMs)   // auto-advance with delay
controller.pause()
controller.reset()
controller.on('step', ({ nodeId, inputData, outputData }) => {})
```
- Visually walks through the workflow node by node.
- Active node pulses with `running` status.
- Completed nodes show `success` status.
- Developer provides a resolver function per node type to compute output from input.
- Game-changing for demos and debugging live workflows.

**4.3 — Declarative Workflow DSL** *(experimental / stretch goal)*
```typescript
zenode.define(`
  START → [validate-input] → {
    valid:   [process-payment] → [send-receipt] → END
    invalid: [notify-user] → END
  }
`)
```
- Parses the DSL and renders the diagram automatically.
- Bidirectional: `engine.toDSL()` converts a drawn diagram back to DSL.
- Extremely shareable and tweetable — great for marketing.

---

### PHASE 5 — Customisation & Extensibility

**5.1 — Custom Shape Registry**
```typescript
engine.registerShape(name: string, renderer: ShapeRenderer): void
// ShapeRenderer: (g: D3Selection, config: ShapeConfig) => void
// OR SVG string template: engine.registerShape('cloud', '<svg>...</svg>')
```

**5.2 — Node Event Callbacks**
- JSON config supports per-node handlers: `onClick`, `onDoubleClick`, `onHover`, `onDragEnd`, `onDelete`, `onConnect`.
- Callbacks receive: `{ nodeId, nodeData, event, engine }`.
- Global fallback handlers in `EngineConfig.globalHandlers`.

**5.3 — Plugin System**
```typescript
// Plugin interface:
{ name: string, install(engine: ZenodeEngine): void }

// Built-in plugins (ship as reference implementations):
AutoLayoutPlugin    // Dagre or force-directed layout
ExportPlugin        // PNG / SVG / JSON export
CollaborationPlugin // Real-time multiplayer (Pro/Team)
MinimapPlugin       // Overview minimap (Pro)
```

---

### PHASE 6 — Persistence & State

**6.1 — JSON State Export**
- `engine.toJSON()` — versioned (`version: "1.0"`) serialisable state.
- `engine.fromJSON(state)` — perfect canvas restore.

**6.2 — Image Export** *(Pro)*
- `engine.toImage('png')` — rasterise SVG to PNG blob via `canvg`.
- `engine.toImage('svg')` — serialise SVG DOM with inlined styles.

**6.3 — Undo / Redo**
- Command pattern history stack.
- Every mutation (place, move, delete, connect) = undoable command.
- `Ctrl+Z` undo, `Ctrl+Shift+Z` / `Ctrl+Y` redo.
- Free tier: 10 steps. Pro: configurable up to 200 (gate via `LicenseManager`).

---

### PHASE 7 — Demo App & Embeddable Widget

**7.1 — Demo Application**
Vite + vanilla TS or React, showcasing full Zenode capability:
- **Left sidebar**: shape palette — all registered shapes, drag-to-canvas or click-to-place
- **Top toolbar**: connector type selector, export buttons, undo/redo, zoom controls, grid toggle, validate button, simulate button
- **Canvas**: full Zenode engine instance
- **Right panel**: property inspector — selected node's schema-driven form, label, size, style
- **Bottom bar**: validation status, node/edge count, zoom level
- Dark developer-tool aesthetic (Figma / Linear / VS Code dark theme)

**7.2 — Embeddable Widget Build**
- Secondary Vite build target → single `zenode.min.js` UMD bundle.
- Exposes `window.Zenode` globally.
- Init: `const engine = new Zenode.Engine('#container', config)`
- Bundle target: under 120kb gzipped.
- CDN-friendly `index.html` example.
- Must work inside sandboxed iframe (`allow-scripts`).

---

## 🏗 Architecture & Engineering Rules

### TypeScript
- Strict mode (`"strict": true`).
- No `any` — use `unknown` with type guards.
- All public methods have JSDoc comments.
- Export all public interfaces from `src/types/index.ts`.

### D3.js Patterns
- Always use D3 data joins (`.data().join()`) — never manually append/remove.
- Layer order (strict):
  1. `g.grid`
  2. `g.connections`
  3. `g.placed-nodes`
  4. `g.preview`
  5. `g.guides`
  6. `g.lasso`
- `pointer-events: none` on `g.guides` and `g.preview` at all times.
- Always use `d3.pointer(event, svgRoot)` for coordinates — never `event.x/y` directly.
- Use D3 `zoom` for viewport transforms only.

### State Management
- `ZenodeEngine` owns all mutable state.
- State updates are immutable at record level (spread, never mutate).
- Emit typed events via `EventEmitter` on every mutation.

### CSS / Theming
- All colours/spacing in `--zenode-*` CSS variables.
- Default light + dark theme as exported CSS files.
- Never hardcode colours in TS/D3 code.

### Key CSS Variables
```css
--zenode-selection-color
--zenode-guide-color
--zenode-port-color
--zenode-status-running
--zenode-status-success
--zenode-status-error
--zenode-status-warning
--zenode-node-bg
--zenode-node-border
--zenode-edge-color
--zenode-canvas-bg
--zenode-grid-color
```

### Testing
- Unit tests (Vitest): config merger, state export/import, connector path math, command history, validation rules.
- Integration tests: node placement, drag & drop, connection creation, status updates.
- Target: >70% coverage on core engine logic.

### Performance
- >500 nodes: switch to OffscreenCanvas for non-interactive background elements.
- Debounce alignment guides during drag (max 60fps via `requestAnimationFrame`).
- Connection path recalc only for affected connections on node move.

---

## 💰 Monetisation-Ready Architecture

- **LicenseManager**: gates Pro features (smart routing, auto-layout, PNG export, BPMN export, undo >10 steps, simulation, collaboration, minimap, custom themes).
- **Telemetry hook**: optional `telemetry` config field — emits anonymous usage events (nodes placed, connections drawn, exports triggered, validations run) to configurable endpoint.
- **Multi-instance safe**: multiple independent engine instances on same page.
- **iframe-embeddable**: works in sandboxed iframe with `allow-scripts`.

---

## 📁 File Structure

```
zenode/
├── src/
│   ├── core/
│   │   ├── engine.ts          # ZenodeEngine class + full public API
│   │   ├── canvas.ts          # D3 canvas & zoom setup
│   │   ├── grid.ts            # Grid rendering
│   │   ├── history.ts         # Undo/redo command stack
│   │   └── license.ts         # LicenseManager
│   ├── nodes/
│   │   ├── registry.ts        # ShapeRegistry — all renderers registered here
│   │   ├── placement.ts       # Place / drag / delete logic
│   │   ├── selection.ts       # Single + lasso selection (uses renderer.getBounds)
│   │   ├── overlay.ts         # Selection overlay (uses renderer.getPath — NEVER plain rect)
│   │   ├── status.ts          # Node status (running/success/error/warning)
│   │   └── shapes/
│   │       ├── rectangle.ts   # Implements ShapeRenderer — handles per-corner borderRadius
│   │       ├── circle.ts      # Implements ShapeRenderer
│   │       └── rhombus.ts     # Implements ShapeRenderer
│   ├── connections/
│   │   ├── manager.ts         # Connection state
│   │   ├── ports.ts           # Anchor ports (uses renderer.getPorts)
│   │   ├── drawing.ts         # Ghost line while drawing
│   │   └── paths/
│   │       ├── straight.ts
│   │       ├── curved.ts
│   │       ├── s-shaped.ts
│   │       └── l-bent.ts
│   ├── validation/
│   │   ├── engine.ts          # Validation rule runner
│   │   └── rules/
│   │       ├── no-cycles.ts
│   │       ├── all-connected.ts
│   │       └── entry-exit.ts
│   ├── export/
│   │   ├── json.ts            # toJSON / fromJSON
│   │   ├── xml.ts             # toXML
│   │   ├── bpmn.ts            # toBPMN / fromBPMN (Pro)
│   │   ├── mermaid.ts         # toMermaid
│   │   ├── dot.ts             # toDOT
│   │   └── image.ts           # toImage PNG/SVG (Pro)
│   ├── simulation/
│   │   └── runner.ts          # Workflow step simulation (Pro)
│   ├── schema/
│   │   └── panel.ts           # Schema-driven property panel renderer
│   ├── plugins/
│   │   ├── manager.ts         # engine.use(plugin) implementation
│   │   ├── auto-layout.ts     # AutoLayoutPlugin (reference implementation)
│   │   ├── export.ts          # ExportPlugin (reference implementation)
│   │   ├── minimap.ts         # MinimapPlugin (Pro)
│   │   └── collaboration.ts   # CollaborationPlugin (Pro/Team)
│   ├── state/
│   │   ├── export.ts
│   │   └── schema.ts          # Versioned state schema
│   ├── types/
│   │   └── index.ts           # ALL exported interfaces incl. ShapeRenderer, PortMap, BoundingBox
│   └── themes/
│       ├── dark.css
│       └── light.css
├── examples/
│   ├── custom-shapes/
│   │   ├── hexagon.ts         # Example ShapeRenderer implementation
│   │   └── star.ts            # Example SVG string shortcut
│   └── plugins/
│       └── my-shapes-plugin.ts  # Example ZenodePlugin
├── demo/                      # Demo app (Vite)
├── tests/
├── vite.config.ts             # Library build
├── vite.widget.config.ts      # UMD widget build
└── package.json
```

---

## 🧪 Before Writing Any Code — Ask These First

1. Does this mutate engine state? → Command pattern + emit event.
2. Does this render something? → D3 data join on the correct layer group.
3. Does this need to be undoable? → Yes if it changes nodes, connections, or viewport.
4. Is this a premium feature? → Gate via `LicenseManager.check('feature-name')`.
5. Does this need a config option? → Add to `src/types/index.ts` with typed default.
6. Does this change node appearance? → Use `--zenode-*` CSS variables, not hardcoded values.
7. Does this involve coordinates? → Use `d3.pointer(event, svgRoot)`, account for zoom transform.
8. Does this draw an overlay, selection ring, or port? → Call `registry.get(node.type).getPath(node)` — never a plain rect/circle.
9. Is this a new shape? → Must implement full `ShapeRenderer`: `draw`, `getPath`, `getBounds`, `getPorts`.

---

## 🗺 Build Priority Order

```
✅ Phase 1.1  Shape placement
✅ Phase 1.2  Drag & drop (current scope done; edge+center refinement can continue in 1.4)
             └── Define ShapeRenderer interface in src/types/index.ts
             └── Create ShapeRegistry in src/nodes/registry.ts
             └── Rewrite Rectangle/Circle/Rhombus to implement ShapeRenderer
             └── Fix overlay to call renderer.getPath() not plain rect
✅ Phase 1.3  Selection & multi-selection (uses renderer.getBounds + getPath)
             └── Add renderer-agnostic Visual Effects System (minimal)
             └── Define `VisualState` in src/types/index.ts
             └── Create `src/effects/engine.ts` with `applyEffects(...)`
             └── Integrate effects right after node/edge draw calls
             └── Implement Glow + Stroke Flow + Edge Gradient Progress only
✅ Phase 1.4  Alignment guides
             └── Edge + center anchor detection (left/right/top/bottom + center)
             └── Renderer-bounds-aware guide math via ShapeRenderer.getBounds()
             └── Configurable edge/center guide styling + threshold
             └── RAF-throttled updates + drag-end cleanup
⬜ Phase 2.1  Connector ports (uses renderer.getPorts — works for all shapes)
⬜ Phase 2.2  Drawing connections
⬜ Phase 2.3  Connector types
⬜ Phase 3    Full public API surface
⬜ Phase 3.1  engine.registerShape() + engine.use(plugin) — registry already built, just expose it
⬜ Phase 3.3  Live node status system  ← publish + write devto article here
⬜ Phase 3.4  Validation engine        ← second article
⬜ Phase 3.5  XML / Mermaid / DOT export
⬜ Phase 4.1  Schema-driven property panels
⬜ Phase 5    Plugin system — ship AutoLayout + Export plugins as reference
⬜ Phase 6.1  JSON state export/import
⬜ Phase 6.3  Undo / Redo
⬜ Phase 3.5  BPMN export (Pro)        ← third article, enterprise hook
⬜ Phase 4.2  Simulation / step runner (Pro)
⬜ Phase 6.2  Image export (Pro)
⬜ Phase 7    Demo app + embeddable widget
```

---

*End of prompt. Currently working on: Phase 2.1 — Connector anchors (ports) using `renderer.getPorts()`.*

---

## 🧾 Context Management Update (Latest Implementation Snapshot)

Use this section as the **source of truth** for current implementation state when starting a new coding session.

### ✅ What is now implemented in code

- `ShapeRenderer` contract is implemented in `Zenode/src/types/index.ts` with:
  - `draw(g, config, theme)`
  - `getPath(config)`
  - `getBounds(config)`
  - `getPorts(config)`
- `ShapeRegistry` is implemented in `Zenode/src/nodes/registry.ts`.
- Built-in renderers are implemented in:
  - `Zenode/src/nodes/shapes/rectangle.ts`
  - `Zenode/src/nodes/shapes/circle.ts`
  - `Zenode/src/nodes/shapes/rhombus.ts`
- Engine registers built-ins at boot and exposes:
  - `engine.registerShape(name, renderer)`
  - implemented in `Zenode/src/core/engine.ts`
- Placed-node rendering uses registry-driven renderer lookup:
  - `renderer.draw(...)` in `Zenode/src/nodes/placement.ts`
- Selection ring/overlay path is renderer-driven:
  - `renderer.getPath(...)` via `Zenode/src/nodes/overlay.ts`
- Selection state foundation (Phase 1.3) added in `Zenode/src/core/engine.ts`:
  - single select, canvas deselect, lasso multi-select
  - delete selected nodes + `Escape` clear
- Keyboard shortcut config foundation added:
  - `canvasProperties.keyboardShortcuts` in configuration model/defaults/merger
  - configurable bindings for delete/clear
  - callback hooks: `onKeyDown`, `onDeleteSelection`, `onClearSelection`, `custom`
- Alignment guide system (Phase 1.4) completed with renderer-aware geometry:
  - edge + center alignment detection during drag
  - guide computation based on `ShapeRenderer.getBounds()`
  - immediate guide cleanup on drag end
  - `requestAnimationFrame` throttling for smooth guide updates
  - guide style controls exposed in config:
    - `alignmentLines.alignmentThreshold`
    - `alignmentLines.edgeGuides.{enabled,color,width,dashed,dashArray}`
    - `alignmentLines.centerGuides.{enabled,color,width,dashed,dashArray}`

### ✅ Example: custom keybinding callbacks (plugin-style behavior)

```ts
canvasProperties: {
  keyboardShortcuts: {
    enabled: true,
    deleteSelection: ['Delete', 'Backspace'],
    clearSelection: ['Escape'],
    customBindings: {
      'selection:clear': ['Ctrl+D'],
      'canvas:log-state': ['Ctrl+Shift+L']
    },
    callbacks: {
      onDeleteSelection: ({ selectedNodeIds }) => {
        console.log('[keys] delete selection', selectedNodeIds)
        // return false to stop default delete behavior
      },
      custom: {
        'selection:clear': ({ engine }) => {
          ;(engine as any).clearSelection?.()
        },
        'canvas:log-state': ({ engine }) => {
          console.log('placed nodes:', (engine as any).getPlacedNodes?.().length ?? 0)
        }
      }
    }
  }
}
```
- Lasso layer added to canvas model/rendering:
  - `CanvasElements.lasso`
  - `g.lasso` created in `src/components/canvas/canvas.ts`
  - lasso can be toggled via engine `setLassoEnabled(...)`

### ✅ Geometry utilities migrated

- `roundedRectPath(...)` moved to:
  - `Zenode/src/nodes/geometry/rectanglePath.ts`
- Imports updated in:
  - `Zenode/src/nodes/shapes/rectangle.ts`
  - `Zenode/src/events/mouseMove.ts`

### ✅ Legacy cleanup completed

- Removed legacy shape draw helper files from `src/components/shapeTypes/`:
  - `circle.ts` ❌ removed
  - `rhombus.ts` ❌ removed
  - `rectangle.ts` ❌ removed
- Do not recreate `components/shapeTypes/*` for core rendering logic.

### 📌 Rules for future changes

1. All shape visuals must come through `ShapeRegistry` + `ShapeRenderer`.
2. Overlay/selection/lasso/ports must use renderer geometry (`getPath/getBounds/getPorts`).
3. New geometry helpers should live under `src/nodes/geometry/`, not `src/components/shapeTypes/`.
4. Keep `engine.registerShape(...)` as the single extension point for custom shapes.
