import { ContextPadAction } from "@zenode/core";

export const defaultActions: ContextPadAction[] = [
  {
    id: "delete",
    icon: `<i data-lucide="trash-2" style="width:16px; height:16px;"></i>`,
    tooltip: "Delete Node",
    group: "danger",
    targets: ["node", "edge", "group"],
    style: {
      color: "#ff453a",
      hoverColor: "rgba(255, 69, 58, 0.2)"
    },
    handler: (target, engine, event) => {
      if (target.kind === "node") {
        engine.setSelectedNodeIds([target.id]);
      } else if (target.kind === "edge") {
        engine.setSelectedEdgeIds([target.id]);
      } else {
        // Group: data is array of nodeIds
        engine.setSelectedNodeIds(target.data);
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
    targets: ["node", "group"],
    handler: (target, engine, event) => {
      const isEnabled = engine.isConnectionModeEnabled();
      engine.setConnectionModeEnabled(!isEnabled);
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
    targets: ["node"],
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
  },
  {
    id: "toggle-dashed",
    icon: `<i data-lucide="square-dashed" style="width:16px; height:16px;"></i>`,
    tooltip: "Toggle Dashed",
    group: "primary",
    targets: ["edge"],
    handler: (target, engine: any, event) => {
      if (target.kind === "edge") {
        engine.toggleConnectionStyle(target.id, 'dashed');
      }
    },
    isActive: (target, engine: any) => {
      const conn = engine.getConnections().find((c: any) => c.id === target.id);
      return conn?.dashed === true;
    }
  },
  {
    id: "toggle-animated",
    icon: `<i data-lucide="activity" style="width:16px; height:16px;"></i>`,
    tooltip: "Toggle Animation",
    group: "primary",
    targets: ["edge"],
    handler: (target, engine: any, event) => {
      if (target.kind === "edge") {
        engine.toggleConnectionStyle(target.id, 'animated');
      }
    },
    isActive: (target, engine: any) => {
      const conn = engine.getConnections().find((c: any) => c.id === target.id);
      return conn?.animated === true;
    },
    isVisible: (target, engine: any) => {
      if (target.kind !== "edge") return false;
      const conn = engine.getConnections().find((c: any) => c.id === target.id);
      return conn?.dashed === true;
    }
  },
  {
    id: "ungroup",
    icon: `<i data-lucide="ungroup" style="width:16px; height:16px;"></i>`,
    tooltip: "Ungroup",
    group: "primary",
    targets: ["group"],
    handler: (target, engine, event) => {
      engine.ungroupSelection();
    }
  }
];
