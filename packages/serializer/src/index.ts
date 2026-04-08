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

// --- JSON Format ---
export { toJSON, fromJSON } from './formats/json.js';

// --- Mermaid Format ---
export { toMermaid } from './formats/mermaid.js';

// --- BPMN Format ---
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
