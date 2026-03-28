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
  draw: (g: D3Selection, config: ResolvedShapeConfig, theme: ThemeConfig) => void;
  getPath: (config: ResolvedShapeConfig) => string;
  getBounds: (config: ResolvedShapeConfig) => BoundingBox;
  getPorts: (config: ResolvedShapeConfig) => PortMap;
}

export interface BoundingBox {
  x: number; y: number; width: number; height: number;
}

export interface PortMap {
  top:    { x: number; y: number };
  bottom: { x: number; y: number };
  left:   { x: number; y: number };
  right:  { x: number; y: number };
  center: { x: number; y: number };
  [key: string]: { x: number; y: number };
}
```

### The Shape Registry

```typescript
// src/nodes/registry.ts
export class ShapeRegistry {
  private renderers = new Map<string, ShapeRenderer>();
  register(name: string, renderer: ShapeRenderer): void { ... }
  get(name: string): ShapeRenderer { ... }
  has(name: string): boolean { ... }
  list(): string[] { ... }
}
// Engine boot:
registry.register('rectangle', RectangleRenderer);
registry.register('circle',    CircleRenderer);
registry.register('rhombus',   RhombusRenderer);
```

### How the Overlay MUST Be Drawn

```typescript
// ❌ WRONG
g.append('rect').attr('width', node.width).attr('height', node.height);

// ✅ CORRECT
const renderer = registry.get(node.type);
g.append('path')
  .attr('d', renderer.getPath(node))
  .attr('fill', 'none')
  .attr('stroke', overlayColor)
  .attr('pointer-events', 'none'); // ← always none on overlays
```

### Built-in Rectangle Renderer — Reference Implementation

```typescript
export const RectangleRenderer: ShapeRenderer = {
  draw(g, config, theme) {
    g.append('path').attr('d', this.getPath(config))
      .attr('fill', config.color)
      .attr('stroke', config.stroke.color)
      .attr('stroke-width', config.stroke.width)
      .attr('stroke-dasharray', config.stroke.strokeDasharray.join(','));
  },
  getPath(config) {
    const { x, y, width, height, borderRadius } = config;
    const tl = borderRadius?.leftTop ?? 0, tr = borderRadius?.rightTop ?? 0;
    const bl = borderRadius?.leftBottom ?? 0, br = borderRadius?.rightBottom ?? 0;
    return [
      `M ${x+tl} ${y}`, `H ${x+width-tr}`, `Q ${x+width} ${y} ${x+width} ${y+tr}`,
      `V ${y+height-br}`, `Q ${x+width} ${y+height} ${x+width-br} ${y+height}`,
      `H ${x+bl}`, `Q ${x} ${y+height} ${x} ${y+height-bl}`,
      `V ${y+tl}`, `Q ${x} ${y} ${x+tl} ${y}`, 'Z'
    ].join(' ');
  },
  getBounds(config) {
    return { x: config.x, y: config.y, width: config.width, height: config.height };
  },
  getPorts(config) {
    const { x, y, width, height } = config;
    return {
      top: { x: x+width/2, y }, bottom: { x: x+width/2, y: y+height },
      left: { x, y: y+height/2 }, right: { x: x+width, y: y+height/2 },
      center: { x: x+width/2, y: y+height/2 }
    };
  }
};
```

### Developer-Facing Custom Shape API

```typescript
engine.registerShape('hexagon', {
  draw(g, config, theme) { g.append('path').attr('d', this.getPath(config))... },
  getPath(config) { /* hexagon math returning SVG path string */ },
  getBounds(config) { return { x: config.x, y: config.y, width: config.width, height: config.height }; },
  getPorts(config) { /* port anchors */ }
});
// Overlay, selection, ports, lasso, export all work with zero extra code.
```

### SVG String Shortcut

```typescript
engine.registerShape('star', {
  svg: `<path d="M 50,0 L 61,35 ..." fill="{{color}}" stroke="{{stroke.color}}" />`,
  viewBox: '0 0 100 100'
  // Engine handles scaling, {{token}} replacement, getPath derivation
});
```

### Plugin System

```typescript
export interface ZenodePlugin {
  name: string;
  install(engine: ZenodeEngine): void;
}
engine.use(MyPlugin);
// Built-ins: AutoLayoutPlugin, ExportPlugin, MinimapPlugin, CollaborationPlugin
```

> **Key principle:** Plugin support is not a Phase 3 feature. It is the natural result of building the internal registry correctly in Phase 1. `engine.registerShape()` and `engine.use()` public IS the plugin system.

---

## 🚧 Full Roadmap — Work Through Phases In Order

---

### PHASE 1 — Core Shape Lifecycle

**1.1 — Shape Placement [DONE]**
- `mouseClick` transitions preview → placed state.
- Placed shapes in `placedNodes[]`, each with `id`, `type`, `x`, `y`, `width`, `height`, `meta: {}`.
- Rendered in `g.placed-nodes` layer.

**1.2 — Drag & Drop [DONE]**
- D3 drag on placed nodes with grid snapping.
- Alignment hints during drag.
- Position updated in engine state on drag end.

> ⚠️ **Known Bug Checklist:**
> - Alignment guides persisting → clear `g.guides` on `dragend`
> - Wrong anchor points → use `d3.pointer(event, svgRoot)` not `event.x/y`
> - State mutation → always spread: `{...node, x, y}`
> - Guide layer intercepting events → `pointer-events: none` on `g.guides` and `g.preview`

**1.3 — Selection & Multi-Selection [DONE]**
- Single click selects (overlay via `renderer.getPath()`).
- Canvas click deselects all.
- Lasso multi-select via `getBounds()`.
- `Escape` clears, `Delete`/`Backspace` deletes selected.
- Keyboard shortcuts configurable via `canvasProperties.keyboardShortcuts`.

**1.3 Extension — Visual Effects System [DONE]**

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
- `src/effects/engine.ts` — `applyEffects(g, path, visualState)`
- Called after every `renderer.draw(...)` and edge draw.
- Implements: Glow (SVG filter), Stroke Flow (dash animation), Gradient Progress (edges only).
- `engine.updateNodeVisualState(id, patch)` / `engine.updateEdgeVisualState(id, patch)`.
- **Rule:** `ShapeRenderer = geometry`, `EffectsEngine = visuals`. Never mix them.

**1.4 — Alignment Guides [DONE]**
- Edge + center alignment detection during drag via `ShapeRenderer.getBounds()`.
- `requestAnimationFrame` throttled, immediate cleanup on drag end.
- Config: `alignmentLines.alignmentThreshold`, `edgeGuides.*`, `centerGuides.*`.

---

### PHASE 2 — Connections System

**2.1 — Connector Anchors (Ports) [COMPLETED]**
- Ports: `top`, `bottom`, `left`, `right`, `center` via `renderer.getPorts()`.
- Rendered as small circles on hover (`r=5`, `--zenode-port-color`).
- Cursor changes to `crosshair` on port hover.
- Port positions recompute on node move.

**2.2 — Drawing Connections [COMPLETED]**
- Click + drag from port initiates a connection.
- Live ghost connector line follows mouse.
- Drop on target port finalises → stored in `ZenodeEngine.connections[]`.

**2.3 — Connector Types [COMPLETED]**
- `straight`: direct line.
- `curved`: cubic bezier, handles from port direction.
- `s-shaped`: S-curve bezier.
- `l-bent`: orthogonal L-shaped.

**2.4 — Smart routing (Pro) [COMPLETED]**
- Implement basic obstacle avoidance so connections navigate around nodes.
- Gated via `LicenseManager`.

**2.5 — Connection Labels [COMPLETED]**
- Optional text label at midpoint.
- Styled as a professional "pill" background for readability.

**2.6 — Context Action Pad [COMPLETED]**
- Implement Context Action Pad for quick actions on nodes/connections.

**2.7 — Navigation Controls [COMPLETED]**
- Floating zoom in/out and focus buttons.
- Smooth D3 transitions for navigation.

---

### PHASE 2.6 — Context Action Pad *(Foundation Layer)*

> The **Context Action Pad** is a floating toolbar that appears near a selected node or connection — modelled after BPMN.js's context pad. It is one of the most visible UX features of a professional diagramming tool and must be built as a fully extensible, plugin-driven system from day one. Both nodes and edges/connections get a pad.

#### What It Is

When a node or edge is selected (or hovered, configurable), a small floating action toolbar appears near it. Each button triggers an action. The pad is rendered as an **absolutely-positioned HTML overlay** (never inside the SVG), so buttons can use standard HTML/CSS for icons and tooltips.

```
  ┌──┬──┬──┬──┬──┐
  │🗑│⚡│✏️│⚙│➕│   ← Context Action Pad (HTML overlay)
  └──┴──┴──┴──┴──┘
        │
  ╔══════════════╗
  ║  Node/Edge   ║
  ╚══════════════╝
```

#### Core Types — Add to `src/types/index.ts`

```typescript
// The target the pad is attached to
export type ContextPadTarget =
  | { kind: 'node'; id: string; data: NodeData }
  | { kind: 'edge'; id: string; data: EdgeData };

// A single action button in the pad
export interface ContextPadAction {
  /** Unique key, e.g. 'delete', 'connect', 'edit-label' */
  id: string;

  /** Icon: inline SVG string, emoji, or HTML string */
  icon: string;

  /** Tooltip shown on hover */
  tooltip: string;

  /**
   * Which target kinds this action applies to.
   * Omit to apply to both nodes and edges.
   */
  targets?: Array<'node' | 'edge'>;

  /**
   * Which node/edge type values this applies to.
   * Omit to apply to all types.
   * e.g. ['http-request', 'script'] limits to those node types only.
   */
  appliesTo?: string[];

  /**
   * Visual group for clustering related actions.
   * Actions in the same group render together, separated from other groups by a divider.
   * Default: 'primary'
   */
  group?: 'primary' | 'secondary' | 'danger' | string;

  /** Called when the action button is clicked */
  handler: (target: ContextPadTarget, engine: ZenodeEngine) => void;

  /**
   * Return false to hide this action for a specific target at runtime.
   * Called on every pad render — reflects current state, not registration-time state.
   */
  isVisible?: (target: ContextPadTarget, engine: ZenodeEngine) => boolean;

  /**
   * Return true to render the action as disabled (greyed, not clickable).
   * Called on every pad render.
   */
  isDisabled?: (target: ContextPadTarget, engine: ZenodeEngine) => boolean;
}

// Added to canvasProperties in config model
export interface ContextPadConfig {
  /** Whether the pad is shown at all. Default: true */
  enabled: boolean;

  /** Show on hover or only when selected. Default: 'select' */
  trigger: 'hover' | 'select';

  /** Pixel offset from anchor corner. Default: { x: 8, y: -8 } */
  offset: { x: number; y: number };

  /** Which corner of the node the pad anchors to. Default: 'top-right' */
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

  /** Whether default built-in actions are shown. Default: true */
  showDefaults: boolean;

  /**
   * List of default action IDs to hide even when showDefaults is true.
   * e.g. ['duplicate'] to remove the duplicate button globally.
   */
  suppressDefaults?: string[];
}
```

#### The Context Pad Registry — `src/contextpad/registry.ts`

```typescript
export class ContextPadRegistry {
  private actions = new Map<string, ContextPadAction>();

  /** Register a new action. Overwrites existing if same id. */
  register(action: ContextPadAction): void {
    this.actions.set(action.id, action);
  }

  /** Remove a registered action by id (used by plugins to suppress defaults) */
  unregister(id: string): void {
    this.actions.delete(id);
  }

  /**
   * Get all actions applicable for a given target.
   * Filters by targets, appliesTo, and isVisible.
   * Returns sorted by group so related actions cluster together.
   */
  getActionsFor(target: ContextPadTarget, engine: ZenodeEngine): ContextPadAction[] {
    return [...this.actions.values()]
      .filter(a => {
        if (a.targets && !a.targets.includes(target.kind)) return false;
        if (a.appliesTo) {
          const type = target.kind === 'node' ? target.data.type : target.data.type;
          if (!a.appliesTo.includes(type)) return false;
        }
        if (a.isVisible && !a.isVisible(target, engine)) return false;
        return true;
      })
      .sort((a, b) => (a.group ?? 'primary').localeCompare(b.group ?? 'primary'));
  }
}
```

#### Default Built-In Actions — `src/contextpad/defaults.ts`

These are registered automatically at engine boot. All can be suppressed via config:

```typescript
export const DefaultContextPadActions: ContextPadAction[] = [
  {
    id: 'delete',
    icon: `<svg viewBox="0 0 16 16"><!-- trash icon --></svg>`,
    tooltip: 'Delete',
    group: 'danger',
    handler(target, engine) {
      if (target.kind === 'node') engine.removeNode(target.id);
      if (target.kind === 'edge') engine.removeEdge(target.id);
    }
  },
  {
    id: 'connect',
    icon: `<svg viewBox="0 0 16 16"><!-- arrow icon --></svg>`,
    tooltip: 'Draw connection from here',
    targets: ['node'],         // nodes only — edges cannot be source of a new connection
    group: 'primary',
    handler(target, engine) {
      engine.startConnectionFrom(target.id); // enters ghost-line draw mode
    }
  },
  {
    id: 'edit-label',
    icon: `<svg viewBox="0 0 16 16"><!-- pencil icon --></svg>`,
    tooltip: 'Edit label',
    group: 'primary',
    handler(target, engine) {
      engine.beginLabelEdit(target.id, target.kind);
    }
  },
  {
    id: 'properties',
    icon: `<svg viewBox="0 0 16 16"><!-- wrench icon --></svg>`,
    tooltip: 'Properties',
    group: 'secondary',
    handler(target, engine) {
      engine.emit('contextpad:properties', { target });
      // Consumer listens to this event and opens their own panel
    }
  },
  {
    id: 'duplicate',
    icon: `<svg viewBox="0 0 16 16"><!-- copy icon --></svg>`,
    tooltip: 'Duplicate',
    targets: ['node'],         // duplication is node-only
    group: 'secondary',
    handler(target, engine) {
      engine.duplicateNode(target.id);
    }
  }
];
```

#### The Context Pad Renderer — `src/contextpad/renderer.ts`

The pad is rendered as an **HTML `<div>` overlay** positioned by converting canvas coordinates to screen coordinates using the current D3 zoom transform:

```typescript
export class ContextPadRenderer {
  private container: HTMLElement; // position:absolute div overlaid on the SVG wrapper

  /**
   * Show the pad for a target.
   * Steps:
   * 1. Get node/edge bounding box in canvas (SVG) coordinates
   * 2. Apply active D3 zoom transform: screen = k * canvas + translate
   * 3. Add SVG element's getBoundingClientRect() offset
   * 4. Apply config offset and position anchor
   * 5. Render action buttons as <button> elements
   * 6. Attach click handlers
   */
  show(target: ContextPadTarget, actions: ContextPadAction[], config: ContextPadConfig): void { ... }

  hide(): void { /* empty and hide overlay */ }

  /**
   * Reposition the pad without re-rendering buttons.
   * Must be called on every D3 zoom/pan event.
   * Throttle with requestAnimationFrame.
   */
  reposition(transform: ZoomTransform, config: ContextPadConfig): void { ... }
}
```

#### Critical Implementation Rules for the Pad

1. **HTML overlay, not SVG** — the pad container is `position: absolute` inside the same wrapper div that contains the SVG. Never append pad buttons into the SVG.
2. **Position always derived from D3 zoom transform** — on every zoom/pan event, call `renderer.reposition(transform)`. Never cache screen coordinates.
3. **Hide on drag start** — listen for drag start events and call `renderer.hide()`. The pad must never be visible while a node is being dragged.
4. **Hide on deselect** — when `node:deselected` or canvas click fires, hide the pad.
5. **Hide when target is deleted** — listen for `node:deleted` / `edge:deleted` and auto-hide.
6. **`pointer-events: none` is NOT set on the pad** — it must receive clicks.
7. **`isVisible` and `isDisabled` are called on every render** — they reflect live engine state, not registration-time state. Do not memoize.
8. **Actions are stateless** — handlers receive `(target, engine)` and must get all context from those arguments. Never close over stale node data.

#### Engine Integration — New Methods

```typescript
// Register a custom action in the context pad
engine.registerContextAction(action: ContextPadAction): void

// Remove a context pad action by id (plugins can remove defaults)
engine.unregisterContextAction(id: string): void

// Programmatically show/hide the pad
engine.showContextPad(targetId: string, kind: 'node' | 'edge'): void
engine.hideContextPad(): void

// New internal methods needed by default actions:
engine.startConnectionFrom(nodeId: string): void  // enters ghost-line mode
engine.beginLabelEdit(id: string, kind: 'node' | 'edge'): void
engine.duplicateNode(id: string): string           // returns new node id

// New events
engine.on('contextpad:open',       ({ target }) => {})
engine.on('contextpad:close',      () => {})
engine.on('contextpad:action',     ({ actionId, target }) => {})
engine.on('contextpad:properties', ({ target }) => {})
```

#### Config Integration

```typescript
// In canvasProperties (config model + merger + defaults):
canvasProperties: {
  contextPad: {
    enabled: true,
    trigger: 'select',              // 'hover' | 'select'
    position: 'top-right',
    offset: { x: 8, y: -8 },
    showDefaults: true,
    suppressDefaults: []            // e.g. ['duplicate', 'properties']
  }
}
```

#### Plugin Extension Pattern

This is how a plugin adds custom actions to the pad:

```typescript
// Example: adds a "Run this step" action for automation workflow tools
const AutomationPlugin: ZenodePlugin = {
  name: 'automation',
  install(engine) {

    engine.registerContextAction({
      id: 'run-node',
      icon: `<svg viewBox="0 0 16 16"><polygon points="3,2 13,8 3,14" fill="currentColor"/></svg>`,
      tooltip: 'Run this step',
      targets: ['node'],
      appliesTo: ['http-request', 'script', 'transform'],
      group: 'primary',
      handler(target, engine) {
        engine.setNodeStatus(target.id, 'running');
        // trigger execution logic...
      },
      isDisabled(target, engine) {
        return engine.getNode(target.id)?.meta?.locked === true;
      }
    });

    // Optionally remove a default action that doesn't fit this use case
    engine.unregisterContextAction('duplicate');
  }
};

engine.use(AutomationPlugin);
```

#### CSS Variables for Pad Theming

```css
--zenode-contextpad-bg              /* pad background */
--zenode-contextpad-border          /* pad border */
--zenode-contextpad-radius          /* pad corner radius */
--zenode-contextpad-action-size     /* button size (default: 28px) */
--zenode-contextpad-action-hover    /* button hover background */
--zenode-contextpad-action-active   /* button active/pressed background */
--zenode-contextpad-danger          /* danger group action color */
--zenode-contextpad-disabled        /* disabled action opacity */
--zenode-contextpad-divider         /* divider between groups */
```

---

### PHASE 3 — Public API Surface (Plug-and-Play)

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
engine.toJSON(): ZenodeState          engine.fromJSON(state): void
engine.toXML(): string
engine.toBPMN(): string               engine.fromBPMN(xml): void   // ← Pro
engine.toMermaid(): string            engine.toDOT(): string
engine.toImage(format: 'png' | 'svg'): Promise<Blob>               // ← Pro
```

**3.6 — Canvas / Viewport API**
```typescript
engine.clear(): void          engine.reset(): void
engine.zoomTo(level): void    engine.panTo(x, y): void
engine.fitToScreen(): void    engine.getViewport(): ViewportState
engine.setTheme(theme): void  // ← Pro
engine.enableMinimap(): void  // ← Pro
```

**3.7 — Event API**
```typescript
engine.on('node:placed' | 'node:moved' | 'node:deleted' | 'node:selected' |
          'node:click' | 'node:doubleclick' | 'edge:created' | 'edge:deleted' |
          'workflow:change' | 'validation:error' | 'export:complete' |
          'contextpad:open' | 'contextpad:close' | 'contextpad:action' |
          'contextpad:properties', handler)
engine.off(event, handler)
engine.once(event, handler)
// All handlers receive: { nodeId?, edgeId?, data, event, engine }
```

---

### PHASE 4 — Unique Differentiator Features

**4.1 — Schema-Driven Node Property Panels**
```typescript
{
  type: 'http-request',
  schema: {
    url:     { type: 'string',   required: true },
    method:  { type: 'select',   options: ['GET','POST','PUT','DELETE'] },
    headers: { type: 'keyvalue' },
    body:    { type: 'textarea' }
  }
}
```
Auto-renders property panel on node select. Values in `node.meta`. Emits `node:config:change`.

**4.2 — Workflow Simulation / Step Runner** *(Pro)*
```typescript
const ctrl = engine.simulate(inputData?);
ctrl.step(); ctrl.play(delayMs); ctrl.pause(); ctrl.reset();
ctrl.on('step', ({ nodeId, inputData, outputData }) => {});
```

**4.3 — Declarative Workflow DSL** *(experimental)*
```typescript
zenode.define(`START → [validate] → { valid: [pay] → END, invalid: [notify] → END }`)
engine.toDSL()
```

---

### PHASE 5 — Customisation & Extensibility

**5.1** — `engine.registerShape(name, renderer)` — already wired in Phase 1, just expose it.

**5.2** — Per-node event callbacks: `onClick`, `onDoubleClick`, `onHover`, `onDragEnd`, `onDelete`, `onConnect` in JSON config.

**5.3** — Plugin system: `engine.use(plugin)` — ship reference plugins:
- `AutoLayoutPlugin` — Dagre / force-directed
- `ExportPlugin` — PNG / SVG / JSON
- `MinimapPlugin` — Pro
- `CollaborationPlugin` — Pro/Team

---

### PHASE 6 — Persistence & State

**6.1** — `engine.toJSON()` / `engine.fromJSON()` — versioned (`version: "1.0"`).

**6.2** — `engine.toImage('png' | 'svg')` *(Pro)* via `canvg`.

**6.3** — Undo/Redo — command pattern. Free: 10 steps. Pro: up to 200.

---

### PHASE 7 — Demo App & Embeddable Widget

**7.1 — Demo App** (Vite + TS or React)
- Left sidebar: shape palette
- Top toolbar: connector type, export, undo/redo, zoom, validate, simulate
- Canvas: full engine instance with context pad visible and interactive
- Right panel: schema-driven property inspector (opens via `contextpad:properties` event)
- Bottom bar: validation status, node/edge count, zoom level
- Dark dev-tool aesthetic (Figma / Linear / VS Code)

**7.2 — Embeddable Widget**
- `zenode.min.js` UMD — `window.Zenode`, `new Zenode.Engine('#id', config)`
- Under 120kb gzipped. Works in sandboxed iframe (`allow-scripts`).

---

## 🏗 Architecture & Engineering Rules

### TypeScript
- Strict mode. No `any`. All public methods have JSDoc. Barrel export from `src/types/index.ts`.

### D3.js Patterns
- Always `.data().join()` — never manually append/remove.
- Layer order (strict): `g.grid` → `g.connections` → `g.placed-nodes` → `g.preview` → `g.guides` → `g.lasso`
- `pointer-events: none` on `g.guides` and `g.preview` always.
- Always `d3.pointer(event, svgRoot)` for coordinates.
- **Context pad is HTML overlay, not in the SVG layer stack.**

### State Management
- `ZenodeEngine` owns all mutable state. Spread, never mutate. Emit typed events on every mutation.

### CSS / Theming
```css
--zenode-selection-color        --zenode-guide-color
--zenode-port-color             --zenode-status-running
--zenode-status-success         --zenode-status-error
--zenode-status-warning         --zenode-node-bg
--zenode-node-border            --zenode-edge-color
--zenode-canvas-bg              --zenode-grid-color
--zenode-contextpad-bg          --zenode-contextpad-border
--zenode-contextpad-radius      --zenode-contextpad-action-size
--zenode-contextpad-action-hover --zenode-contextpad-action-active
--zenode-contextpad-danger      --zenode-contextpad-disabled
--zenode-contextpad-divider
```

### Testing
- Unit: config merger, state export/import, connector path math, command history, validation rules, context pad registry filtering (`getActionsFor` with various target types).
- Integration: node placement, drag, connection creation, status updates, context pad trigger + action execution, plugin action registration.
- Target: >70% coverage on core engine logic.

### Performance
- >500 nodes: OffscreenCanvas for background elements.
- Alignment guides: RAF-throttled.
- Connection path recalc: only affected connections on node move.
- Context pad reposition: RAF-throttled on every zoom/pan event.

---

## 💰 Monetisation-Ready Architecture

- `LicenseManager` gates: smart routing, auto-layout, PNG export, BPMN export, undo >10 steps, simulation, collaboration, minimap, custom themes.
- Optional `telemetry` config for anonymous usage events.
- Multi-instance safe. iframe-embeddable.

---

## 📁 File Structure

```
zenode/
├── src/
│   ├── core/
│   │   ├── engine.ts           # ZenodeEngine — full public API
│   │   ├── canvas.ts
│   │   ├── grid.ts
│   │   ├── history.ts
│   │   └── license.ts
│   ├── nodes/
│   │   ├── registry.ts         # ShapeRegistry
│   │   ├── placement.ts
│   │   ├── selection.ts        # Uses renderer.getBounds
│   │   ├── overlay.ts          # Uses renderer.getPath — NEVER plain rect
│   │   ├── status.ts
│   │   ├── geometry/
│   │   │   └── rectanglePath.ts
│   │   └── shapes/
│   │       ├── rectangle.ts    # Implements ShapeRenderer
│   │       ├── circle.ts
│   │       └── rhombus.ts
│   ├── contextpad/             # ← Phase 2.6
│   │   ├── registry.ts         # ContextPadRegistry
│   │   ├── renderer.ts         # HTML overlay — position from D3 zoom transform
│   │   ├── defaults.ts         # delete, connect, edit-label, properties, duplicate
│   │   └── index.ts
│   ├── connections/
│   │   ├── manager.ts
│   │   ├── ports.ts            # Uses renderer.getPorts
│   │   ├── drawing.ts
│   │   └── paths/
│   │       ├── straight.ts
│   │       ├── curved.ts
│   │       ├── s-shaped.ts
│   │       └── l-bent.ts
│   ├── effects/
│   │   └── engine.ts           # applyEffects(g, path, visualState)
│   ├── validation/
│   │   ├── engine.ts
│   │   └── rules/
│   │       ├── no-cycles.ts
│   │       ├── all-connected.ts
│   │       └── entry-exit.ts
│   ├── export/
│   │   ├── json.ts
│   │   ├── xml.ts
│   │   ├── bpmn.ts             # Pro
│   │   ├── mermaid.ts
│   │   ├── dot.ts
│   │   └── image.ts            # Pro
│   ├── simulation/
│   │   └── runner.ts           # Pro
│   ├── schema/
│   │   └── panel.ts
│   ├── plugins/
│   │   ├── manager.ts
│   │   ├── auto-layout.ts
│   │   ├── export.ts
│   │   ├── minimap.ts
│   │   └── collaboration.ts    # Pro/Team
│   ├── state/
│   │   ├── export.ts
│   │   └── schema.ts
│   ├── types/
│   │   └── index.ts            # ALL interfaces:
│   │                           #   ShapeRenderer, PortMap, BoundingBox
│   │                           #   ContextPadAction, ContextPadTarget, ContextPadConfig
│   │                           #   VisualState, ZenodePlugin, NodeData, EdgeData, ...
│   └── themes/
│       ├── dark.css
│       └── light.css
├── examples/
│   ├── custom-shapes/
│   │   ├── hexagon.ts
│   │   └── star.ts
│   └── plugins/
│       ├── my-shapes-plugin.ts
│       └── automation-plugin.ts  # Adds 'run-node' context pad action
├── demo/
├── tests/
├── vite.config.ts
├── vite.widget.config.ts
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
7. Does this involve coordinates? → `d3.pointer(event, svgRoot)`, account for zoom transform.
8. Does this draw an overlay, selection ring, or port? → `registry.get(node.type).getPath(node)` — never plain rect/circle.
9. Is this a new shape? → Must implement full `ShapeRenderer`: `draw`, `getPath`, `getBounds`, `getPorts`.
10. Does this add a button or action near a node or edge? → `engine.registerContextAction()` — never hardcode into the renderer.
11. Does this involve the context pad position? → Always derive from current D3 zoom transform — never cache screen coordinates.

---

## 🗺 Build Priority Order

```
✅ Phase 1.1  Shape placement
✅ Phase 1.2  Drag & drop
             └── ShapeRenderer interface + ShapeRegistry
             └── Rectangle/Circle/Rhombus implement ShapeRenderer
             └── Overlay uses renderer.getPath()
✅ Phase 1.3  Selection & multi-selection (renderer.getBounds + getPath)
             └── Visual Effects System (Glow, Stroke Flow, Gradient Progress)
             └── VisualState type + effects/engine.ts
✅ Phase 1.4  Alignment guides (renderer-bounds-aware, RAF-throttled)
✅ Phase 2.1  Connector ports (renderer.getPorts — works for all shapes)
✅ Phase 2.2  Drawing connections
✅ Phase 2.3  Connector types (straight, curved, s-shaped, l-bent)
✅ Phase 2.4  Smart routing (Pro)
✅ Phase 2.5 — Connection labels & Configs
 (inline edit)
✅ Phase 2.6  Context Action Pad
             └── ContextPadAction + ContextPadTarget + ContextPadConfig types
             └── ContextPadRegistry in src/contextpad/registry.ts
             └── ContextPadRenderer in src/contextpad/renderer.ts (HTML overlay)
             └── Default actions: delete, connect, edit-label, properties, duplicate
             └── engine.registerContextAction() / unregisterContextAction()
             └── Position derived from D3 zoom transform — never cached screen coords
             └── Hides on: drag start, deselect, target deleted, Escape
             └── Config: contextPad.enabled/trigger/position/offset/suppressDefaults
             └── Events: contextpad:open/close/action/properties
             └── Works for both nodes AND edges
             └── CSS variables: --zenode-contextpad-* namespace
⬜ Phase 3    Full public API surface
⬜ Phase 3.1  engine.registerShape() + engine.use(plugin) — expose existing registry
⬜ Phase 3.3  Live node status system  ← devto article #1
⬜ Phase 3.4  Validation engine        ← devto article #2
⬜ Phase 3.5  XML / Mermaid / DOT export
⬜ Phase 4.1  Schema-driven property panels (opens via contextpad:properties event)
⬜ Phase 5    Plugin system — AutoLayout + Export + example automation-plugin
⬜ Phase 6.1  JSON state export/import
⬜ Phase 6.3  Undo / Redo
⬜ Phase 3.5  BPMN export (Pro)        ← devto article #3, enterprise hook
⬜ Phase 4.2  Simulation / step runner (Pro)
⬜ Phase 6.2  Image export (Pro)
⬜ Phase 7    Demo app + embeddable widget
```

---

## 🧾 Context Management — Latest Implementation Snapshot

Use this as **source of truth** when starting a new coding session.

### ✅ Implemented in code

- `ShapeRenderer` contract in `Zenode/src/types/index.ts` (`draw`, `getPath`, `getBounds`, `getPorts`).
- `ShapeRegistry` in `Zenode/src/nodes/registry.ts`.
- Built-in renderers: `rectangle.ts`, `circle.ts`, `rhombus.ts` — all implement `ShapeRenderer`.
- `engine.registerShape(name, renderer)` in `Zenode/src/core/engine.ts`.
- Placed-node rendering via registry lookup in `Zenode/src/nodes/placement.ts`.
- Selection overlay via `renderer.getPath()` in `Zenode/src/nodes/overlay.ts`.
- Phase 1.3 selection: single select, canvas deselect, lasso multi-select, delete, Escape.
- Keyboard shortcut config: `canvasProperties.keyboardShortcuts` with configurable bindings + callbacks.
- Phase 1.3 Visual Effects: `VisualState` type, `src/effects/engine.ts`, Glow + Stroke Flow + Gradient Progress.
- Phase 1.4 alignment guides: edge + center detection, `getBounds()`-aware, RAF-throttled, config-driven styling.
- Geometry utilities: `roundedRectPath()` in `Zenode/src/nodes/geometry/rectanglePath.ts`.
- Legacy `src/components/shapeTypes/*` removed — do NOT recreate.
- Lasso layer `g.lasso` in `src/components/canvas/canvas.ts`.

### ✅ Example: custom keybinding callbacks

```ts
canvasProperties: {
  keyboardShortcuts: {
    enabled: true,
    deleteSelection: ['Delete', 'Backspace'],
    clearSelection: ['Escape'],
    customBindings: { 'canvas:log-state': ['Ctrl+Shift+L'] },
    callbacks: {
      onDeleteSelection: ({ selectedNodeIds }) => { /* return false to stop default */ },
      custom: {
        'canvas:log-state': ({ engine }) => {
          console.log('nodes:', (engine as any).getPlacedNodes?.().length ?? 0)
        }
      }
    }
  }
}
```

### 📌 Rules for future changes

1. All shape visuals through `ShapeRegistry` + `ShapeRenderer`.
2. Overlay/selection/lasso/ports use renderer geometry (`getPath`/`getBounds`/`getPorts`).
3. New geometry helpers in `src/nodes/geometry/`, not `src/components/shapeTypes/`.
4. `engine.registerShape()` is the single shape extension point.
5. `engine.registerContextAction()` is the single context pad extension point.
6. Context pad is always **HTML overlay** — never SVG — positioned from D3 zoom transform.
7. Effects (glow, animation) always applied via `effectsEngine.applyEffects()` after draw — never inside `ShapeRenderer.draw()`.

---

*End of prompt. Currently working on: Phase 2.1 — Connector ports using `renderer.getPorts()`.*