import type { ZenodeDiagramState } from "@zenode/core";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates the integrity of a ZenodeDiagramState.
 * Checks for versioning, required fields, and dangling connections.
 */
export function validateState(state: ZenodeDiagramState): ValidationResult {
  const errors: string[] = [];

  // 1. Version Check
  if (!state.version) {
    errors.push("State is missing mandatory 'version' field.");
  } else if (state.version !== "1.0") {
    errors.push(`Unsupported state version: ${state.version}. Expected "1.0".`);
  }

  // 2. Structural Requirements
  if (!Array.isArray(state.nodes)) {
    errors.push("Nodes property must be an array.");
  }
  if (!Array.isArray(state.edges)) {
    errors.push("Edges property must be an array.");
  }

  // 3. ID Consistency & Dangling Edges
  const nodeIds = new Set(state.nodes?.map((n) => n.id) || []);

  state.edges?.forEach((edge, index) => {
    if (!edge.sourceNodeId || !nodeIds.has(edge.sourceNodeId)) {
      errors.push(`Edge[${index}] (${edge.id || 'unknown'}): sourceNodeId '${edge.sourceNodeId}' does not exist.`);
    }
    if (!edge.targetNodeId || !nodeIds.has(edge.targetNodeId)) {
      errors.push(`Edge[${index}] (${edge.id || 'unknown'}): targetNodeId '${edge.targetNodeId}' does not exist.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
