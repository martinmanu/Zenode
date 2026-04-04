import type { ZenodeEngine } from "./engine.js";

/**
 * Loads a small, pre-built sample workflow to guide new users.
 * This is decoupled from the main engine to keep the core clean.
 */
export function loadOnboardingSample(engine: ZenodeEngine): void {
  // 1. Start Node
  const startId = engine.addNode({
    type: 'circle',
    shapeVariantId: 'circle1',
    x: 150,
    y: 250,
    content: {
      layout: 'text-only',
      items: [{ kind: 'text', value: 'Start', color: '#ffffff', fontWeight: '700' }]
    }
  }, false);

  // 2. Process Node
  const processId = engine.addNode({
    type: 'rectangle',
    shapeVariantId: 'task1',
    x: 350,
    y: 250,
    width: 140,
    height: 70,
    content: {
      layout: 'text-only',
      items: [{ kind: 'text', value: 'Process Data', color: '#ffffff' }]
    }
  }, false);

  // 3. Decision Node
  const decisionId = engine.addNode({
    type: 'rhombus',
    shapeVariantId: 'rhombus1',
    x: 550,
    y: 250,
    content: {
      layout: 'text-only',
      items: [{ kind: 'text', value: 'Valid?', color: '#ffffff' }]
    }
  }, false);

  // 4. End Node
  const endId = engine.addNode({
    type: 'circle',
    shapeVariantId: 'circle1',
    x: 750,
    y: 250,
    content: {
      layout: 'text-only',
      items: [{ kind: 'text', value: 'End', color: '#ffffff', fontWeight: '700' }]
    }
  }, false);

  // Connections
  engine.addEdge({ sourceNodeId: startId, sourcePortId: 'right', targetNodeId: processId, targetPortId: 'left' }, false);
  engine.addEdge({ sourceNodeId: processId, sourcePortId: 'right', targetNodeId: decisionId, targetPortId: 'left' }, false);
  engine.addEdge({ sourceNodeId: decisionId, sourcePortId: 'right', targetNodeId: endId, targetPortId: 'left' }, false);

  // Refresh view
  engine.refreshNodes();
  engine.reRenderConnections();
}
