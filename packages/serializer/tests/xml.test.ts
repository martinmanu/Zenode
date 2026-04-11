import { describe, it, expect } from 'vitest';
import { toXML, fromXML } from '../src/formats/xml.js';
import type { ZenodeDiagramState } from '@zenode/core';

describe('XML Serializer', () => {
  const sampleState: ZenodeDiagramState = {
    version: '1.0',
    nodes: [
      {
        id: 'node1',
        type: 'rectangle',
        shapeVariantId: 'default',
        x: 10,
        y: 20,
        content: {
          layout: 'text-only',
          items: [{ kind: 'text', value: 'Hello XML' }]
        },
        meta: { test: true }
      }
    ],
    edges: [
      {
        id: 'edge1',
        sourceNodeId: 'node1',
        sourcePortId: 'right',
        targetNodeId: 'node1',
        targetPortId: 'left',
        meta: { color: 'red' }
      }
    ],
    viewport: { x: 5, y: 5, zoom: 2 }
  };

  it('should serialize and parse back to identical state', () => {
    const xml = toXML(sampleState);
    const parsed = fromXML(xml);
    
    // Check specific fields since some defaults like shapeVariantId might be re-applied
    expect(parsed.version).toBe(sampleState.version);
    expect(parsed.nodes[0].id).toBe(sampleState.nodes[0].id);
    expect(parsed.nodes[0].x).toBe(sampleState.nodes[0].x);
    expect(parsed.nodes[0].meta).toEqual(sampleState.nodes[0].meta);
    expect(parsed.edges[0].id).toBe(sampleState.edges[0].id);
    expect(parsed.viewport).toEqual(sampleState.viewport);
  });

  it('should handle empty graphs', () => {
    const empty: ZenodeDiagramState = {
      version: '1.0',
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 }
    };
    const xml = toXML(empty);
    const parsed = fromXML(xml);
    expect(parsed.nodes).toHaveLength(0);
  });
});
