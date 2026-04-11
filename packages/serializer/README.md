# @zenode/serializer
**The universal data exchange layer for the Zenode ecosystem.**

This package provides pure, side-effect-free functions to transform Zenode Diagram States into portable formats. It is designed to be completely decoupled from the rendering engine.

[![npm version](https://img.shields.io/npm/v/@zenode/serializer?style=flat-square&color=4A90E2)](https://www.npmjs.com/package/@zenode/serializer)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square)](https://www.typescriptlang.org/)

---

## 💎 Pure Design Principles
*   **State-Independent**: Consumes raw JSON objects; does not require a DOM or a running engine.
*   **Contract-First**: Built strictly on the `@zenode/core` state definition.
*   **Zero Engine Dependencies**: Perfect for server-side processing or CLI tools.
*   **Versioned**: Built-in support for diagram state versioning (`version: "1.0"`).

---

## 🚀 Installation
```bash
npm install @zenode/serializer
```

## 🛠 Usage
```javascript
import { toJSON, fromJSON } from '@zenode/serializer';

// 1. Export pure state to JSON string
const jsonString = toJSON(diagramState);

// 2. Restore state from JSON string
const restoredState = fromJSON(jsonString);
```

## 🗺️ Supported Formats
*   **YAML**: Clean, human-readable state serialization (full fidelity).
*   **DOT (Graphviz)**: Standard graph representation for structural analysis.
*   **Mermaid**: Convert visual flows into Mermaid flowchart scripts.
*   **BPMN 2.0**: Standard compliant XML exports for business-process industrial compatibility.
*   **Generic XML**: Simple, schema-based interchange format.
*   **Zenode DSL**: Lightweight, arrow-based custom syntax (e.g. `start -> task1 -> end`).
*   **SVG/Image**: (In progress) Pure vector export for documentation.

---

## 🌟 Support Zenode
If you find this project useful, **please consider [leaving a Star](https://github.com/martinmanu/Zenode/stargazers) on [GitHub!](https://github.com/martinmanu/Zenode)** ⭐

---

<div align="center">

**Part of the Zenode Ecosystem Architecture.**  
[<u>GitHub</u>](https://github.com/martinmanu/Zenode)

</div>
