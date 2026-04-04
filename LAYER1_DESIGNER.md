# Zenode Designer (Layer 1) — Scope & Responsibilities

## Purpose
Layer 1 is the visual canvas engine. It is responsible for rendering, interaction, and in-memory state management.

---

## ✅ Responsibilities

### Core Canvas
- Node placement
- Drag & drop
- Selection & multi-selection (lasso)
- Keyboard shortcuts
- Infinite canvas (zoom + pan)

### Rendering System
- ShapeRenderer contract
- D3 layer architecture
- Overlays via getPath()
- Ports via getPorts()

### Connections
- Port-based connections
- Connection types (straight, curved, s-shaped, l-bent)
- Ghost connection preview
- Connection labels

### Interaction UX
- Alignment guides
- Snap to grid
- Context action pad
- Node duplication & deletion

### Visual System
- Node status (running, success, error)
- Effects engine (glow, animation, gradient)
- CSS variable theming

### Public API
- Node & Edge APIs
- Canvas controls (zoom, pan, focus)
- Event system
- Plugin system

### Persistence (Allowed)
- toJSON()
- fromJSON()

---

## ❌ Not Allowed in Layer 1

- XML / BPMN export
- Mermaid / DOT export
- DSL parsing
- Workflow execution
- Data transformation

---

## Output

- Interactive visual canvas
- JSON state only
