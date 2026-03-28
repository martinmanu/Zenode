# 🧠 Zenode — AI Coding Prompt (Cursor / Claude Code / Copilot)

Paste this entire prompt at the start of your Cursor session or as a persistent `.cursorrules` file in your project root.

---

## 🎯 End Goal — What Zenode Becomes

Zenode is a **modular JavaScript ecosystem for visual workflows**.

Each package solves an independent problem. All packages work better together. Developers adopt one package and expand naturally. The full stack is more powerful than any individual part.

```
"Use just the canvas. Use just the runtime.
 Use the full stack. Each part works standalone
 and integrates with your existing tools."
```

This is the same model as TanStack, Prisma, and Babel — modular by default, opinionated when you want it.

---

## 📦 The Zenode Ecosystem — Package Architecture

```
@zenode/designer       ← Layer 1 — Visual canvas only
@zenode/serializer     ← Layer 2 — Export/import formats only
@zenode/runtime        ← Layer 3 — Workflow execution engine only
@zenode/transformer    ← Layer 4 — Output shape transformation only

@zenode/core           ← All four layers, pre-wired, one install
@zenode/react          ← React wrapper around @zenode/designer
@zenode/vue            ← Vue wrapper around @zenode/designer
@zenode/bpmn-presets   ← Free BPMN 2.0 shape preset library

zenode.min.js          ← CDN/UMD bundle of @zenode/core
```

### Why This Architecture Wins

```
Company A  → Uses only @zenode/designer. Has their own execution engine.
             Exports Zenode JSON → feeds their own backend.

Company B  → Uses only @zenode/runtime. Has their own diagram tool (React Flow, etc).
             Imports their diagram JSON → Zenode executes it.

Company C  → Already uses BPMN.js. Has years of BPMN XML diagrams.
             @zenode/runtime imports and EXECUTES their existing BPMN XML.
             Zero diagram rebuild. Zero migration cost.
             ↑ This is a unique product. No JavaScript BPMN runtime exists.

Company D  → Uses @zenode/core. Gets the full stack, tightest integration.
```

### Interoperability Contract

Every package speaks the same JSON dialect. Clean boundaries:

```typescript
// @zenode/designer → outputs standard ZenodeState JSON
const diagramState = engine.toJSON();

// @zenode/serializer → converts from/to any format
import { toBPMN, toMermaid, fromBPMN } from '@zenode/serializer';
const bpmnXml = toBPMN(diagramState);

// @zenode/runtime → executes ANY compatible JSON (not just Zenode diagrams)
import { ZenodeRuntime } from '@zenode/runtime';
const runtime = ZenodeRuntime.fromBPMN(existingBpmnXml); // works with 3rd party XML

// @zenode/transformer → shapes any execution result
import { createTransformer } from '@zenode/transformer';
const output = createTransformer(result => ({ ok: true, data: result.finalOutput }));
```

---

## 🗺 Four-Layer System

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1 — @zenode/designer  (Visual Designer)             │
│  D3.js canvas, shapes, connections, context pad, plugins   │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2 — @zenode/serializer  (Serialization)             │
│  JSON, XML, BPMN 2.0, Mermaid, DOT, DSL export/import     │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3 — @zenode/runtime  (Execution Engine)             │
│  Converts diagram → executable workflow, runs resolvers    │
├─────────────────────────────────────────────────────────────┤
│  LAYER 4 — @zenode/transformer  (Output Shaping)           │
│  User defines their own output object from execution result│
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 Pricing Per Package

| Package | Free | Paid |
|---|---|---|
| `@zenode/designer` | Core canvas, shapes, basic connections | Pro $149/yr — minimap, themes, undo+, PNG export |
| `@zenode/serializer` | JSON, Mermaid, DOT, DSL | Pro $99/yr — BPMN 2.0, image export |
| `@zenode/runtime` | 100 executions/day | Runtime $49/mo — unlimited executions |
| `@zenode/core` (bundle) | All free tiers | Bundle $199/yr — all pro features |
| `@zenode/bpmn-presets` | Always free | — |
| Embed License | — | $200/mo — OEM/white-label embed |
| Enterprise Runtime | — | $500/mo — production SLA + support |

Runtime pricing scales with value extracted. A startup running 50 workflows/day pays nothing. An enterprise running 50,000/day pays appropriately.

---

## 🆚 Competitive Map

| | React Flow | BPMN.js | JointJS+ | n8n | **Zenode** |
|---|---|---|---|---|---|
| Framework agnostic | ❌ | ✅ | ✅ | N/A | ✅ |
| Open source core | ✅ | ✅ | ❌ | ✅ | ✅ |
| Custom shapes API | ⚠️ | ❌ | ✅ | ❌ | ✅ |
| BPMN export | ❌ | ✅ | ❌ | ❌ | ✅ Pro |
| JSON export | ✅ | ❌ | ✅ | ✅ | ✅ |
| JS workflow execution | ❌ | ❌ | ❌ | ✅ | ✅ |
| Live node status | ❌ | ❌ | ❌ | ✅ | ✅ |
| Plugin context pad | ❌ | ❌ hardcoded | ❌ | ❌ | ✅ |
| Visual effects | ❌ | ❌ | ❌ | ❌ | ✅ |
| Modular packages | ❌ | ❌ | ❌ | ❌ | ✅ |
| Embeddable UMD | ⚠️ | ❌ | ⚠️ | ❌ | ✅ |
| Price | Free/Pro | Free | $1200+/yr | Free/Cloud | Free/$149/yr |

**The unique moat:** No JavaScript library executes BPMN diagrams at runtime. Camunda has a Java runtime. Flowable has a Java runtime. `@zenode/runtime` that executes BPMN XML from any source — including BPMN.js diagrams — is a completely unclaimed space.

---

## 🚀 Immediate Focus — Ship Layer 1 First

> **Current task: Get `@zenode/designer` live and production-ready.**
> Everything else is future. The designer is the entry point for every other package.

### Why Layer 1 First

```
Layer 1 live → GitHub stars → developer adoption
             → NPM downloads → credibility
             → Real user feedback → better Layer 2 API design
             → Potential acqui-hire interest starts here

Layer 3 alone → No distribution channel, no one finds it
Layer 2 alone → No demo, no one understands what it serializes
```

The designer is your marketing, your demo, your distribution channel, and your feedback loop all in one. Everything else depends on it having real users.

### Layer 1 Ship Checklist

```
⬜ Context Action Pad complete (Phase L1·3)
⬜ Connection markers/arrowheads (Phase L1·2+)
⬜ Basic undo/redo (10 steps free — enough for launch)
⬜ README with working GIF and 10-line quick start
⬜ Live demo deployed (Vercel/Netlify — link in README)
⬜ NPM publish @zenode/designer v0.1.0
⬜ Show HN post
```

That is the complete v0.1.0 launch scope. Everything else comes after users.

---

## 🧩 Config Management — Keep It Small

```typescript
// ✅ CORRECT — small config, API-first
const engine = new ZenodeEngine('#canvas', {
  canvas:     { width: 800, height: 600, backgroundColor: '#fff' },
  grid:       { type: 'dotted', size: 20, color: '#ccc' },
  theme:      'dark',
  contextPad: { trigger: 'select', position: 'top-right' }
});
engine.addNode({ preset: 'bpmn-task', x: 100, y: 200, meta: { label: 'Review' } });
engine.addEdge({ from: 'node-1', fromPort: 'right', to: 'node-2', toPort: 'left' });

// ❌ WRONG — never declare node instances inside config
const engine = new ZenodeEngine('#canvas', {
  shapes: { default: { rectangle: [{ id: 'task0', width: 120 ... }] } }
});
```

Config = canvas environment only. Nodes/edges added via API. Styles via presets.

---

## 🧩 Shape Renderer Contract — Core Plugin Architecture

> ⚠️ This is the foundation everything else is built on. Set up before Phase 1.3. Never bypass.

```typescript
// src/types/index.ts
export interface ShapeRenderer {
  draw:      (g: D3Selection, config: ResolvedShapeConfig, theme: ThemeConfig) => void;
  getPath:   (config: ResolvedShapeConfig) => string;
  getBounds: (config: ResolvedShapeConfig) => BoundingBox;
  getPorts:  (config: ResolvedShapeConfig) => PortMap;
}
export interface BoundingBox { x: number; y: number; width: number; height: number; }
export interface PortMap {
  top: Point; bottom: Point; left: Point; right: Point; center: Point;
  [key: string]: Point; // custom ports
}
type Point = { x: number; y: number };
```

### Overlay — Always Use getPath()

```typescript
// ❌ WRONG — ignores actual geometry
g.append('rect').attr('width', node.width).attr('height', node.height);

// ✅ CORRECT — matches exact shape regardless of renderer
g.append('path')
  .attr('d', registry.get(node.type).getPath(node))
  .attr('fill', 'none').attr('stroke', overlayColor)
  .attr('pointer-events', 'none'); // ← always none on overlays
```

### Rectangle Renderer — Reference (per-corner borderRadius)

```typescript
export const RectangleRenderer: ShapeRenderer = {
  draw(g, config) {
    g.append('path').attr('d', this.getPath(config))
      .attr('fill', config.color).attr('stroke', config.stroke.color)
      .attr('stroke-width', config.stroke.width)
      .attr('stroke-dasharray', config.stroke.strokeDasharray.join(','));
  },
  getPath(config) {
    const { x, y, width: w, height: h, borderRadius: r } = config;
    const tl=r?.leftTop??0, tr=r?.rightTop??0, bl=r?.leftBottom??0, br=r?.rightBottom??0;
    return [`M ${x+tl} ${y}`,`H ${x+w-tr}`,`Q ${x+w} ${y} ${x+w} ${y+tr}`,
            `V ${y+h-br}`,`Q ${x+w} ${y+h} ${x+w-br} ${y+h}`,
            `H ${x+bl}`,`Q ${x} ${y+h} ${x} ${y+h-bl}`,
            `V ${y+tl}`,`Q ${x} ${y} ${x+tl} ${y}`,'Z'].join(' ');
  },
  getBounds(c) { return { x:c.x, y:c.y, width:c.width, height:c.height }; },
  getPorts(c) {
    return {
      top:{x:c.x+c.width/2,y:c.y}, bottom:{x:c.x+c.width/2,y:c.y+c.height},
      left:{x:c.x,y:c.y+c.height/2}, right:{x:c.x+c.width,y:c.y+c.height/2},
      center:{x:c.x+c.width/2,y:c.y+c.height/2}
    };
  }
};
```

### Plugin System

```typescript
export interface ZenodePlugin { name: string; install(engine: ZenodeEngine): void; }
engine.use(MyPlugin);
// engine.registerShape() + engine.use() being public IS the plugin system.
// Not a future feature — the natural result of correct Phase 1 architecture.
```

---

## ✅ What Is Already Built — Do Not Rebuild

**Core**
- D3.js SVG canvas: zoom, pan, scroll, double-click reset, configurable extents
- Grid: dotted/sheet/line/cross, color, transparency, size
- `ZenodeEngine` class: canvas init, element management, state
- Shape preview with real-time grid snapping
- Shape placement: `mouseClick` → `placedNodes[]` → `g.placed-nodes`
- Config merger with typed defaults

**Shape System**
- `ShapeRenderer` contract: `draw`, `getPath`, `getBounds`, `getPorts`
- `ShapeRegistry` — `src/nodes/registry.ts`
- `RectangleRenderer`, `CircleRenderer`, `RhombusRenderer` all implemented
- `engine.registerShape()` exposed
- Overlay via `renderer.getPath()` — `src/nodes/overlay.ts`
- `roundedRectPath()` — `src/nodes/geometry/rectanglePath.ts`

**Interaction**
- Selection: single, lasso, Escape/Delete, configurable keyboard shortcuts
- Visual Effects: `VisualState`, `applyEffects()`, Glow + Stroke Flow + Gradient
- Alignment guides: renderer-bounds-aware, RAF-throttled, config-driven
- `g.lasso` layer in canvas

**Connections**
- Ports via `renderer.getPorts()`, hover circles, crosshair cursor
- Drawing: ghost line, drop to finalise, stored in `connections[]`
- Types: straight, curved, s-shaped, l-bent
- Smart routing (Pro, gated via LicenseManager)
- Labels: pill-styled, double-click inline edit
- Navigation controls: floating zoom/focus buttons

---

# 🏗 Build Plan — Layer by Layer

---

## LAYER 1 — @zenode/designer

*The D3.js visual canvas. The entry point for the entire ecosystem.*
*⚡ Ship this first. Everything else depends on it having real users.*

---

### L1 · Phase 1 — Core Shape Lifecycle ✅ COMPLETE

- Shape placement, drag & drop, grid snapping
- Selection, lasso, keyboard shortcuts
- Visual Effects System (Glow, Stroke Flow, Gradient)
- Alignment guides

---

### L1 · Phase 2 — Connections ✅ COMPLETE

- Ports via `renderer.getPorts()`
- Drawing connections, ghost line
- Types: straight, curved, s-shaped, l-bent
- Smart routing (Pro)
- Connection labels, inline edit
- Navigation controls

---

### L1 · Phase 2+ — Connection Markers ⬜

- Arrowheads via SVG `<marker>`: `none`, `arrow`, `filled-arrow`, `diamond`, `circle`
- Per-connection color, width, dash pattern
- Animated flow direction via Visual Effects `strokeAnimation`

---

### L1 · Phase 3 — Context Action Pad 🔧 IN PROGRESS

> The floating toolbar near selected nodes/edges. Plugin-extensible from day one.
> Modelled after BPMN.js's context pad. One of the most visible UX differentiators.

```
  ┌──┬──┬──┬──┬──┐
  │🗑│⚡│✏️│⚙│➕│   ← HTML overlay. Never inside SVG.
  └──┴──┴──┴──┴──┘
```

#### Types — `src/types/index.ts`

```typescript
export type ContextPadTarget =
  | { kind: 'node'; id: string; data: NodeData }
  | { kind: 'edge'; id: string; data: EdgeData };

export interface ContextPadAction {
  id:          string;
  icon:        string;           // inline SVG string
  tooltip:     string;
  targets?:    Array<'node' | 'edge'>;   // omit = both
  appliesTo?:  string[];                 // specific node/edge types
  group?:      'primary' | 'secondary' | 'danger' | string;
  handler:     (target: ContextPadTarget, engine: ZenodeEngine) => void;
  isVisible?:  (target: ContextPadTarget, engine: ZenodeEngine) => boolean;
  isDisabled?: (target: ContextPadTarget, engine: ZenodeEngine) => boolean;
}

export interface ContextPadConfig {
  enabled:          boolean;
  trigger:          'hover' | 'select';
  offset:           { x: number; y: number };
  position:         'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  showDefaults:     boolean;
  suppressDefaults?: string[];
}
```

#### Registry — `src/contextpad/registry.ts`

```typescript
export class ContextPadRegistry {
  private actions = new Map<string, ContextPadAction>();
  register(action: ContextPadAction): void { this.actions.set(action.id, action); }
  unregister(id: string): void { this.actions.delete(id); }
  getActionsFor(target: ContextPadTarget, engine: ZenodeEngine): ContextPadAction[] {
    return [...this.actions.values()]
      .filter(a => {
        if (a.targets && !a.targets.includes(target.kind)) return false;
        if (a.appliesTo && !a.appliesTo.includes(target.data.type)) return false;
        if (a.isVisible && !a.isVisible(target, engine)) return false;
        return true;
      })
      .sort((a, b) => (a.group ?? 'primary').localeCompare(b.group ?? 'primary'));
  }
}
```

#### Default Actions — `src/contextpad/defaults.ts`

`delete` (both), `connect` (nodes), `edit-label` (both), `properties` (both), `duplicate` (nodes), `change-color` (both) — all suppressible.

#### Renderer — `src/contextpad/renderer.ts`

HTML `<div>` overlay. Position = canvas bbox → D3 zoom transform → SVG `clientRect` offset.

```typescript
show(target, actions, config): void   // render buttons
hide(): void
reposition(transform: ZoomTransform): void  // RAF-throttled — called on every zoom/pan
```

#### Critical Rules

1. **HTML overlay, not SVG** — `position: absolute` div over the SVG wrapper parent
2. **Position always from D3 zoom transform** — never cache screen coordinates
3. **Hides on:** drag start, canvas click, `node:deleted`, `edge:deleted`, Escape
4. **`isVisible`/`isDisabled` called every render** — live engine state, never memoized
5. **Actions are stateless** — `(target, engine)` args only, never close over stale data
6. **Plugins can add AND remove** — `engine.unregisterContextAction()` is first-class API

#### Engine Methods

```typescript
engine.registerContextAction(action: ContextPadAction): void
engine.unregisterContextAction(id: string): void
engine.showContextPad(targetId: string, kind: 'node' | 'edge'): void
engine.hideContextPad(): void
engine.startConnectionFrom(nodeId: string): void
engine.beginLabelEdit(id: string, kind: 'node' | 'edge'): void
engine.duplicateNode(id: string): string

engine.on('contextpad:open',       ({ target }) => {})
engine.on('contextpad:close',      () => {})
engine.on('contextpad:action',     ({ actionId, target }) => {})
engine.on('contextpad:properties', ({ target }) => {})
```

#### Plugin Pattern

```typescript
engine.use({
  name: 'my-workflow-plugin',
  install(engine) {
    engine.registerContextAction({
      id: 'run-node', icon: `<svg>...</svg>`, tooltip: 'Run this step',
      targets: ['node'], appliesTo: ['http-request', 'script'],
      group: 'primary',
      handler:    (t, e) => e.setNodeStatus(t.id, 'running'),
      isDisabled: (t, e) => e.getNode(t.id)?.meta?.locked === true
    });
    engine.unregisterContextAction('duplicate');
  }
});
```

---

### L1 · Phase 4 — Swimlanes / Pools / Lanes ⬜

```typescript
engine.addNode({ type: 'pool', label: 'Order Process', orientation: 'horizontal' });
engine.addNode({ type: 'lane', label: 'Sales Team', parentId: 'pool-1' });
```

- `g.swimlanes` layer — below `g.placed-nodes`
- Child positions clamped to parent lane bounds during drag
- `SwimLaneRenderer` implements `ShapeRenderer`
- Cross-lane connection ports on swimlane boundary
- Validation rule: `no-orphan-swimlane`

---

### L1 · Phase 5 — BPMN Feature Parity ⬜

Bringing Zenode to full BPMN.js feature parity:

- **Copy/paste** — `engine.copyNodes()` / `engine.pasteNodes()` — Ctrl+C/V
- **Resize handles** — 8-point handles, snap to grid, ports recompute after resize
- **Node search** — `engine.search(query)` — searches label, type, meta
- **Node groups** — `engine.groupNodes()` / `engine.ungroupNodes()`
- **Color picker** — `change-color` context pad action, persisted in state
- **BPMN presets** — `@zenode/bpmn-presets` free package (events, tasks, gateways, containers)
- **Toon theme** — `themes/toon.css` — 2-hour effort, high marketing value

---

### L1 · Phase 6 — Full Public Designer API ⬜

**Node API**
```typescript
engine.addNode(config: NodeConfig): string
engine.removeNode(id: string): void
engine.updateNode(id: string, patch: Partial<NodeConfig>): void
engine.getNode(id: string): NodeData | null
engine.getAllNodes(): NodeData[]
engine.getNodesInViewport(): NodeData[]    // viewport culling for performance
engine.focusNode(id: string): void
engine.highlight(id: string, durationMs?: number): void
engine.duplicateNode(id: string): string
engine.copyNodes(ids: string[]): void
engine.pasteNodes(offset?): string[]
engine.groupNodes(ids: string[]): string
engine.ungroupNodes(groupId: string): void
engine.lock(): void
engine.unlock(): void
engine.setReadOnly(bool: boolean): void
```

**Edge API**
```typescript
engine.addEdge(config: EdgeConfig): string
engine.removeEdge(id: string): void
engine.getEdge(id: string): EdgeData | null
engine.getAllEdges(): EdgeData[]
engine.getPath(fromNodeId: string, toNodeId: string): string[]
```

**Live Node Status** *(Free — nobody else has this)*
```typescript
engine.setNodeStatus(id: string, status: 'idle'|'running'|'success'|'error'|'warning'): void
// running → animated pulse ring
// success → green checkmark badge
// error   → red border + shake
// warning → amber badge
```

**Validation** *(Free)*
```typescript
engine.addRule(rule: BuiltInRule | CustomRule): void
// built-ins: 'no-cycles', 'all-nodes-connected', 'single-entry-point',
//            'single-exit-point', 'max-depth', 'no-orphan-swimlane'
engine.validate(): ValidationResult  // { valid, errors, warnings }
```

**Canvas API**
```typescript
engine.clear(): void          engine.reset(): void
engine.zoomTo(level): void    engine.panTo(x, y): void
engine.fitToScreen(): void    engine.getViewport(): ViewportState
engine.search(query): NodeData[]
engine.setTheme(theme): void  // ← Pro
engine.enableMinimap(): void  // ← Pro
```

**Undo/Redo**
- Command pattern. `Ctrl+Z` / `Ctrl+Shift+Z`
- Free: 10 steps. Pro: up to 200.

**Events**
```typescript
engine.on('node:placed'|'node:moved'|'node:deleted'|'node:selected'|
          'node:click'|'node:doubleclick'|'node:config:change'|
          'edge:created'|'edge:deleted'|'workflow:change'|
          'validation:error'|'export:complete'|
          'contextpad:open'|'contextpad:close'|
          'contextpad:action'|'contextpad:properties'|
          'runtime:step'|'runtime:complete'|'runtime:error', handler)
engine.off(event, handler)
engine.once(event, handler)
```

---

## LAYER 2 — @zenode/serializer

*Converting designer state to every format that matters. Usable without the designer.*

---

### L2 · Phase 7 — Export / Import ⬜

```typescript
// JSON — round-trip perfect, versioned
engine.toJSON(): ZenodeState     // version: "1.0"
engine.fromJSON(state): void

// Formats (Free)
engine.toXML(): string           // generic workflow XML
engine.toMermaid(): string       // GitHub README ready
engine.toDOT(): string           // Graphviz
engine.toDSL(): string           // Zenode DSL, version-controllable

// BPMN 2.0 (Pro) — the enterprise unlock
engine.toBPMN(): string          // Camunda / Activiti compatible
engine.fromBPMN(xml): void       // import from any BPMN tool

// Image (Pro)
engine.toImage('png'|'svg'): Promise<Blob>
```

**Read-only viewer embed** — free, drives distribution:
```html
<script src="https://cdn.zenode.dev/zenode.min.js"></script>
<div id="diagram"></div>
<script>Zenode.render('#diagram', workflowJSON, { readOnly: true });</script>
```

**The round-trip:**
```
Editor ──toJSON()──▶ DB ──fromJSON()──▶ Viewer (read-only)
                       ──toBPMN()──────▶ Camunda/Activiti
                       ──toMermaid()───▶ GitHub README
                       ──createRuntime()▶ Server execution
```

---

## LAYER 3 — @zenode/runtime

*The feature that separates Zenode from every diagramming library.*
*The diagram IS the workflow logic. Change the diagram, change the behavior.*

---

### L3 · Phase 8 — Execution Runtime ⬜

```
Diagram JSON
    ↓ createRuntime({ resolvers, outputTransformer })
ExecutionGraph  (topological sort, port routing)
    ↓ runtime.execute(inputData)
StepRunner      (calls resolver per node, routes via port)
    ↓
ExecutionResult (per-node outputs, history, timing)
    ↓ outputTransformer(result)
Your output object
```

**Runtime API**
```typescript
const runtime = engine.createRuntime({
  resolvers: {
    'http-request': async (node, input) => {
      const res = await fetch(node.meta.url, { method: node.meta.method, body: JSON.stringify(input.data) });
      return { data: await res.json() };
    },
    'condition': (node, input) => ({
      port: evaluateExpression(node.meta.expression, input.data) ? 'true' : 'false',
      data: input.data
    }),
    'transform':  (node, input) => ({ data: applyMapping(node.meta.mapping, input.data) }),
    'send-email': async (node, input) => {
      await emailService.send({ to: node.meta.recipient, body: template(node.meta.template, input.data) });
      return { sent: true };
    },
  },
  hooks: {
    onStepStart:    (nodeId) => engine.setNodeStatus(nodeId, 'running'),
    onStepComplete: (nodeId) => engine.setNodeStatus(nodeId, 'success'),
    onStepError:    (nodeId) => engine.setNodeStatus(nodeId, 'error'),
  },
  timeout:  30000,
  maxSteps: 1000,   // infinite loop guard
});

const output = await runtime.execute({ userId: '123' });
```

**Diagram-as-Config** *(the core value proposition)*
```typescript
// Store diagram in DB. Load and run server-side without code changes.
// Business user changes the diagram → behavior changes. No deployments.
const def     = await db.workflows.findById(id);
const engine  = ZenodeRuntime.fromJSON(def.definition);
const runtime = engine.createRuntime({ resolvers: myResolvers });
const result  = await runtime.execute(triggerData);
```

**Runtime Types — `src/runtime/types.ts`**
```typescript
export interface RuntimeResolver {
  (node: NodeData, input: ResolverInput): Promise<ResolverOutput> | ResolverOutput;
}
export interface ResolverInput  { data: unknown; meta: Record<string, unknown>; context: ExecutionContext; }
export interface ResolverOutput { data: unknown; port?: string; error?: string; }
export interface ExecutionResult {
  finalStatus:  'success' | 'error' | 'timeout';
  finalOutput:  ResolverOutput | null;
  nodeHistory:  Array<{ id: string; type: string; input: unknown; output: unknown; ms: number }>;
  errors:       Array<{ nodeId: string; message: string }>;
  totalMs:      number;
}
export interface RuntimeConfig {
  resolvers:          Record<string, RuntimeResolver>;
  outputTransformer?: (result: ExecutionResult) => unknown;
  hooks?:             { onStepStart?(...): void; onStepComplete?(...): void; onStepError?(...): void; };
  timeout?:           number;
  maxSteps?:          number;
}
```

**Workflow Simulation / Step Runner** *(Pro)*
```typescript
const ctrl = engine.simulate(inputData?);
ctrl.step(); ctrl.play(delayMs); ctrl.pause(); ctrl.reset();
ctrl.on('step', ({ nodeId, inputData, outputData, port }) => {});
// Visual: active node → 'running', completed → 'success'
```

---

## LAYER 4 — @zenode/transformer

*User defines exactly what comes out. Zenode never imposes a schema.*

---

### L4 · Phase 9 — Output Transformation ⬜

```typescript
// The outputTransformer in RuntimeConfig IS Layer 4.
// It lives in @zenode/transformer as a standalone utility.

// Pattern 1: REST API response
outputTransformer: (r) => ({ ok: r.finalStatus === 'success', payload: r.finalOutput?.data, trace: r.nodeHistory.map(n=>n.id) })

// Pattern 2: Event sourcing
outputTransformer: (r) => r.nodeHistory.map(n => ({ event: `workflow.${n.type}.completed`, data: n.output }))

// Pattern 3: BPMN audit log
outputTransformer: (r) => ({ processId: workflowId, activities: r.nodeHistory.map(n => ({ activityId: n.id, status: 'completed' })) })

// Pattern 4: Pass-through
outputTransformer: (r) => r.finalOutput?.data
```

**Schema-Driven Property Panels** *(connects Layer 1 to Layer 4)*
```typescript
// Node declares what data it needs. Zenode auto-renders the form.
// Values → node.meta → available to resolvers at runtime.
{
  type: 'http-request',
  schema: {
    url:     { type: 'string',   required: true,  label: 'Endpoint URL' },
    method:  { type: 'select',   options: ['GET','POST','PUT','DELETE'] },
    headers: { type: 'keyvalue', label: 'Headers' },
    body:    { type: 'textarea', label: 'Request Body' },
    timeout: { type: 'number',   default: 5000 }
  }
}
// Opens via contextpad:properties event → auto-rendered panel.
// Emits node:config:change on every field change.
```

---

## 🏗 Architecture Rules

### TypeScript
- Strict mode. No `any`. JSDoc on all public methods. Barrel export from `src/types/index.ts`.
- `ZenodeEngine` = designer API. `ZenodeRuntime` = execution. Never mix them.

### D3.js Layer Order (strict)
```
1. g.swimlanes     (below everything)
2. g.grid
3. g.connections
4. g.placed-nodes
5. g.preview       (pointer-events: none always)
6. g.guides        (pointer-events: none always)
7. g.lasso
```
Context pad: HTML overlay, never in SVG stack.

### State
- `ZenodeEngine` owns designer state. `ZenodeRuntime` owns execution state. Spread never mutate.
- Emit typed events on every mutation.

### CSS Variables
```css
/* Canvas */      --zenode-canvas-bg  --zenode-grid-color
/* Nodes */       --zenode-node-bg  --zenode-node-border  --zenode-node-shadow
/* Interaction */ --zenode-selection-color  --zenode-guide-color  --zenode-port-color
/* Status */      --zenode-status-running  --zenode-status-success
                  --zenode-status-error    --zenode-status-warning
/* Edges */       --zenode-edge-color
/* Context Pad */ --zenode-contextpad-bg     --zenode-contextpad-border
                  --zenode-contextpad-radius  --zenode-contextpad-action-size
                  --zenode-contextpad-action-hover  --zenode-contextpad-action-active
                  --zenode-contextpad-danger  --zenode-contextpad-disabled
                  --zenode-contextpad-divider
/* Swimlanes */   --zenode-swimlane-bg  --zenode-swimlane-header-bg
                  --zenode-swimlane-border  --zenode-lane-divider
```

### Performance
- >500 nodes: `getNodesInViewport()` culling
- >1000 nodes: OffscreenCanvas for static background
- Guides + context pad: RAF-throttled
- Connection recalc: only affected connections on node move
- Runtime: async/await with timeout + maxSteps guard

---

## 📁 File Structure

```
zenode/
├── packages/
│   ├── designer/               ← @zenode/designer (Layer 1)
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── engine.ts
│   │   │   │   ├── canvas.ts
│   │   │   │   ├── grid.ts
│   │   │   │   ├── history.ts
│   │   │   │   └── license.ts
│   │   │   ├── nodes/
│   │   │   │   ├── registry.ts
│   │   │   │   ├── placement.ts
│   │   │   │   ├── selection.ts
│   │   │   │   ├── overlay.ts        # Uses renderer.getPath — NEVER plain rect
│   │   │   │   ├── resize.ts
│   │   │   │   ├── status.ts
│   │   │   │   ├── geometry/
│   │   │   │   │   └── rectanglePath.ts
│   │   │   │   └── shapes/
│   │   │   │       ├── rectangle.ts
│   │   │   │       ├── circle.ts
│   │   │   │       ├── rhombus.ts
│   │   │   │       ├── swimlane.ts
│   │   │   │       └── group.ts
│   │   │   ├── contextpad/
│   │   │   │   ├── registry.ts
│   │   │   │   ├── renderer.ts      # HTML overlay — position from D3 zoom transform
│   │   │   │   ├── defaults.ts
│   │   │   │   └── index.ts
│   │   │   ├── connections/
│   │   │   │   ├── manager.ts
│   │   │   │   ├── ports.ts
│   │   │   │   ├── drawing.ts
│   │   │   │   ├── markers.ts
│   │   │   │   └── paths/
│   │   │   │       ├── straight.ts
│   │   │   │       ├── curved.ts
│   │   │   │       ├── s-shaped.ts
│   │   │   │       └── l-bent.ts
│   │   │   ├── effects/
│   │   │   │   └── engine.ts
│   │   │   ├── validation/
│   │   │   │   ├── engine.ts
│   │   │   │   └── rules/
│   │   │   ├── plugins/
│   │   │   │   ├── manager.ts
│   │   │   │   ├── auto-layout.ts
│   │   │   │   ├── minimap.ts
│   │   │   │   └── collaboration.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts         # ALL designer interfaces
│   │   │   └── themes/
│   │   │       ├── dark.css
│   │   │       ├── light.css
│   │   │       └── toon.css
│   │   └── package.json
│   │
│   ├── serializer/             ← @zenode/serializer (Layer 2)
│   │   ├── src/
│   │   │   ├── json.ts
│   │   │   ├── xml.ts
│   │   │   ├── bpmn.ts        # Pro
│   │   │   ├── mermaid.ts
│   │   │   ├── dot.ts
│   │   │   ├── dsl.ts
│   │   │   └── image.ts       # Pro
│   │   └── package.json
│   │
│   ├── runtime/                ← @zenode/runtime (Layer 3)
│   │   ├── src/
│   │   │   ├── engine.ts      # ZenodeRuntime class
│   │   │   ├── executor.ts    # Step-by-step execution
│   │   │   ├── graph.ts       # Topological sort, port routing
│   │   │   ├── simulation.ts  # Pro — visual step-through
│   │   │   └── types.ts
│   │   └── package.json
│   │
│   ├── transformer/            ← @zenode/transformer (Layer 4)
│   │   ├── src/
│   │   │   ├── transformer.ts # outputTransformer factory
│   │   │   ├── schema.ts      # Schema-driven property panels
│   │   │   └── patterns.ts    # REST, event-sourcing, BPMN audit presets
│   │   └── package.json
│   │
│   ├── core/                   ← @zenode/core (all four layers)
│   │   ├── src/index.ts       # re-exports all four packages, pre-wired
│   │   └── package.json
│   │
│   └── bpmn-presets/           ← @zenode/bpmn-presets (free, always)
│       ├── src/
│       │   └── presets.ts     # start-event, task, gateway, pool etc.
│       └── package.json
│
├── examples/
│   ├── custom-shapes/
│   │   ├── hexagon.ts
│   │   └── star.ts
│   └── plugins/
│       ├── automation-plugin.ts     # adds 'run-node' context pad action
│       └── runtime/
│           ├── approval-workflow.ts # designer → execute → output
│           └── http-pipeline.ts
├── demo/                           # Layer 1 demo app (ship first)
├── tests/
├── pnpm-workspace.yaml             # monorepo
└── package.json
```

---

## 🧪 Before Writing Any Code — Ask These First

1. Does this mutate engine state? → Command pattern + emit event.
2. Does this render something? → D3 data join on the correct layer group.
3. Does this need to be undoable? → Yes if it changes nodes, connections, viewport, swimlane.
4. Is this a premium feature? → Gate via `LicenseManager.check('feature-name')`.
5. Does this need a config option? → Add to `src/types/index.ts` with typed default.
6. Does this change appearance? → `--zenode-*` CSS variables — never hardcoded.
7. Does this involve coordinates? → `d3.pointer(event, svgRoot)`, account for zoom transform.
8. Does this draw an overlay, ring, or port? → `registry.get(node.type).getPath(node)` — never plain rect.
9. Is this a new shape? → Implement full `ShapeRenderer`: `draw`, `getPath`, `getBounds`, `getPorts`.
10. Does this add a button near a node/edge? → `engine.registerContextAction()` — never hardcode.
11. Does this involve context pad position? → Always from D3 zoom transform — never cached screen coords.
12. Does this involve workflow execution? → `ZenodeRuntime` in `packages/runtime/` — never in `engine.ts`.
13. Does this transform execution output? → `outputTransformer` in `RuntimeConfig` — never in runtime core.
14. Is this a child of a swimlane? → Position clamped to parent bounds, ports recomputed after move.
15. Does this belong in a specific package? → Designer UI = `@zenode/designer`. Formats = `@zenode/serializer`. Execution = `@zenode/runtime`. Output = `@zenode/transformer`.

---

## 🗺 Master Build Order

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LAYER 1 — @zenode/designer  ← SHIP THIS FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ L1·P1  Core shapes (placement, drag, selection, effects, guides)
✅ L1·P2  Connections (ports, drawing, types, routing, labels, nav)
⬜ L1·P2+ Connection markers (arrowheads, animated flow)
🔧 L1·P3  Context Action Pad  ← IN PROGRESS
           └─ ContextPadRegistry + ContextPadRenderer (HTML overlay)
           └─ Default: delete, connect, edit-label, properties, duplicate, change-color
           └─ registerContextAction() / unregisterContextAction()
           └─ Position from D3 zoom transform, hides on drag/deselect/delete/Escape
           └─ Works for nodes AND edges
           └─ --zenode-contextpad-* CSS vars
⬜ L1·P4  Swimlanes (g.swimlanes layer, child clamping, cross-lane ports)
⬜ L1·P5  BPMN parity (copy/paste, resize handles, search, groups, presets, toon theme)
⬜ L1·P6  Full public API (status, validation, undo/redo, schema panels, DSL)

  ── @zenode/designer v0.1.0 LAUNCH ──
  └─ README + GIF + quick start
  └─ Live demo deployed
  └─ NPM publish
  └─ Show HN post        ← devto article #1: "Visual workflow designer, no framework needed"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LAYER 2 — @zenode/serializer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⬜ L2·P7  JSON, XML, Mermaid, DOT, DSL (Free)
           BPMN 2.0 (Pro)              ← devto article #2: "Export any diagram to BPMN 2.0"
           Read-only viewer embed (Free)
           Image export (Pro)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LAYER 3 — @zenode/runtime
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⬜ L3·P8  ZenodeRuntime (topo sort, step executor, resolver API, port routing)
           Execution hooks → setNodeStatus() visual sync
           Diagram-as-Config server-side pattern
           Simulation/step runner (Pro)
           BPMN XML execution from any source  ← devto article #3: "JS BPMN runtime"
           This article + HN post = acquisition interest starts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LAYER 4 — @zenode/transformer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⬜ L4·P9  outputTransformer factory + reference patterns
           Schema-driven property panels (node.meta → resolver input)
           Full round-trip demo: design → serialize → execute → transform

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SHIP @zenode/core
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⬜ @zenode/core bundle (all four layers, pre-wired)
⬜ Full demo app: designer + runtime demo + theme switcher (light/dark/toon)
⬜ zenode.min.js UMD (<120kb gzipped, iframe-safe)
⬜ Product Hunt launch  ← "The complete visual workflow ecosystem for JavaScript"
                          This is the moment. Four separate launch events built to this.
```

---

## 🧾 Context Snapshot — Source of Truth

### ✅ Confirmed implemented

- `ShapeRenderer` contract (`draw`, `getPath`, `getBounds`, `getPorts`) — `src/types/index.ts`
- `ShapeRegistry` — `src/nodes/registry.ts`
- Built-in renderers: `rectangle.ts`, `circle.ts`, `rhombus.ts`
- `engine.registerShape()` exposed
- Overlay via `renderer.getPath()` — `src/nodes/overlay.ts`
- Selection: single, lasso, Escape/Delete, keyboard shortcut callbacks
- Visual Effects: `VisualState`, `src/effects/engine.ts`, Glow + Stroke Flow + Gradient
- Alignment guides: `getBounds()`-aware, RAF-throttled
- `roundedRectPath()` — `src/nodes/geometry/rectanglePath.ts`
- `g.lasso` layer
- Connections: ports, drawing, straight/curved/s-shaped/l-bent, smart routing (Pro)
- Connection labels, inline edit
- Navigation controls: floating zoom/focus buttons

### 📌 Permanent Rules

1. All shape visuals through `ShapeRegistry` + `ShapeRenderer`.
2. Overlay/selection/lasso/ports always use `getPath`/`getBounds`/`getPorts`.
3. Geometry helpers in `src/nodes/geometry/` — `src/components/shapeTypes/` is deleted, never recreate.
4. `engine.registerShape()` is the only shape extension point.
5. `engine.registerContextAction()` is the only context pad extension point.
6. Context pad = HTML overlay only — position always from D3 zoom transform.
7. Effects via `effectsEngine.applyEffects()` after draw — never inside `ShapeRenderer.draw()`.
8. Execution in `packages/runtime/` — never in `packages/designer/`.
9. Output transformation in `RuntimeConfig.outputTransformer` — never in runtime core.
10. Config = canvas environment only. Nodes via `engine.addNode()`. Styles via presets.
11. Each package has its own `package.json`, README, and NPM page. They are independently installable.

---

*End of prompt.*
*Immediate focus: Complete L1·Phase 3 — Context Action Pad, then ship @zenode/designer v0.1.0.*
