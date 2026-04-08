import type { ZenodeDiagramState, NodeData } from "@zenode/core";

/**
 * Maps Zenode shape types to BPMN 2.0 element types.
 */
function mapShapeToBPMN(node: NodeData): string {
  const type = node.type.toLowerCase();
  const meta = node.meta || {};

  // Respect explicit BPMN type if stored in meta
  if (meta.bpmnType) return meta.bpmnType as string;

  switch (type) {
    case 'circle':
    case 'start':
      return 'bpmn:StartEvent';
    case 'end':
      return 'bpmn:EndEvent';
    case 'rhombus':
    case 'decision':
      return 'bpmn:ExclusiveGateway';
    case 'rectangle':
    case 'task':
    default:
      return 'bpmn:Task';
  }
}

/**
 * Extracts the human-readable label from a node.
 */
function getLabel(node: NodeData): string {
  if (node.content?.items) {
    const textItem = node.content.items.find(item => item.kind === 'text');
    if (textItem?.value) return textItem.value;
  }
  return node.id;
}

/**
 * Converts ZenodeDiagramState to BPMN 2.0 XML string.
 * Includes both semantic BPMN elements and bpmndi diagram layout coordinates.
 */
export function toBPMN(state: ZenodeDiagramState): string {
  const processId = "ZenodeProcess1";
  const planeId = "ZenodePlane1";

  // --- Semantic Elements ---
  const semanticNodes = state.nodes.map(node => {
    const bpmnType = mapShapeToBPMN(node);
    const name = getLabel(node);
    return `    <${bpmnType} id="${node.id}" name="${name}" />`;
  }).join('\n');

  const semanticEdges = state.edges.map(edge => {
    const name = edge.meta?.label ? ` name="${edge.meta.label}"` : '';
    return `    <bpmn:sequenceFlow id="${edge.id}" sourceRef="${edge.sourceNodeId}" targetRef="${edge.targetNodeId}"${name} />`;
  }).join('\n');

  // --- Diagram Layout (bpmndi) ---
  const diagramNodes = state.nodes.map(node => {
    const w = node.width ?? 100;
    const h = node.height ?? 80;
    // Normalize: Zenode (Center) -> BPMN (Top-Left)
    const normalizedX = node.x - w / 2;
    const normalizedY = node.y - h / 2;
    
    return `      <bpmndi:BPMNShape id="${node.id}_di" bpmnElement="${node.id}">
        <dc:Bounds x="${normalizedX}" y="${normalizedY}" width="${w}" height="${h}" />
      </bpmndi:BPMNShape>`;
  }).join('\n');

  const diagramEdges = state.edges.map(edge => {
    const waypoints = edge.waypoints?.map(wp => 
      `        <di:waypoint x="${wp.x}" y="${wp.y}" />`
    ).join('\n') || '';

    return `      <bpmndi:BPMNEdge id="${edge.id}_di" bpmnElement="${edge.id}">
${waypoints}
      </bpmndi:BPMNEdge>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  targetNamespace="http://zenode.io/bpmn"
  exporter="Zenode Serializer"
  exporterVersion="${state.version}">

  <bpmn:process id="${processId}" isExecutable="false">
${semanticNodes}
${semanticEdges}
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram1">
    <bpmndi:BPMNPlane id="${planeId}" bpmnElement="${processId}">
${diagramNodes}
${diagramEdges}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>

</bpmn:definitions>`;
}
