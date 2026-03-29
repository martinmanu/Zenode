import { KeyboardShortcuts } from "../model/configurationModel";

/**
 * Reusable example for plugin-style keyboard shortcut handling.
 *
 * Usage:
 * 1) Copy this object into your own config.
 * 2) Attach under: canvasProperties.keyboardShortcuts
 * 3) Replace console logs with your app/plugin actions.
 */
export const keyboardShortcutsExample: KeyboardShortcuts = {
  enabled: true,
  deleteSelection: ["Delete", "Backspace"],
  clearSelection: ["Escape"],
  customBindings: {
    "selection:clear": ["Ctrl+D"],
    "canvas:log-state": ["Ctrl+Shift+L"],
  },
  callbacks: {
    onDeleteSelection: ({ selectedNodeIds }) => {
      console.log("[keys] delete selection", selectedNodeIds);
      // Return false if you want to fully prevent default engine deletion.
      // return false;
    },
    onClearSelection: () => {
      console.log("[keys] clear selection");
    },
    custom: {
      "selection:clear": ({ engine }) => {
        (engine as { clearSelection?: () => void }).clearSelection?.();
      },
      "canvas:log-state": ({ engine }) => {
        const nodes = (engine as { getPlacedNodes?: () => unknown[] }).getPlacedNodes?.() ?? [];
        console.log("[keys] nodes on canvas:", nodes.length);
      },
    },
  },
};
