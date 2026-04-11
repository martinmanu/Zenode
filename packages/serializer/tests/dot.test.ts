import { describe, it, expect } from 'vitest';
import { toDOT, fromDOT } from '../src/formats/dot.js';
import type { ZenodeDiagramState } from '@zenode/core';

describe('DOT Serializer', () => {
  const sampleState: ZenodeDiagramState = {
    version: '1.0',
    nodes: [
      {
        id: 'start',
        type: 'rectangle',
        shapeVariantId: 'default',
        x: 0,
        y: 100,
        content: {
          layout: 'text-only',
          items: [{ kind: 'text', value: 'Start' }]
        }
      },
      {
          id: 'end',
          type: 'circle',
          shapeVariantId: 'default',
          x: 150,
          y: 100,
          content: {
            layout: 'text-only',
            items: [{ kind: 'text', value: 'End' }]
          }
        }
    ],
    edges: [
      {
        id: 'e1',
        sourceNodeId: 'start',
        sourcePortId: 'right',
        targetNodeId: 'end',
        targetPortId: 'left',
        meta: { label: 'Go' }
      }
    ],
    viewport: { x: 0, y: 0, zoom: 1 }
  };

  it('should serialize to valid DOT format', () => {
    const dot = toDOT(sampleState);
    expect(dot).toContain('digraph ZenodeWorkflow {');
    expect(dot).toContain('"start" [label="Start", type="rectangle"];');
    expect(dot).toContain('"end" [label="End", type="circle"];');
    expect(dot).toContain('"start" -> "end" [label="Go"];');
  });

  it('should parse DOT back into Zenode state structure', () => {
    const dot = `
    digraph {
      "a" [label="Alpha", type="rectangle"];
      "b" [label="Beta", type="circle"];
      "a" -> "b" [label="link"];
    }
    `;
    const state = fromDOT(dot);
    expect(state.nodes).toHaveLength(2);
    expect(state.nodes[0].id).toBe('a');
    expect(state.nodes[0].type).toBe('rectangle');
    expect(state.edges).toHaveLength(1);
    expect(state.edges[0].sourceNodeId).toBe('a');
    expect(state.edges[0].targetNodeId).toBe('b');
    expect(state.edges[0].meta?.label).toBe('link');
  });
});
