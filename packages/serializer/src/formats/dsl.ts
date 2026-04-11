import type { ZenodeDiagramState } from "@zenode/core";
import { validateState } from "../core/validator.js";

/**
 * Serializes Zenode state to a minimal Zenode DSL.
 * Focuses on structural flow and readability.
 */
export function toDSL(state: ZenodeDiagramState): string {
  const result = validateState(state);
  if (!result.valid) {
    throw new Error(`[zenode/serializer] Invalid state:\n  - ${result.errors.join('\n  - ')}`);
  }

  const lines: string[] = [];
  state.edges.forEach(edge => {
    const label = edge.meta?.label || "";
    const labelStr = label ? ` [${label}]` : "";
    lines.push(`${edge.sourceNodeId} -> ${edge.targetNodeId}${labelStr}`);
  });
  
  return lines.join("\n");
}

/**
 * Parses a minimal Zenode DSL.
 * Supports:
 *   a -> b -> c
 *   a -> b [label]
 */
export function fromDSL(input: string): ZenodeDiagramState {
  const state: ZenodeDiagramState = {
    version: "1.0",
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 }
  };

  const nodeIds = new Set<string>();

  const ensureNode = (id: string) => {
    if (!nodeIds.has(id)) {
      state.nodes.push({
        id,
        type: 'rectangle',
        shapeVariantId: 'default',
        x: state.nodes.length * 150,
        y: 100,
        content: {
          layout: 'text-only',
          items: [{ kind: 'text', value: id }]
        }
      });
      nodeIds.add(id);
    }
  };

  const lines = input.split('\n');
  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return;

    // Pattern: segment1 -> segment2 -> segment3 [label]
    const segments = trimmed.split(/\s*->\s*/);
    
    for (let i = 0; i < segments.length - 1; i++) {
      let source = segments[i].trim();
      let target = segments[i + 1].trim();
      let label = "";

      // Check if target has a label like "target [label]"
      const labelMatch = target.match(/^(\w+)\s*\[([^\]]+)\]$/);
      if (labelMatch) {
        target = labelMatch[1];
        label = labelMatch[2];
      }

      // Cleanup source in case it was a previous target with a label
      source = source.replace(/\[[^\]]+\]/, "").trim();

      ensureNode(source);
      ensureNode(target);

      state.edges.push({
        id: `dsl_edge_${lineIdx}_${i}`,
        sourceNodeId: source,
        sourcePortId: 'right',
        targetNodeId: target,
        targetPortId: 'left',
        meta: label ? { label } : {}
      });
    }
  });

  return state;
}
