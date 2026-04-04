import { ContextPadAction } from "../types/index.js";

export const defaultActions: ContextPadAction[] = [
  {
    id: "delete",
    icon: `<i data-lucide="trash-2" style="width:16px; height:16px;"></i>`,
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
      } else {
        engine.setSelectedEdgeIds([target.id]);
      }
      engine.deleteSelection();
    },
  },
  {
    id: "duplicate",
    icon: `<i data-lucide="copy" style="width:16px; height:16px;"></i>`,
    tooltip: "Duplicate",
    group: "primary",
    targets: ["node"],
    handler: (target, engine, event) => {
      if (target.kind === "node") {
          engine.duplicateNode(target.id);
      }
    },
  },
  {
    id: "edit-content",
    icon: `<i data-lucide="edit-3" style="width:16px; height:16px;"></i>`,
    tooltip: "Edit Content",
    group: "primary",
    targets: ["node"],
    handler: (target, engine, event) => {
      engine.emit("contextpad:edit-content", { target });
    },
  },
  {
    id: "connect",
    icon: `<i data-lucide="link-2" style="width:16px; height:16px;"></i>`,
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
    id: "rotate",
    icon: `<i data-lucide="rotate-cw" style="width:16px; height:16px;"></i>`,
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
    icon: `<i data-lucide="maximize-2" style="width:16px; height:16px;"></i>`,
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
  },
  {
    id: "style",
    icon: `<i data-lucide="palette" style="width:16px; height:16px;"></i>`,
    tooltip: "Change Style",
    group: "secondary",
    targets: ["node", "edge"],
    handler: (target, engine, event) => {
      engine.emit("contextpad:style", { target });
    },
  },
  {
    id: "bringToFront",
    icon: `<i data-lucide="arrow-up" style="width:16px; height:16px;"></i>`,
    tooltip: "Bring to Front",
    group: "secondary",
    targets: ["node"],
    handler: (target, engine, event) => {
      if (target.kind === "node") {
          engine.bringToFront([target.id]);
      }
    }
  },
  {
    id: "sendToBack",
    icon: `<i data-lucide="arrow-down" style="width:16px; height:16px;"></i>`,
    tooltip: "Send to Back",
    group: "secondary",
    targets: ["node"],
    handler: (target, engine, event) => {
      if (target.kind === "node") {
          engine.sendToBack([target.id]);
      }
    }
  }
];
