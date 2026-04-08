import { describe, it, expect } from 'vitest';
import type { ZenodeDiagramState } from '@zenode/core';
import { validateState } from '../src/core/validator.js';
import { toJSON, fromJSON } from '../src/formats/json.js';
import { toMermaid } from '../src/formats/mermaid.js';
import { toBPMN } from '../src/formats/bpmn.js';
import { getRootNodes, getLeafNodes, getOrphanNodes } from '../src/utils/graph.js';
import { isZenodeDiagramState } from '../src/utils/guards.js';

// ------------------------------------------------------------------
// Test Fixtures
// ------------------------------------------------------------------

const emptyState: ZenodeDiagramState = {
  version: "1.0",
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};

const singleNodeState: ZenodeDiagramState = {
  version: "1.0",
  nodes: [{ id: 'n1', type: 'circle', shapeVariantId: 'circle1', x: 100, y: 100 }],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};

const fullWorkflowState: ZenodeDiagramState = {
  version: "1.0",
  nodes: [
    { id: 'start', type: 'circle', shapeVariantId: 'circle1', x: 100, y: 100, content: { layout: 'text-only', items: [{ kind: 'text', value: 'Start' }] } },
    { id: 'process', type: 'rectangle', shapeVariantId: 'rect1', x: 300, y: 100, content: { layout: 'text-only', items: [{ kind: 'text', value: 'Process Data' }] } },
    { id: 'decision', type: 'rhombus', shapeVariantId: 'rhombus1', x: 500, y: 100, content: { layout: 'text-only', items: [{ kind: 'text', value: 'Decision?' }] } },
    { id: 'end', type: 'circle', shapeVariantId: 'circle1', x: 700, y: 100, content: { layout: 'text-only', items: [{ kind: 'text', value: 'End' }] } },
  ],
  edges: [
    { id: 'e1', sourceNodeId: 'start', sourcePortId: 'right', targetNodeId: 'process', targetPortId: 'left' },
    { id: 'e2', sourceNodeId: 'process', sourcePortId: 'right', targetNodeId: 'decision', targetPortId: 'left' },
    { id: 'e3', sourceNodeId: 'decision', sourcePortId: 'right', targetNodeId: 'end', targetPortId: 'left', meta: { label: 'Yes' } },
  ],
  viewport: { x: 0, y: 0, zoom: 1 },
};

// ------------------------------------------------------------------
// 1. Validator Tests
// ------------------------------------------------------------------

describe('Validator', () => {
  it('should pass for a valid full workflow state', () => {
    const result = validateState(fullWorkflowState);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should pass for an empty graph', () => {
    const result = validateState(emptyState);
    expect(result.valid).toBe(true);
  });

  it('should fail when version is missing', () => {
    const bad = { ...emptyState, version: undefined as any };
    const result = validateState(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('version'))).toBe(true);
  });

  it('should fail when a dangling edge references a non-existent node', () => {
    const danglingState: ZenodeDiagramState = {
      ...singleNodeState,
      edges: [{ id: 'e1', sourceNodeId: 'n1', sourcePortId: 'right', targetNodeId: 'GHOST_NODE', targetPortId: 'left' }],
    };
    const result = validateState(danglingState);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('GHOST_NODE'))).toBe(true);
  });
});

// ------------------------------------------------------------------
// 2. JSON Serialization Tests
// ------------------------------------------------------------------

describe('JSON Serializer', () => {
  it('should serialize and deserialize without data loss', () => {
    const jsonStr = toJSON(fullWorkflowState);
    const restored = fromJSON(jsonStr);
    expect(restored.nodes).toHaveLength(fullWorkflowState.nodes.length);
    expect(restored.edges).toHaveLength(fullWorkflowState.edges.length);
    expect(restored.version).toBe('1.0');
  });

  it('should produce valid JSON output', () => {
    const jsonStr = toJSON(emptyState);
    expect(() => JSON.parse(jsonStr)).not.toThrow();
  });

  it('should throw on invalid JSON input', () => {
    expect(() => fromJSON('not { valid } json')).toThrow();
  });

  it('should throw on dangling edge during serialization', () => {
    const invalid: ZenodeDiagramState = {
      ...singleNodeState,
      edges: [{ id: 'e1', sourceNodeId: 'n1', sourcePortId: 'right', targetNodeId: 'MISSING', targetPortId: 'left' }],
    };
    expect(() => toJSON(invalid)).toThrow(/Invalid state/);
  });
});

// ------------------------------------------------------------------
// 3. Mermaid Serialization Tests
// ------------------------------------------------------------------

describe('Mermaid Serializer', () => {
  it('should produce a valid Mermaid header', () => {
    const output = toMermaid(emptyState);
    expect(output).toContain('graph TD');
  });

  it('should map nodes to Mermaid syntax', () => {
    const output = toMermaid(fullWorkflowState);
    expect(output).toContain('start');
    expect(output).toContain('process');
    expect(output).toContain('decision');
  });

  it('should use node labels from content', () => {
    const output = toMermaid(fullWorkflowState);
    expect(output).toContain('Start');
    expect(output).toContain('Process Data');
    expect(output).toContain('Decision?');
  });

  it('should include edge labels from meta', () => {
    const output = toMermaid(fullWorkflowState);
    expect(output).toContain('Yes');
  });

  it('should handle single-node graph', () => {
    const output = toMermaid(singleNodeState);
    expect(output).toContain('n1');
    expect(output).not.toContain('-->');
  });

  it('should handle empty graph without errors', () => {
    expect(() => toMermaid(emptyState)).not.toThrow();
  });
});

// ------------------------------------------------------------------
// 4. BPMN Serialization Tests
// ------------------------------------------------------------------

describe('BPMN Serializer', () => {
  it('should produce valid XML with BPMN declarations', () => {
    const output = toBPMN(fullWorkflowState);
    expect(output).toContain('<?xml');
    expect(output).toContain('bpmn:definitions');
    expect(output).toContain('bpmn:process');
  });

  it('should map rhombus to ExclusiveGateway', () => {
    const output = toBPMN(fullWorkflowState);
    expect(output).toContain('bpmn:ExclusiveGateway');
  });

  it('should map rectangle to Task', () => {
    const output = toBPMN(fullWorkflowState);
    expect(output).toContain('bpmn:Task');
  });

  it('should include bpmndi layout with coordinates', () => {
    const output = toBPMN(fullWorkflowState);
    expect(output).toContain('bpmndi:BPMNShape');
    expect(output).toContain('dc:Bounds');
  });

  it('should handle empty graph without errors', () => {
    expect(() => toBPMN(emptyState)).not.toThrow();
  });
});

// ------------------------------------------------------------------
// 5. Graph Utility Tests
// ------------------------------------------------------------------

describe('Graph Utilities', () => {
  it('getRootNodes should return the entry node (start)', () => {
    const roots = getRootNodes(fullWorkflowState);
    expect(roots.map(n => n.id)).toContain('start');
  });

  it('getLeafNodes should return the terminal node (end)', () => {
    const leaves = getLeafNodes(fullWorkflowState);
    expect(leaves.map(n => n.id)).toContain('end');
  });

  it('getOrphanNodes should return zero for a fully connected graph', () => {
    const orphans = getOrphanNodes(fullWorkflowState);
    expect(orphans).toHaveLength(0);
  });

  it('getOrphanNodes should detect a disconnected node', () => {
    const stateWithOrphan: ZenodeDiagramState = {
      ...fullWorkflowState,
      nodes: [...fullWorkflowState.nodes, { id: 'orphan1', type: 'rectangle', shapeVariantId: 'rect1', x: 0, y: 0 }],
    };
    const orphans = getOrphanNodes(stateWithOrphan);
    expect(orphans.map(n => n.id)).toContain('orphan1');
  });
});

// ------------------------------------------------------------------
// 6. Type Guards Tests
// ------------------------------------------------------------------

describe('Type Guards', () => {
  it('isZenodeDiagramState should return true for valid state', () => {
    expect(isZenodeDiagramState(fullWorkflowState)).toBe(true);
  });

  it('isZenodeDiagramState should return false for null', () => {
    expect(isZenodeDiagramState(null)).toBe(false);
  });

  it('isZenodeDiagramState should return false for missing nodes array', () => {
    expect(isZenodeDiagramState({ version: '1.0', edges: [] })).toBe(false);
  });
});
