import { describe, it, expect } from 'vitest';
import { toDSL, fromDSL } from '../src/formats/dsl.js';

describe('Zenode DSL Serializer', () => {
  it('should parse simple connections', () => {
    const dsl = 'a -> b';
    const state = fromDSL(dsl);
    expect(state.nodes).toHaveLength(2);
    expect(state.edges).toHaveLength(1);
    expect(state.edges[0].sourceNodeId).toBe('a');
    expect(state.edges[0].targetNodeId).toBe('b');
  });

  it('should parse chains', () => {
    const dsl = 'start -> process -> end';
    const state = fromDSL(dsl);
    expect(state.nodes).toHaveLength(3);
    expect(state.edges).toHaveLength(2);
    expect(state.edges[0].targetNodeId).toBe('process');
    expect(state.edges[1].sourceNodeId).toBe('process');
    expect(state.edges[1].targetNodeId).toBe('end');
  });

  it('should parse edge labels', () => {
    const dsl = 'decision -> task1 [yes]\ndecision -> task2 [no]';
    const state = fromDSL(dsl);
    expect(state.nodes).toHaveLength(3);
    expect(state.edges).toHaveLength(2);
    expect(state.edges[0].meta?.label).toBe('yes');
    expect(state.edges[1].meta?.label).toBe('no');
  });

  it('should serialize to DSL lines', () => {
      const state: any = {
          version: '1.0',
          nodes: [{ id: 'a' }, { id: 'b' }],
          edges: [{ sourceNodeId: 'a', targetNodeId: 'b', meta: { label: 'ok' } }],
          viewport: { x: 0, y: 0, zoom: 1 }
      };
      const dsl = toDSL(state);
      expect(dsl).toBe('a -> b [ok]');
  });
});
