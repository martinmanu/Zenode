<div align="center">
  <img src="../../assets/demo.svg" width="100%" alt="Zenode Ecosystem Preview">
</div>

<div align="center">

# Zenode
**The complete, high-performance diagramming ecosystem for the modern web.**

`zenode` is the unified entry point for the entire Zenode ecosystem. It bundles the high-performance **Designer Engine** and the powerful **Serialization Layer** into a single, convenient package.

[![npm version](https://img.shields.io/npm/v/zenode?style=flat-square&color=4A90E2)](https://www.npmjs.com/package/zenode)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square)](https://www.typescriptlang.org/)

[**Live Demo →**](https://zenode-designer.vercel.app) · [**Report Bug →**](https://github.com/martinmanu/Zenode/issues)

</div>

---

## 📦 What's Included?
By installing `zenode`, you get access to the full modular stack:
- **`@zenode/designer`**: The D3.js powered visual engine.
- **`@zenode/serializer`**: High-fidelity export/import (JSON, BPMN, Mermaid).
- **`@zenode/core`**: The shared contract layer (Types & Interfaces).

---

## 🚀 Quick Start
```bash
npm install zenode
```

### Initialization
```javascript
import { Zenode, toJSON, fromJSON } from 'zenode';

// 1. Initialize the Engine
Zenode.initializeCanvas('#container', {
  canvasProperties: {
    snapToGrid: true
  }
});

// 2. Create nodes
Zenode.addNode({ type: 'rectangle', x: 100, y: 100 });

// 3. Export the result to a portable JSON format
const state = Zenode.getDiagramState();
const json = toJSON(state); 
```

---

## 🏗 modular Architecture
Zenode is built on a "Contract-First" philosophy. If you only need specific parts to keep your bundle size small, you can install them individually:

| Package | Purpose | Use Case |
|---|---|---|
| **`@zenode/designer`** | Visual Engine | Adding a canvas to your app. |
| **`@zenode/serializer`** | Data Exchange | File conversion or CLI tools. |
| **`@zenode/core`** | Shared Contracts | Building custom plugins. |

---

## 🌟 Support Zenode
If you find this project useful, **please consider [leaving a Star](https://github.com/martinmanu/Zenode/stargazers) on [GitHub!](https://github.com/martinmanu/Zenode)** ⭐

---

<div align="center">

**Built with D3.js · TypeScript · Monorepo Ecosystem Architecture.**
[<u>GitHub</u>](https://github.com/martinmanu/Zenode)

</div>
