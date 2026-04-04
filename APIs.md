# Zenode Engine Public API Reference

The Zenode Engine is a high-performance, D3.js-powered diagramming library. This reference documents the Layer 1 (Core) APIs available for node management, viewport control, and JSON-based persistence.

## 1. Core Lifecycle & Configuration

| API | Description | Usage Example |
|---|---|---|
| `initializeCanvas(selector, config)` | Starts the engine in the target DOM element. | `Zenode.initializeCanvas('#canvas', { ... })` |
| `updateConfig(config)` | Dynamically updates engine settings. | `Zenode.updateConfig({ grid: { visible: false } })` |
| `resizeCanvas(w, h)` | Updates canvas dimensions (e.g., on window resize). | `Zenode.resizeCanvas(window.innerWidth, 600)` |
| `clear()` | Wipes all nodes and edges from the workspace. | `Zenode.clear()` |
| `getDiagramState()` | Returns a JSON snapshot of nodes, edges, and viewport. | `const state = Zenode.getDiagramState()` |

## 2. Node & Edge Management

| API | Description | Usage Example |
|---|---|---|
| `addNode(config)` | Adds a node. Returns the generated or provided ID. | `const id = Zenode.addNode({ type: 'rectangle', x: 50, y: 50 })` |
| `removeNode(id)` | Deletes a node and its connections. | `Zenode.removeNode('n1')` |
| `updateNode(id, patch)` | Updates node data (position, meta). | `Zenode.updateNode('n1', { x: 200 })` |
| `addEdge(config)` | Creates a connection. Supports `type` override. | `Zenode.addEdge({ sourceNodeId: 'n1', targetNodeId: 'n2', type: 's-shaped' })` |
| `duplicateNode(id)` | Clones a node and its content. | `Zenode.duplicateNode('n1')` |
| `focusNode(id, opts?)` | Animates the viewport to focus on a node. | `Zenode.focusNode('n1', { zoom: 1.5, duration: 500 })` |
| `groupSelection()` | Encapsulates selection within a 'group' node. | `Zenode.groupSelection()` |
| `ungroupSelection()` | Breaks apart selected groups. | `Zenode.ungroupSelection()` |
| `bringToFront(ids)` | Moves nodes to top layer. | `Zenode.bringToFront(['n1'])` |
| `sendToBack(ids)` | Moves nodes to bottom layer. | `Zenode.sendToBack(['n1'])` |

## 3. Data Serialization & Export

| API | Description | Usage Example |
|---|---|---|
| `validate()` | Runs structural validation (cycles, orphans). | `const result = Zenode.validate()` |

## 4. Visual Feedback & Status

| API | Description | Usage Example |
|---|---|---|
| `setNodeStatus(id, type)` | Triggers visual cues (`running`, `success`, `error`). | `engine.setNodeStatus('n1', 'error')` |
| `updateNodeContent(id, cnt)` | Sets text, icons, and layout for a node. | `Zenode.updateNodeContent('n1', { items: [...] })` |
| `highlight(id, opts?)` | Pulses a node with target behavior/color. | `engine.highlight('n1', { color: '#ff0000', duration: 3000 })` |

## 5. Placement & Interaction

| API | Description | Usage Example |
|---|---|---|
| `placeShapeAt(type, id, x, y)` | Immediately places a shape at exact canvas coordinates. | `engine.placeShapeAt('circle', 'c1', 100, 200)` |
| `placeShapeAtSafePos(type, id)` | Finds the nearest non-overlapping spot in viewport to place a shape. | `engine.placeShapeAtSafePos('rectangle', 'r1')` |
| `handleDrop(event)` | Native DND handler: parses drop data and places shape at mouse. | `container.ondrop = (e) => Zenode.handleDrop(e)` |
| `startPlacement(type, id, data?)` | Enters placement mode with a ghost preview. | `engine.startPlacement('rectangle', 'task0')` |
| `cancelPlacement()` | Aborts placement mode and removes preview. | `engine.cancelPlacement()` |

---

> [!TIP]
> **Deterministic IDs**: If you provide an `id` in `addNode(config)`, the engine will use it strictly. If not, it will return a UUID which you should store for future `updateNode` calls.
