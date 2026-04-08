import type { ZenodeDiagramState } from "@zenode/core";

/**
 * Runtime type guard: checks if the value structurally matches a ZenodeDiagramState.
 */
export function isZenodeDiagramState(value: unknown): value is ZenodeDiagramState {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['version'] === 'string' &&
    Array.isArray(obj['nodes']) &&
    Array.isArray(obj['edges'])
  );
}

/**
 * Checks that a node data object has the minimum required fields.
 */
export function isValidNodeData(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj['id'] === 'string' && typeof obj['type'] === 'string';
}

/**
 * Checks that an edge data object has the minimum required fields.
 */
export function isValidEdgeData(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['id'] === 'string' &&
    typeof obj['sourceNodeId'] === 'string' &&
    typeof obj['targetNodeId'] === 'string'
  );
}
