const defaultActions = [
    {
        id: "delete",
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 0h6"/></svg>`,
        tooltip: "Delete Node",
        group: "danger",
        targets: ["node", "edge"],
        style: {
            color: "#ff453a",
            hoverColor: "rgba(255, 69, 58, 0.2)"
        },
        handler: (target, engine, event) => {
            if (target.kind === "node") {
                engine.setSelectedNodeIds([target.id]);
            }
            else {
                engine.setSelectedEdgeIds([target.id]);
            }
            engine.deleteSelection();
        },
    },
    {
        id: "edit-content",
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
        tooltip: "Edit Content",
        group: "primary",
        targets: ["node"],
        handler: (target, engine, event) => {
            engine.emit("contextpad:edit-content", { target });
        },
    },
    {
        id: "connect",
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
        tooltip: "Connect",
        group: "primary",
        targets: ["node"],
        handler: (target, engine, event) => {
            if (target.kind === "node") {
                const isEnabled = engine.isConnectionModeEnabled();
                engine.setConnectionModeEnabled(!isEnabled);
            }
        },
        isActive: (target, engine) => {
            return engine.isConnectionModeEnabled();
        }
    },
    {
        id: "settings",
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
        tooltip: "Visual Settings",
        group: "secondary",
        targets: ["node"],
        handler: (target, engine, event) => {
            engine.emit("contextpad:settings", { target });
            // Default fallback if no listener: update visual state
            engine.updateNodeVisualState(target.id, { status: "running" });
        }
    },
    {
        id: "rotate",
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>`,
        tooltip: "Toggle Rotation Mode",
        group: "secondary",
        targets: ["node"],
        handler: (target, engine, event) => {
            if (target.kind === "node") {
                const isEnabled = engine.isRotationModeEnabled();
                engine.setRotationModeEnabled(!isEnabled);
            }
        },
        isActive: (target, engine) => {
            return engine.isRotationModeEnabled();
        }
    },
    {
        id: "reshape",
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`,
        tooltip: "Toggle Resize Mode",
        group: "secondary",
        targets: ["node"],
        handler: (target, engine, event) => {
            if (target.kind === "node") {
                const isEnabled = engine.isResizeModeEnabled();
                engine.setResizeModeEnabled(!isEnabled);
            }
        },
        isActive: (target, engine) => {
            return engine.isResizeModeEnabled();
        }
    }
];

export { defaultActions };
//# sourceMappingURL=defaults.js.map
