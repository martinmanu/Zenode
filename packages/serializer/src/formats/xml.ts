import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import type { ZenodeDiagramState } from "@zenode/core";
import { validateState } from "../core/validator.js";

/**
 * Serializes Zenode state to a generic XML format.
 */
export function toXML(state: ZenodeDiagramState): string {
  const result = validateState(state);
  if (!result.valid) {
    throw new Error(`[zenode/serializer] Invalid state:\n  - ${result.errors.join('\n  - ')}`);
  }

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
    attributeNamePrefix: "@_"
  });

  const xmlObj = {
    workflow: {
      "@_version": state.version,
      nodes: {
        node: state.nodes.map(n => ({
          "@_id": n.id,
          "@_type": n.type,
          "@_x": n.x,
          "@_y": n.y,
          meta: n.meta,
          content: n.content
        }))
      },
      edges: {
        edge: state.edges.map(e => ({
          "@_id": e.id,
          "@_from": e.sourceNodeId,
          "@_to": e.targetNodeId,
          meta: e.meta
        }))
      },
      viewport: {
        "@_x": state.viewport.x,
        "@_y": state.viewport.y,
        "@_zoom": state.viewport.zoom
      }
    }
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(xmlObj)}`;
}

/**
 * Parses Zenode XML back into ZenodeDiagramState.
 */
export function fromXML(input: string): ZenodeDiagramState {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  });

  const parsed = parser.parse(input);
  const wf = parsed.workflow;

  if (!wf) {
    throw new Error("[zenode/serializer] fromXML: Invalid XML. Missing <workflow> root.");
  }

  const nodesArr = Array.isArray(wf.nodes?.node) ? wf.nodes.node : (wf.nodes?.node ? [wf.nodes.node] : []);
  const edgesArr = Array.isArray(wf.edges?.edge) ? wf.edges.edge : (wf.edges?.edge ? [wf.edges.edge] : []);

  const state: ZenodeDiagramState = {
    version: wf["@_version"] || "1.0",
    nodes: nodesArr.map((n: any) => ({
      id: n["@_id"],
      type: n["@_type"] || "rectangle",
      shapeVariantId: "default",
      x: parseFloat(n["@_x"] || "0"),
      y: parseFloat(n["@_y"] || "0"),
      meta: n.meta,
      content: n.content
    })),
    edges: edgesArr.map((e: any) => ({
      id: e["@_id"],
      sourceNodeId: e["@_from"],
      sourcePortId: "right",
      targetNodeId: e["@_to"],
      targetPortId: "left",
      meta: e.meta
    })),
    viewport: {
      x: parseFloat(wf.viewport?.["@_x"] || "0"),
      y: parseFloat(wf.viewport?.["@_y"] || "0"),
      zoom: parseFloat(wf.viewport?.["@_zoom"] || "1")
    }
  };

  const result = validateState(state);
  if (!result.valid) {
    throw new Error(`[zenode/serializer] XML failed validation:\n  - ${result.errors.join('\n  - ')}`);
  }

  return state;
}
