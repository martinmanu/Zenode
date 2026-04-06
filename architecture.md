# Zenode Architecture (Monorepo Ecosystem)

Zenode is designed as an ecosystem. The engine and serialization services are completely decoupled through a lightweight Shared Contract Layer (`@zenode/core`), allowing each part of the project to evolve independently and enabling the creation of third-party plugins without heavy dependencies.

## Ecosystem Structure

```mermaid
graph TD;
    Core[@zenode/core] --> Designer[@zenode/designer]
    Core --> Serializer[@zenode/serializer]
    Core -.-> ThirdPartyPlugin[@zenode/plugin-custom]
```

### 1. `@zenode/core` (The Contract Layer)
* **Location:** `packages/core/`
* **Purpose:** Contains all TypeScript interfaces, types, and the `ZenodeDiagramState` definition.
* **Rules:**
  - **No Logic:** This package contains NO runtime code or logic.
  - **Strict Versioning:** Treated as a public API. Breaking changes to interfaces require a major version bump, as the entire ecosystem relies on this contract.
  - **Dependencies:** None.

### 2. `@zenode/designer` (The Core Engine)
* **Location:** `packages/designer/`
* **Purpose:** The high-performance WebGL/SVG diagramming engine responsible for the user interface, interaction events, layout calculations, and rendering.
* **Rules:**
  - **State Decoupling:** Emits and imports pure JSON state defined by `@zenode/core` via `getDiagramState()`.

### 3. `@zenode/serializer` (Export / Transform)
* **Location:** `packages/serializer/`
* **Purpose:** A suite of pure, side-effect-free functions that convert `ZenodeDiagramState` into standard portable formats (JSON, BPMN, XML, Mermaid).
* **Rules:**
  - **Pure Transformations:** Functions like `toJSON()` must be pure mathematical transformations (Input -> Output) without ever importing internal logic from the designer.

## Getting Started

1. Install dependencies: `pnpm install`
2. Build the ecosystem: `pnpm run build`
3. Start the dev server: `pnpm run dev`
