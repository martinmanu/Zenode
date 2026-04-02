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

  /**
   * Parses a Zenode XML string back into node and edge arrays.
   */
  public fromXML(xmlString: string): { nodes: NodeData[], edges: EdgeData[] } {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const nodes: NodeData[] = [];
    const edges: EdgeData[] = [];

    // Parse Nodes
    const nodeElems = xmlDoc.getElementsByTagName("node");
    for (let i = 0; i < nodeElems.length; i++) {
        const el = nodeElems[i];
        const id = el.getAttribute("id") || `node-${i}`;
        const type = el.getAttribute("type") || "rectangle";
        const x = parseFloat(el.getAttribute("x") || "0");
        const y = parseFloat(el.getAttribute("y") || "0");
        
        const meta: Record<string, any> = {};
        const metaElems = el.getElementsByTagName("property");
        for (let j = 0; j < metaElems.length; j++) {
            const p = metaElems[j];
            const name = p.getAttribute("name");
            if (name) meta[name] = p.textContent;
        }

        nodes.push({ id, type, x, y, meta, shapeVariantId: type });
    }

    // Parse Connections
    const connElems = xmlDoc.getElementsByTagName("connection");
    for (let i = 0; i < connElems.length; i++) {
        const el = connElems[i];
        edges.push({
            id: el.getAttribute("id") || `edge-${i}`,
            sourceNodeId: el.getAttribute("from") || "",
            targetNodeId: el.getAttribute("to") || "",
            sourcePortId: "right", // Fallback defaults
            targetPortId: "left"
        });
    }

    return { nodes, edges };
  }
}
