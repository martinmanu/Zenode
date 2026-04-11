import type { ZenodeDiagramState, NodeData } from "@zenode/core";

/**
 * Maps Zenode shape types to Mermaid.js flowchart shape symbols.
 */
function mapShapeToMermaid(type: string): [string, string] {
  const t = type.toLowerCase();
  switch (t) {
    case 'rhombus':
    case 'decision':
      return ['{', '}']; // Decision
    case 'circle':
    case 'start':
    case 'end':
      return ['((', '))']; // Circle
    case 'oval':
    case 'pill':
      return ['([', '])']; // Stadium
    case 'hexagon':
      return ['{{', '}}']; // Hexagon
    case 'trapezoid':
      return ['[/', '\\]']; // Trapezoid
    case 'parallelogram':
      return ['[/', '/]']; // Parallelogram
    case 'step':
    case 'database':
      return ['[(', ')]']; // Cylinder
    case 'triangle':
      return ['>', ']']; // Asymmetric
    case 'rectangle':
    case 'task':
    default:
      return ['[', ']']; // Square
  }
}

/**
 * Extracts a readable label from NodeContent or Fallback ID.
 */
function getLabel(node: NodeData): string {
  if (node.content && node.content.items.length > 0) {
    const textItem = node.content.items.find(item => item.kind === 'text');
    if (textItem && textItem.value) {
      // Escape harmful characters for mermaid
      return textItem.value.replace(/"/g, '&quot;');
    }
  }
  return node.id;
}

/**
 * Converts ZenodeDiagramState to Mermaid Flowchart syntax.
 */
export function toMermaid(state: ZenodeDiagramState): string {
  // Allow diagram direction override via metadata, default to TD
  const direction = state.nodes?.[0]?.meta?.diagramDirection || 'TD';
  const lines: string[] = [`graph ${direction}`];

  // 1. Process Groups (Subgraphs)
  const groupNodes = state.nodes.filter(n => n.type === 'vgroup');
  const normalNodes = state.nodes.filter(n => n.type !== 'vgroup');
  
  const processedNodeIds = new Set();

  groupNodes.forEach(group => {
    lines.push(`    subgraph ${group.id}`);
    
    // Find nodes belonging to this group
    const childIds = group.meta?.nodeIds || [];
    normalNodes.forEach(node => {
        if (childIds.includes(node.id)) {
            const [start, end] = mapShapeToMermaid(node.type);
            const nodeLabel = getLabel(node);
            lines.push(`        ${node.id}${start}"${nodeLabel}"${end}`);
            processedNodeIds.add(node.id);
        }
    });
    lines.push(`    end`);
  });

  // 2. Process Remaining Nodes
  normalNodes.forEach(node => {
    if (!processedNodeIds.has(node.id)) {
        const [start, end] = mapShapeToMermaid(node.type);
        const label = getLabel(node);
        lines.push(`    ${node.id}${start}"${label}"${end}`);
    }
  });

  // 3. Process Edges
  state.edges.forEach(edge => {
    // If we have meta label on edge, we could use it here
    const label = edge.meta?.label ? `|${edge.meta.label}| ` : '';
    lines.push(`    ${edge.sourceNodeId} --> ${label}${edge.targetNodeId}`);
  });

  return lines.join('\n');
}
