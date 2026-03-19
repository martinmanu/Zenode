export function drawRectangle(svg: any, x: number, y: number, config: any) {
  const width = config.width || 120;
  const height = config.height || 60;
  const fillColor = config.color || "#0000ff";
  const strokeColor = config.stroke?.color || "#000000";
  const strokeWidth = config.stroke?.width || 2;

  return svg
    .append("rect")
    .attr("x", x - width / 2)
    .attr("y", y - height / 2)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", fillColor)
    .attr("stroke", strokeColor)
    .attr("stroke-width", strokeWidth);
}

export function  roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  r1: number, // top-left
  r2: number, // top-right
  r3: number, // bottom-right
  r4: number  // bottom-left
): string {
  r1 = Math.min(r1, width / 2, height / 2);
  r2 = Math.min(r2, width / 2, height / 2);
  r3 = Math.min(r3, width / 2, height / 2);
  r4 = Math.min(r4, width / 2, height / 2);
  
  return `M ${x + r1},${y} 
          H ${x + width - r2} 
          A ${r2},${r2} 0 0 1 ${x + width},${y + r2} 
          V ${y + height - r3} 
          A ${r3},${r3} 0 0 1 ${x + width - r3},${y + height} 
          H ${x + r4} 
          A ${r4},${r4} 0 0 1 ${x},${y + height - r4} 
          V ${y + r1} 
          A ${r1},${r1} 0 0 1 ${x + r1},${y} Z`;
}

