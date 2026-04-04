# Zenode Layer 1 Completion Criteria

Layer 1 is considered COMPLETE when the canvas is production-ready,
extensible, and independent from execution or serialization logic.

---

## ✅ Must Be Completed

### Core Features
- Node placement, drag, selection
- Multi-select & lasso
- Infinite canvas (zoom + pan)

### Connections
- All connection types working
- Labels & editing
- Smooth interaction

### UX & Interaction
- Alignment guides
- Snap to grid
- Context pad fully functional

### Visual System
- Node status system
- Effects engine stable
- CSS theming

### API Stability
- Public API finalized
- Event system stable
- Plugin system usable

### Persistence
- toJSON / fromJSON
- Versioned schema

---

## ⬜ Required Before Moving to Layer 2

- Undo / Redo system
- Copy / Paste
- Resize handles
- Property panel (schema-driven)
- Plugin examples

---

## 🚫 Must NOT Exist

- XML / BPMN export
- Mermaid / DOT export
- Runtime execution
- DSL parsing

---

## ✅ Definition of Done

Layer 1 is complete when:

- Developers can build full diagrams visually
- Extend via plugins
- Save/load via JSON
- Use it independently without other layers
