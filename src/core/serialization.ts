import { NodeData, EdgeData } from "../types/index.js";

/**
 * Handles serialization of Zenode diagrams to various industry-standard formats.
 * Fulfills Phase 3.5 of the Layer 1 roadmap.
 */
export class SerializationEngine {
  
  /**
   * Generates a Mermaid.js diagram definition (perfect for GitHub READMEs).
   */
  public toMermaid(nodes: NodeData[], edges: EdgeData[]): string {
    let script = "graph TD\n";
    
    // Add nodes with labels
    nodes.forEach(n => {
      const label = n.content?.items.find(i => i.kind === 'text')?.value || n.id;
      // Handle the different shape representations in Mermaid
      let left = "[", right = "]";
      if (n.type === 'circle' || n.type === 'oval') { left = "(("; right = "))"; }
      if (n.type === 'rhombus') { left = "{"; right = "}"; }
      
      script += `    ${n.id}${left}"${label}"${right}\n`;
    });

    // Add edges
    edges.forEach(e => {
      script += `    ${e.sourceNodeId} --> ${e.targetNodeId}\n`;
    });

    return script;
  }

  /**
   * Generates a Graphviz DOT definition.
   */
  public toDOT(nodes: NodeData[], edges: EdgeData[]): string {
    let script = "digraph ZenodeWorkflow {\n";
    script += '    rankdir=LR;\n';
    script += '    node [shape=box, style=rounded, fontname="Inter"];\n';

    nodes.forEach(n => {
      const label = n.content?.items.find(i => i.kind === 'text')?.value || n.id;
      script += `    "${n.id}" [label="${label}"];\n`;
    });

    edges.forEach(e => {
      script += `    "${e.sourceNodeId}" -> "${e.targetNodeId}";\n`;
    });

    script += "}\n";
    return script;
  }

  /**
   * Generates a generic Workflow XML (DSL placeholder for v3.5).
   */
  public toXML(nodes: NodeData[], edges: EdgeData[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<zenode:workflow xmlns:zenode="http://zenode.dev/schema">\n';
    
    xml += '  <nodes>\n';
    nodes.forEach(n => {
      xml += `    <node id="${n.id}" type="${n.type}" x="${Math.round(n.x)}" y="${Math.round(n.y)}">\n`;
      if (n.meta && Object.keys(n.meta).length) {
        xml += '      <meta>\n';
        for (const [k, v] of Object.entries(n.meta)) {
          xml += `        <property name="${k}">${v}</property>\n`;
        }
        xml += '      </meta>\n';
      }
      xml += '    </node>\n';
    });
    xml += '  </nodes>\n';

    xml += '  <connections>\n';
    edges.forEach(e => {
      xml += `    <connection id="${e.id}" from="${e.sourceNodeId}" to="${e.targetNodeId}" />\n`;
    });
    xml += '  </connections>\n';

    xml += '</zenode:workflow>';
    return xml;
  }
}
