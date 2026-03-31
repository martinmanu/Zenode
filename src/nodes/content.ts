/**
 * Node Content Renderer
 * 
 * Renders NodeContent (text, icon, image) into a `g.node-content` group
 * AFTER the shape is drawn. Completely separate from ShapeRenderer.draw().
 * 
 * Layout modes supported:
 *   text-only     → single text centered in bounds
 *   icon-only     → single icon centered in bounds
 *   center        → first item centered
 *   icon-top-text → icon centered above midline, text below
 *   icon-left-text→ icon left of midline, text right
 */

import * as d3 from "d3";
import { BoundingBox, ContentLayout, NodeContent, NodeContentItem, D3Selection } from "../types/index.js";

const GAP = 8; // px gap between icon and text in compound layouts

/** Entry point — call this after renderer.draw() inside placement.ts */
export function renderNodeContent(
  group: D3Selection,
  content: NodeContent | undefined,
  bounds: BoundingBox
): void {
  // Remove previous content layer
  (group as any).select("g.node-content").remove();

  if (!content || !content.items || content.items.length === 0) return;

  const g = (group as any).append("g").attr("class", "node-content");

  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;

  const layout: ContentLayout = content.layout ?? "text-only";
  const items = content.items;

  switch (layout) {
    case "text-only":
    case "center": {
      const item = items[0];
      if (!item) return;
      renderItem(g, item, cx, cy);
      break;
    }
    case "icon-only": {
      const item = items[0];
      if (!item) return;
      renderItem(g, item, cx, cy);
      break;
    }
    case "icon-top-text": {
      const icon = items.find(i => i.kind === "icon" || i.kind === "image");
      const text = items.find(i => i.kind === "text");
      const iconSize = icon?.iconSize ?? 22;
      const textSize = text?.fontSize ?? 12;
      const totalH = iconSize + GAP + textSize;
      const iconY = cy - totalH / 2 + iconSize / 2;
      const textY = iconY + iconSize / 2 + GAP + textSize / 2;
      if (icon) renderItem(g, icon, cx, iconY);
      if (text) renderItem(g, text, cx, textY);
      break;
    }
    case "icon-left-text": {
      const icon = items.find(i => i.kind === "icon" || i.kind === "image");
      const text = items.find(i => i.kind === "text");
      const iconSize = icon?.iconSize ?? 22;
      const totalW = iconSize + GAP + (text?.maxWidth ?? 60);
      const iconX = cx - totalW / 2 + iconSize / 2;
      const textX = iconX + iconSize / 2 + GAP;
      if (icon) renderItem(g, icon, iconX, cy);
      if (text) renderItem(g, text, textX, cy);
      break;
    }
  }
}

function renderItem(
  g: any,
  item: NodeContentItem,
  x: number,
  y: number
): void {
  const ox = item.offsetX ?? 0;
  const oy = item.offsetY ?? 0;
  const fx = x + ox;
  const fy = y + oy;

  switch (item.kind) {
    case "text":
      renderText(g, item, fx, fy);
      break;
    case "icon":
      renderIcon(g, item, fx, fy);
      break;
    case "image":
      renderImage(g, item, fx, fy);
      break;
  }
}

function renderText(g: any, item: NodeContentItem, x: number, y: number): void {
  const fontSize = item.fontSize ?? 12;
  const fontWeight = item.fontWeight ?? "600";
  const color = item.color ?? "#000000";
  const maxWidth = item.maxWidth;
  const textAlign = item.textAlign ?? "center";

  if (maxWidth) {
    // Use foreignObject for multi-line wrapping (TextArea feel)
    const fo = g.append("foreignObject")
      .attr("x", x - maxWidth / 2)
      .attr("y", y - (fontSize * 1.5) / 2) // Rough vertical centering
      .attr("width", maxWidth)
      .attr("height", 200) // Large height to allow wrapping
      .style("pointer-events", "none")
      .style("overflow", "visible");

    fo.append("xhtml:div")
      .style("width", `${maxWidth}px`)
      .style("color", color)
      .style("font-size", `${fontSize}px`)
      .style("font-weight", fontWeight)
      .style("font-family", item.fontFamily ?? "Inter, system-ui, sans-serif")
      .style("text-align", textAlign)
      .style("line-height", "1.2")
      .style("word-wrap", "break-word")
      .style("opacity", String(item.opacity ?? 1))
      .style("user-select", "none")
      .text(item.value);
  } else {
    // Standard SVG text for single lines
    g.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", textAlign === "center" ? "middle" : textAlign === "left" ? "start" : "end")
      .attr("dominant-baseline", "central")
      .attr("fill", color)
      .attr("opacity", item.opacity ?? 1)
      .style("font-size", `${fontSize}px`)
      .style("font-weight", fontWeight)
      .style("font-family", item.fontFamily ?? "Inter, system-ui, sans-serif")
      .style("pointer-events", "none")
      .style("user-select", "none")
      .text(item.value);
  }
}

function renderIcon(g: any, item: NodeContentItem, x: number, y: number): void {
  const size = item.iconSize ?? 22;
  const color = item.color ?? "currentColor";

  // Render inline SVG using foreignObject or g transform
  const fo = g.append("foreignObject")
    .attr("x", x - size / 2)
    .attr("y", y - size / 2)
    .attr("width", size)
    .attr("height", size)
    .style("pointer-events", "none")
    .style("overflow", "visible");

  const body = fo.append("xhtml:div")
    .style("width", `${size}px`)
    .style("height", `${size}px`)
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "center")
    .style("color", color)
    .style("opacity", String(item.opacity ?? 1));

  // Inject SVG string directly
  (body.node() as HTMLElement).innerHTML = item.value;

  // Scale injected SVG to fill the size
  const inner = (body.node() as HTMLElement).querySelector("svg");
  if (inner) {
    inner.style.width = `${size}px`;
    inner.style.height = `${size}px`;
  }
}

function renderImage(g: any, item: NodeContentItem, x: number, y: number): void {
  const size = item.iconSize ?? 32;
  const padding = item.padding ?? 2;
  const innerSize = size - padding * 2;

  g.append("image")
    .attr("href", item.value)
    .attr("x", x - innerSize / 2)
    .attr("y", y - innerSize / 2)
    .attr("width", innerSize)
    .attr("height", innerSize)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("opacity", item.opacity ?? 1)
    .style("pointer-events", "none");
}
