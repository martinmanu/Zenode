import type { ZenodeDiagramState } from "@zenode/core";
import { validateState } from "../core/validator.js";

/**
 * Serializes a ZenodeDiagramState to a formatted JSON string.
 * Validates state integrity before serializing.
 */
export function toJSON(state: ZenodeDiagramState): string {
  const result = validateState(state);
  if (!result.valid) {
    throw new Error(`[zenode/serializer] Invalid state:\n  - ${result.errors.join('\n  - ')}`);
  }
  return JSON.stringify(state, null, 2);
}

/**
 * Parses a raw JSON string and restores a validated ZenodeDiagramState.
 * Applies version migration if needed.
 */
export function fromJSON(json: string): ZenodeDiagramState {
  let parsed: any;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("[zenode/serializer] fromJSON: Invalid JSON string provided.");
  }

  // Migration shim: tolerate legacy states missing the version field
  if (!parsed.version) {
    parsed.version = "1.0";
  }

  const result = validateState(parsed as ZenodeDiagramState);
  if (!result.valid) {
    throw new Error(`[zenode/serializer] Parsed JSON failed validation:\n  - ${result.errors.join('\n  - ')}`);
  }

  return parsed as ZenodeDiagramState;
}
