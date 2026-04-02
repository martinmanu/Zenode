# Zenode Engine Public API Reference

The Zenode Engine is a high-performance, D3.js-powered diagramming library. This reference documented the Layer 1 (Core) APIs available for node management, viewport control, and data serialization.

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

## 3. Data Serialization & Export

| API | Description | Usage Example |
|---|---|---|
| `toXML()` | Exports current state as a Zenode XML string. | `const xml = Zenode.toXML()` |
| `fromXML(xmlString)` | Restores the canvas from a Zenode XML string. | `Zenode.fromXML(myXml)` |
| `toMermaid()` | Generates a Mermaid.js flowchart script. | `console.log(Zenode.toMermaid())` |
| `toDOT()` | Generates a Graphviz/DOT language script. | `const dot = Zenode.toDOT()` |
| `validate()` | Runs structural validation (cycles, orphans). | `const result = Zenode.validate()` |

## 4. Visual Feedback & Status

| API | Description | Usage Example |
|---|---|---|
| `setNodeStatus(id, type)` | Triggers visual cues (`running`, `success`, `error`). | `engine.setNodeStatus('n1', 'error')` |
| `updateNodeContent(id, cnt)` | Sets text, icons, and layout for a node. | `Zenode.updateNodeContent('n1', { items: [...] })` |
| `highlight(id, opts?)` | Pulses a node with target behavior/color. | `engine.highlight('n1', { color: '#ff0000', duration: 3000 })` |

---

> [!TIP]
> **Deterministic IDs**: If you provide an `id` in `addNode(config)`, the engine will use it strictly. If not, it will return a UUID which you should store for future `updateNode` calls.
