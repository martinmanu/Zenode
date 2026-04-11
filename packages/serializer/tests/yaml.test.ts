import { describe, it, expect } from 'vitest';
import { toYAML, fromYAML } from '../src/formats/yaml.js';
import type { ZenodeDiagramState } from '@zenode/core';

describe('YAML Serializer', () => {
  const sampleState: ZenodeDiagramState = {
    version: '1.0',
    nodes: [
      {
        id: 'n1',
        type: 'rectangle',
        shapeVariantId: 'default',
        x: 100,
        y: 100,
        content: {
          layout: 'text-only',
          items: [{ kind: 'text', value: 'Hello' }]
        },
        meta: { key: 'value' }
      }
    ],
    edges: [
      {
        id: 'e1',
        sourceNodeId: 'n1',
        sourcePortId: 'right',
        targetNodeId: 'n1',
        targetPortId: 'left',
        meta: { label: 'loop' }
      }
    ],
    viewport: { x: 0, y: 0, zoom: 1 }
  };

  it('should serialize and parse back to identical state (round-trip)', () => {
    const yaml = toYAML(sampleState);
    const parsed = fromYAML(yaml);
    expect(parsed).toEqual(sampleState);
  });

  it('should maintain field order (deterministic)', () => {
    const yaml1 = toYAML(sampleState);
    const yaml2 = toYAML(sampleState);
    expect(yaml1).toBe(yaml2);
  });

  it('should throw on invalid state (e.g. dangling edge)', () => {
    const invalidState = { 
      ...sampleState, 
      edges: [{ 
        id: 'e_bad', 
        sourceNodeId: 'non-existent', 
        targetNodeId: 'n1',
        sourcePortId: 'right',
        targetPortId: 'left'
      }] 
    } as any;
    expect(() => toYAML(invalidState)).toThrow();
  });

  it('should throw on malformed yaml', () => {
    const malformed = 'nodes: [ { id: n1 ';
    expect(() => fromYAML(malformed)).toThrow();
  });
});
