# Zenode — Development Guide

> Source of truth for all coding sessions. Read this before writing any code.

---

## Project Overview

**Zenode** is a high-performance, D3.js-powered diagramming engine for web-based design tools. It is **framework-agnostic** and **JSON-config-driven**, built in TypeScript.

**Goal:** Dual-license open-core product → embeddable SaaS widget (OEM). Think React Flow Pro or JointJS+, but built on D3.js for fine-grained SVG control and zero framework lock-in.

### Competitive Edge
- D3-native, framework-agnostic (React, Vue, Angular, Svelte, vanilla JS)
- JSON-first config, zero abstraction SVG control
- BPMN-compatible XML export
- Live node status system + workflow validation
- Plug-and-play public API

---

## Distribution Model

```
@zenode/core     ← Free, MIT
@zenode/pro      ← Paid, closed source
@zenode/react    ← React wrapper
zenode.min.js    ← CDN/UMD drop-in
```

| Tier | Price | Key Features |
|---|---|---|
| Open Source | Free | Core engine, shapes, JSON/XML export, node status, validation |
| Pro | $149/yr | Auto-layout, PNG export, minimap, undo history, custom themes |
| Team | $499/yr | Real-time collaboration, BPMN export, priority support |
| Embed License | $200/mo | OEM rights, white-label, no attribution |

Premium features are gated via `LicenseManager`.

---

## Core Architecture Rules

### Always obey these — no exceptions

1. **State:** `ZenodeEngine` owns all mutable state. Spread, never mutate. Emit typed events on every mutation.
2. **Coordinates:** Always use `d3.pointer(event, svgRoot)`. Account for zoom transform.
3. **Overlays/Selection/Ports:** Always use `registry.get(node.type).getPath/getBounds/getPorts()`. Never use a plain `<rect>` or `<circle>` overlay.
4. **New shapes:** Must implement full `ShapeRenderer`: `draw`, `getPath`, `getBounds`, `getPorts`.
5. **Context Pad:** Always HTML overlay (`position: absolute`), never inside SVG. Position always derived from current D3 zoom transform — never cache screen coordinates.
6. **Effects:** Applied via `effectsEngine.applyEffects()` after draw — never inside `ShapeRenderer.draw()`.
7. **Extension points:** `engine.registerShape()` for shapes. `engine.registerContextAction()` for pad actions. `engine.use(plugin)` for plugins.
8. **Layer order (strict):** `g.grid` → `g.connections` → `g.placed-nodes` → `g.preview` → `g.guides` → `g.lasso`
9. **`pointer-events: none`** on `g.guides`, `g.preview`, and all overlays always.
10. **D3 data joins:** Always `.data().join()` — never manually append/remove.

### Before writing any code, ask:
- Does this mutate engine state? → Command pattern + emit event.
- Does this render something? → D3 data join on the correct layer.
- Is this a premium feature? → Gate via `LicenseManager.check('feature-name')`.
- Does this need a config option? → Add to `src/types/index.ts` with typed default.
- Does this change node appearance? → Use `--zenode-*` CSS variables only.

---

## Key Interfaces (Do Not Change Without Reason)

### ShapeRenderer
```typescript
interface ShapeRenderer {
  draw: (g: D3Selection, config: ResolvedShapeConfig, theme: ThemeConfig) => void;
  getPath: (config: ResolvedShapeConfig) => string;
  getBounds: (config: ResolvedShapeConfig) => BoundingBox;
  getPorts: (config: ResolvedShapeConfig) => PortMap;
}
```

### VisualState
```typescript
interface VisualState {
  status?: 'idle' | 'running' | 'success' | 'error' | 'warning';
  effects?: {
    glow?: { color?: string; intensity?: number };
    strokeAnimation?: { type: 'flow'; speed?: number };
    gradientFlow?: { progress: number; fromColor: string; toColor: string };
  };
}
```

### ContextPadAction
```typescript
interface ContextPadAction {
  id: string;
  icon: string;
  tooltip: string;
  targets?: Array<'node' | 'edge'>;
  appliesTo?: string[];
  group?: 'primary' | 'secondary' | 'danger' | string;
  handler: (target: ContextPadTarget, engine: ZenodeEngine) => void;
  isVisible?: (target: ContextPadTarget, engine: ZenodeEngine) => boolean;
  isDisabled?: (target: ContextPadTarget, engine: ZenodeEngine) => boolean;
}
```

---

## CSS Variables (Use These, Never Hardcode)

```css
/* Canvas */
--zenode-canvas-bg        --zenode-grid-color

/* Nodes */
--zenode-node-bg          --zenode-node-border
--zenode-selection-color  --zenode-guide-color
--zenode-port-color

/* Status */
--zenode-status-running   --zenode-status-success
--zenode-status-error     --zenode-status-warning

/* Edges */
--zenode-edge-color

/* Context Pad */
--zenode-contextpad-bg          --zenode-contextpad-border
--zenode-contextpad-radius      --zenode-contextpad-action-size
--zenode-contextpad-action-hover --zenode-contextpad-action-active
--zenode-contextpad-danger      --zenode-contextpad-disabled
--zenode-contextpad-divider
```

---

## File Structure (Current)

```
src/
├── core/
│   └── engine.ts             # ZenodeEngine — full public API
├── components/
│   └── canvas/
│       ├── canvas.ts         # Layer groups, SVG setup
│       └── grid.ts           # Infinite grid (SVG pattern + patternTransform)
├── nodes/
│   ├── registry.ts           # ShapeRegistry
│   ├── placement.ts          # Place + render nodes via registry
│   ├── selection.ts          # Single + lasso multi-select
│   ├── overlay.ts            # Selection ring via renderer.getPath()
│   ├── ports.ts              # Port anchors via renderer.getPorts()
│   ├── geometry/
│   │   └── rectanglePath.ts  # roundedRectPath() utility
│   └── shapes/               # All implement ShapeRenderer
│       ├── rectangle.ts      circle.ts      rhombus.ts
│       ├── hexagon.ts        pentagon.ts    triangle.ts
│       ├── star.ts           oval.ts        parallelogram.ts
│       ├── trapezoid.ts      kite.ts        semicircle.ts
│       ├── octagon.ts        heptagon.ts    decagon.ts
│       └── nonagon.ts
├── connections/
│   ├── render.ts             # Connection rendering + labels
│   ├── paths/
│   │   ├── straight.ts       curved.ts
│   │   ├── s-shaped.ts       l-bent.ts
│   └── routing/              # Smart routing (Pro)
├── contextpad/
│   ├── registry.ts           # ContextPadRegistry
│   ├── renderer.ts           # HTML overlay — position from D3 zoom transform
│   └── defaults.ts           # delete, connect, edit-label, properties, duplicate
├── effects/
│   └── engine.ts             # applyEffects(g, path, visualState)
├── plugins/
│   └── pluginManager.ts
├── model/
│   └── configurationModel.ts
├── events/
├── utils/
└── types/
    └── index.ts              # All interfaces
```

---

## Phase Roadmap

### VERSION 1 — Core Engine ✅

**Phase 1.1 — Shape Placement** ✅
- `mouseClick` transitions preview → placed state.
- Placed shapes stored in `placedNodes[]` with `id`, `type`, `x`, `y`, `width`, `height`, `meta`.
- Rendered in `g.placed-nodes` layer.

**Phase 1.2 — Drag & Drop** ✅
- D3 drag on placed nodes with grid snapping.
- Alignment hints during drag.
- Position updated in engine state on drag end.

**Phase 1.3 — Selection & Multi-Selection** ✅
- Single click selects (overlay via `renderer.getPath()`).
- Canvas click deselects all.
- Lasso multi-select via `getBounds()`.
- `Escape` clears, `Delete`/`Backspace` deletes selected.
- Keyboard shortcuts configurable via `canvasProperties.keyboardShortcuts`.

**Phase 1.3 Extension — Visual Effects System** ✅
- `VisualState` type in `src/types/index.ts`.
- `src/effects/engine.ts` — `applyEffects(g, path, visualState)`.
- Glow (SVG filter), Stroke Flow (dash animation), Gradient Progress (edges).
- `engine.updateNodeVisualState(id, patch)` / `engine.updateEdgeVisualState(id, patch)`.

**Phase 1.4 — Alignment Guides** ✅
- Edge + center alignment detection during drag via `getBounds()`.
- RAF-throttled, immediate cleanup on `dragend`.
- Config: `alignmentLines.alignmentThreshold`, `edgeGuides.*`, `centerGuides.*`.

**Phase 2.1 — Connector Ports** ✅
- Ports: `top`, `bottom`, `left`, `right`, `center` via `renderer.getPorts()`.
- Rendered as small circles on hover.
- Port positions recompute on node move.

**Phase 2.2 — Drawing Connections** ✅
- Click + drag from port initiates connection.
- Live ghost connector follows mouse.
- Drop on target port finalises → stored in `ZenodeEngine.connections[]`.

**Phase 2.3 — Connector Types** ✅
- `straight`, `curved` (cubic bezier), `s-shaped`, `l-bent` (orthogonal).

**Phase 2.4 — Smart Routing (Pro)** ✅
- Basic obstacle avoidance for connections navigating around nodes.
- Gated via `LicenseManager`.

**Phase 2.5 — Connection Labels** ✅
- Optional text label at midpoint.
- Styled as a pill background for readability.
- Supports inline editing.

**Phase 2.6 — Context Action Pad** ✅
- Floating HTML overlay toolbar for nodes and edges.
- `ContextPadRegistry` — register/unregister actions.
- `ContextPadRenderer` — positions from D3 zoom transform.
- Default actions: delete, connect, edit-label, properties, duplicate.
- Hides on: drag start, deselect, target deleted, Escape.
- Config: `contextPad.enabled/trigger/position/offset/suppressDefaults`.
- Events: `contextpad:open/close/action/properties`.
- `engine.registerContextAction()` / `engine.unregisterContextAction()`.
- CSS vars: `--zenode-contextpad-*` namespace.

**Phase 2.7 — Navigation Controls** ✅
- Floating zoom in/out and fit-to-screen buttons.
- Smooth D3 transitions.

---

### VERSION 2 — Extended Shape Library & Infinite Canvas ✅

**V2.1 — Extended Shape Library** ✅

Added 13 new shapes, all fully implementing `ShapeRenderer` (`draw`, `getPath`, `getBounds`, `getPorts`):

| Shape | File |
|---|---|
| Hexagon | `shapes/hexagon.ts` |
| Pentagon | `shapes/pentagon.ts` |
| Triangle | `shapes/triangle.ts` |
| Star | `shapes/star.ts` |
| Oval | `shapes/oval.ts` |
| Parallelogram | `shapes/parallelogram.ts` |
| Trapezoid | `shapes/trapezoid.ts` |
| Kite | `shapes/kite.ts` |
| Semicircle | `shapes/semicircle.ts` |
| Octagon | `shapes/octagon.ts` |
| Heptagon | `shapes/heptagon.ts` |
| Nonagon | `shapes/nonagon.ts` |
| Decagon | `shapes/decagon.ts` |

**V2.2 — Infinite Canvas** ✅
- Grid uses SVG `<pattern>` with `patternTransform` — seamless infinite background.
- Removed fixed `viewBox` and coordinate constraints — canvas fills container dynamically.
- Removed `translateExtent` — unrestricted panning.
- Grid pattern syncs with D3 zoom/pan transforms.

**V2.3 — Deployment (Vercel + NPM)** ✅
- `vercel.json` configured with clean URL rewrites to `playground/index.html`.
- Build pipeline: `rollup -c` with `@rollup/plugin-typescript`, `@rollup/plugin-commonjs`, `@rollup/plugin-node-resolve`.
- Outputs: `dist/index.js` (ESM), `dist/index.cjs` (CJS), `dist/index.d.ts` (types).
- Dev script: `npm run dev` (`npx rollup -c -w`).
- Local preview: `npm start` (`npm run build && npx http-server . -p 3000 -o playground/index.html`).

---

### PHASE 3 — Public API Surface ⬜ ← STARTING NOW

**3.1 — Node API**
```typescript
engine.addNode(config: NodeConfig): string
engine.removeNode(id: string): void
engine.updateNode(id: string, patch: Partial<NodeConfig>): void
engine.getNode(id: string): NodeData | null
engine.getAllNodes(): NodeData[]
engine.focusNode(id: string): void
engine.highlight(id: string, durationMs?: number): void
engine.duplicateNode(id: string): string
engine.lock(): void
engine.unlock(): void
engine.setReadOnly(bool: boolean): void
```

**3.2 — Edge/Connection API**
```typescript
engine.addEdge(config: EdgeConfig): string
engine.removeEdge(id: string): void
engine.getEdge(id: string): EdgeData | null
engine.getAllEdges(): EdgeData[]
engine.getPath(fromNodeId: string, toNodeId: string): string[]
engine.startConnectionFrom(nodeId: string): void
engine.beginLabelEdit(id: string, kind: 'node' | 'edge'): void
```

**3.3 — Live Node Status API** *(Free — major DX differentiator)*
```typescript
engine.setNodeStatus(id: string, status: 'idle' | 'running' | 'success' | 'error' | 'warning'): void
// running → animated pulse, success → checkmark badge, error → red shake, warning → amber badge
```

**3.4 — Workflow Validation Engine** *(Free)*
```typescript
engine.addRule(rule: BuiltInRule | CustomRule): void
// built-ins: 'no-cycles', 'all-nodes-connected', 'single-entry-point', 'single-exit-point', 'max-depth'
engine.validate(): ValidationResult  // { valid, errors, warnings }
```

**3.5 — Export / Import API**
```typescript
engine.toJSON(): ZenodeState         engine.fromJSON(state): void
engine.toXML(): string
engine.toMermaid(): string           engine.toDOT(): string
engine.toBPMN(): string              engine.fromBPMN(xml): void   // Pro
engine.toImage(format: 'png' | 'svg'): Promise<Blob>              // Pro
```

**3.6 — Canvas / Viewport API**
```typescript
engine.clear(): void          engine.reset(): void
engine.zoomTo(level): void    engine.panTo(x, y): void
engine.fitToScreen(): void    engine.getViewport(): ViewportState
engine.setTheme(theme): void  // Pro
engine.enableMinimap(): void  // Pro
```

**3.7 — Event API**
```typescript
engine.on(event, handler)
engine.off(event, handler)
engine.once(event, handler)
// Events: node:placed | node:moved | node:deleted | node:selected | node:click |
//         node:doubleclick | edge:created | edge:deleted | workflow:change |
//         validation:error | export:complete | contextpad:open | contextpad:close |
//         contextpad:action | contextpad:properties
// All handlers receive: { nodeId?, edgeId?, data, event, engine }
```

**3.8 — UX Excellence** *(User-Friendly Polish)*
```typescript
engine.alignSelection(direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): void
engine.distributeSelection(direction: 'horizontal' | 'vertical'): void
engine.copySelection(): void
engine.pasteSelection(): void
engine.setCommandPaletteEnabled(bool: boolean): void // Opens on '/' or 'Shift+I'
```
- **In-Place Edge Labels**: Full multi-line support for connections using the Node Content logic.
- **Smart Drag Snapping**: Magnet-like snapping to siblings' edges during move (not just grid).
- **Group Transformation**: Resize or rotate the bounding box of a multi-selection.

---

### PHASE 4 — Differentiator Features ⬜

**4.1 — Schema-Driven Node Property Panels**
- Node config includes a `schema` object defining field types (string, select, keyvalue, textarea).
- Auto-renders a property panel on node select.
- Values stored in `node.meta`. Emits `node:config:change`.
- Opens via `contextpad:properties` event.

**4.2 — Workflow Simulation / Step Runner** *(Pro)*
```typescript
const ctrl = engine.simulate(inputData?)
ctrl.step()  ctrl.play(delayMs)  ctrl.pause()  ctrl.reset()
ctrl.on('step', ({ nodeId, inputData, outputData }) => {})
```

**4.3 — Declarative Workflow DSL** *(Experimental)*
```typescript
zenode.define(`START → [validate] → { valid: [pay] → END, invalid: [notify] → END }`)
engine.toDSL()
```

---

### PHASE 5 — Plugin System ⬜

**5.1** — `engine.registerShape(name, renderer)` — already wired in Phase 1, just expose publicly.

**5.2** — Per-node event callbacks in JSON config: `onClick`, `onDoubleClick`, `onHover`, `onDragEnd`, `onDelete`, `onConnect`.

**5.3** — `engine.use(plugin)` — ship reference plugins:
- `AutoLayoutPlugin` — Dagre / force-directed
- `ExportPlugin` — PNG / SVG / JSON
- `MinimapPlugin` — Pro
- `CollaborationPlugin` — Pro/Team

---

### PHASE 6 — Persistence & State ⬜

**6.1** — `engine.toJSON()` / `engine.fromJSON()` — versioned (`version: "1.0"`).

**6.2** — `engine.toImage('png' | 'svg')` *(Pro)* via `canvg`.

**6.3** — Undo/Redo — command pattern. Free: 10 steps. Pro: up to 200.

---

### PHASE 7 — Demo App & Embeddable Widget ⬜

**7.1 — Demo App** (Vite + TS or React)
- Left sidebar: shape palette (all V2 shapes)
- Top toolbar: connector type, export, undo/redo, zoom, validate, simulate
- Canvas: full engine instance with context pad visible and interactive
- Right panel: schema-driven property inspector (opens via `contextpad:properties` event)
- Bottom bar: validation status, node/edge count, zoom level
- Dark dev-tool aesthetic (Figma / Linear / VS Code)

**7.2 — Embeddable Widget**
- `zenode.min.js` UMD — `window.Zenode`, `new Zenode.Engine('#id', config)`
- Under 120kb gzipped. Works in sandboxed iframe (`allow-scripts`).

---

## Build Priority Order

```
✅ Phase 1.1  Shape placement
✅ Phase 1.2  Drag & drop + ShapeRenderer + ShapeRegistry
✅ Phase 1.3  Selection & multi-selection + Visual Effects System
✅ Phase 1.4  Alignment guides
✅ Phase 2.1  Connector ports
✅ Phase 2.2  Drawing connections (ghost line → finalise)
✅ Phase 2.3  Connector types (straight, curved, s-shaped, l-bent)
✅ Phase 2.4  Smart routing (Pro)
✅ Phase 2.5  Connection labels + inline edit
✅ Phase 2.6  Context Action Pad (HTML overlay, registry, defaults, events)
✅ Phase 2.7  Navigation controls (zoom, fit)
✅ V2.1       13 new shape renderers (hexagon → decagon)
✅ V2.2       Infinite canvas (SVG pattern grid + no translateExtent)
✅ V2.3       Vercel deployment + build pipeline
⬜ Phase 3    Full public API surface  ← CURRENT
⬜ Phase 3.8  UX Excellence (Align, Commands, Group Ops)
⬜ Phase 3.3  Live node status system
⬜ Phase 3.4  Workflow validation engine
⬜ Phase 3.5  Export: JSON, XML, Mermaid, DOT
⬜ Phase 4.1  Schema-driven property panels
⬜ Phase 5    Plugin system
⬜ Phase 6    Undo/redo + JSON persistence
⬜ Phase 3.5  BPMN export (Pro)
⬜ Phase 4.2  Simulation / step runner (Pro)
⬜ Phase 6.2  Image export (Pro)
⬜ Phase 7    Demo app + embeddable widget
```

---

*Currently working on: **Phase 3 — Full Public API Surface***