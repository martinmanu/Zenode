import type { ZenodeDiagramState } from "@zenode/core";
import { validateState } from "../core/validator.js";

/**
 * Serializes Zenode state to DOT (Graphviz) format.
 * Focuses on structural connectivity and labels.
 */
export function toDOT(state: ZenodeDiagramState): string {
  const result = validateState(state);
  if (!result.valid) {
    throw new Error(`[zenode/serializer] Invalid state:\n  - ${result.errors.join('\n  - ')}`);
  }

  const lines: string[] = ["digraph ZenodeWorkflow {"];
  
  // Settings for better default look
  lines.push('  rankdir=LR;');
  lines.push('  node [shape=rect, style=rounded];');

  // Node declarations
  state.nodes.forEach(node => {
    const label = node.content?.items?.find(i => i.kind === 'text')?.value || node.id;
    // We store 'type' in attributes to assist round-tripping
    lines.push(`  "${node.id}" [label="${label}", type="${node.type}"];`);
  });

  // Edge declarations
  state.edges.forEach(edge => {
    const label = edge.meta?.label || "";
    const labelAttr = label ? ` [label="${label}"]` : "";
    lines.push(`  "${edge.sourceNodeId}" -> "${edge.targetNodeId}"${labelAttr};`);
  });

  lines.push("}");
  return lines.join("\n");
}

/**
 * Bare-bones DOT parser for "node [attr]" and "source -> target" patterns.
 * Supports basic attribute parsing for labels and custom 'type' field.
 */
export function fromDOT(input: string): ZenodeDiagramState {
  const state: ZenodeDiagramState = {
    version: "1.0",
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 }
  };

  const lines = input.split('\n');
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('digraph') || trimmed === '}' || trimmed.startsWith('rankdir') || trimmed.startsWith('node [')) return;

    // 1. Edge match: "node1" -> "node2" [label="..."]
    const edgeMatch = trimmed.match(/"?([^" \[\->]+)"?\s*->\s*"?([^" \[]+)"?(?:\s*\[(.*)\])?/);
    if (edgeMatch) {
      const sourceId = edgeMatch[1];
      const targetId = edgeMatch[2];
      const attrs = edgeMatch[3] || "";
      const labelMatch = attrs.match(/label="([^"]+)"/);
      
      state.edges.push({
        id: `edge_${index}`,
        sourceNodeId: sourceId,
        sourcePortId: 'right',
        targetNodeId: targetId,
        targetPortId: 'left',
        meta: labelMatch ? { label: labelMatch[1] } : {}
      });
      return;
    }

    // 2. Node match: "node1" [label="..." type="..."]
    const nodeMatch = trimmed.match(/"?([^" \[]+)"?\s*\[(.*)\]/);
    if (nodeMatch) {
      const id = nodeMatch[1];
      const attrs = nodeMatch[2];
      const labelMatch = attrs.match(/label="([^"]+)"/);
      const typeMatch = attrs.match(/type="([^"]+)"/);
      
      state.nodes.push({
        id,
        type: typeMatch ? typeMatch[1] : 'rectangle',
        shapeVariantId: 'default',
        x: state.nodes.length * 150, // basic auto-layout
        y: 100,
        content: {
          layout: 'text-only',
          items: [{ kind: 'text', value: labelMatch ? labelMatch[1] : id }]
        }
      });
      return;
    }
  });

  return state;
}
