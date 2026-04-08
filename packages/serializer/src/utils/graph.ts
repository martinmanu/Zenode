import type { ZenodeDiagramState, NodeData, EdgeData } from "@zenode/core";

/**
 * Returns the set of node IDs that have at least one outgoing edge.
 */
export function getSourceNodes(state: ZenodeDiagramState): Set<string> {
  return new Set(state.edges.map(e => e.sourceNodeId));
}

/**
 * Returns the set of node IDs that have at least one incoming edge.
 */
export function getTargetNodes(state: ZenodeDiagramState): Set<string> {
  return new Set(state.edges.map(e => e.targetNodeId));
}

/**
 * Returns all edges that are connected to a given node ID (in or out).
 */
export function getEdgesForNode(state: ZenodeDiagramState, nodeId: string): EdgeData[] {
  return state.edges.filter(e => e.sourceNodeId === nodeId || e.targetNodeId === nodeId);
}

/**
 * Returns nodes that have no incoming edges (entry points / roots).
 */
export function getRootNodes(state: ZenodeDiagramState): NodeData[] {
  const targets = getTargetNodes(state);
  return state.nodes.filter(n => !targets.has(n.id));
}

/**
 * Returns nodes that have no outgoing edges (terminal / leaf nodes).
 */
export function getLeafNodes(state: ZenodeDiagramState): NodeData[] {
  const sources = getSourceNodes(state);
  return state.nodes.filter(n => !sources.has(n.id));
}

/**
 * Returns nodes that are completely disconnected from the graph.
 */
export function getOrphanNodes(state: ZenodeDiagramState): NodeData[] {
  const sources = getSourceNodes(state);
  const targets = getTargetNodes(state);
  return state.nodes.filter(n => !sources.has(n.id) && !targets.has(n.id));
}
