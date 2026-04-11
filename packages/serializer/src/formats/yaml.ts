import yaml from 'js-yaml';
import type { ZenodeDiagramState } from "@zenode/core";
import { validateState } from "../core/validator.js";

/**
 * Serializes a ZenodeDiagramState to a formatted YAML string.
 * Validates state integrity before serializing.
 */
export function toYAML(state: ZenodeDiagramState): string {
  const result = validateState(state);
  if (!result.valid) {
    throw new Error(`[zenode/serializer] Invalid state:\n  - ${result.errors.join('\n  - ')}`);
  }
  
  // Dump to YAML with deterministic output
  return yaml.dump(state, {
    indent: 2,
    sortKeys: true,
    noRefs: true,
    lineWidth: -1 // prevent line wrapping
  });
}

/**
 * Parses a raw YAML string and restores a validated ZenodeDiagramState.
 */
export function fromYAML(input: string): ZenodeDiagramState {
  let parsed: any;

  try {
    parsed = yaml.load(input);
  } catch (e) {
    throw new Error(`[zenode/serializer] fromYAML: Invalid YAML string provided.\n  - ${e}`);
  }

  if (!parsed) {
    return {
      version: "1.0",
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 }
    };
  }

  // Migration shim: tolerate legacy states missing the version field
  if (!parsed.version) {
    parsed.version = "1.0";
  }

  const result = validateState(parsed as ZenodeDiagramState);
  if (!result.valid) {
    throw new Error(`[zenode/serializer] Parsed YAML failed validation:\n  - ${result.errors.join('\n  - ')}`);
  }

  return parsed as ZenodeDiagramState;
}
