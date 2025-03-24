| **Phase**                         | **Duration (Weeks)** | **Total Estimated Time (Weeks)**         |
|-----------------------------------|----------------------|------------------------------------------|
| Phase 1: Foundation & Core        | 1–2                  | 2                                        |
| Phase 2: Predefined Shapes        | 2–3                  | 3                                        |
| Phase 3: Connections              | 2–3                  | 3                                        |
| Phase 4: Drag and Drop            | 2–3                  | 3                                        |
| Phase 5: JSON-Driven Config       | 2                    | 2                                        |
| Phase 6: Plugin System            | 2–3                  | 3                                        |
| Phase 7: Testing & Documentation  | 2                    | 2                                        |
| Phase 8: Advanced Features        | 3–4                  | 4                                        |
| **Total**                         |                      | **22 weeks (approx. 5–6 months)**        |


zenode/
└── src/
    ├── core/
    │   ├── Zenode.ts           // Main core class that sets up the D3 canvas and base API.
    │   └── index.ts            // Re-export files from core for easier importing.
    ├── components/
    │   ├── Shape.ts            // Base interface/class for shapes.
    │   ├── Rectangle.ts        // Predefined rectangle shape implementation.
    │   ├── Connector.ts        // Connector component (different styles will be handled here).
    │   └── index.ts            // Re-export components.
    ├── plugins/
    │   ├── PluginManager.ts    // Manages plugin registration and execution.
    │   ├── IPlugin.ts          // Interface defining a plugin contract.
    │   └── index.ts            // Re-export plugins-related items.
    ├── utils/
    │   ├── domUtils.ts         // Helper functions for DOM manipulations.
    │   ├── mathUtils.ts        // Helper functions (e.g., for calculating paths, connectors).
    │   └── index.ts            // Re-export utils.
    └── index.ts                // Main entry point for the library (re-exports core, components, plugins, and utils).
