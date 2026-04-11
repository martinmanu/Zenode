/**
 * @zenode/serializer — Public API
 *
 * Pure, framework-agnostic serialization layer for the Zenode ecosystem.
 * Converts ZenodeDiagramState to/from external formats.
 *
 * @example
 * import { toJSON, fromJSON, toMermaid, toBPMN } from '@zenode/serializer';
 */

// --- Core ---
export { validateState } from './core/validator.js';
export type { ValidationResult } from './core/validator.js';

// --- Formats ---
export { toJSON, fromJSON } from './formats/json.js';
export { toYAML, fromYAML } from './formats/yaml.js';
export { toDOT, fromDOT } from './formats/dot.js';
export { toXML, fromXML } from './formats/xml.js';
export { toDSL, fromDSL } from './formats/dsl.js';
export { toMermaid } from './formats/mermaid.js';
export { toBPMN } from './formats/bpmn.js';

// --- Utilities ---
export {
  getRootNodes,
  getLeafNodes,
  getOrphanNodes,
  getEdgesForNode,
} from './utils/graph.js';

export {
  isZenodeDiagramState,
  isValidNodeData,
  isValidEdgeData,
} from './utils/guards.js';
