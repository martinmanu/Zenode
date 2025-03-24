export function drawRhombus(svg: any, x: number, y: number, config: any) {
  const width = config.width || 100;
  const height = config.height || 50;
  const fillColor = config.color || "#ff6600";
  const strokeColor = config.stroke?.color || "#333333";
  const strokeWidth = config.stroke?.width || 2;

  const points = `
    ${x},${y - height / 2} 
    ${x + width / 2},${y} 
    ${x},${y + height / 2} 
    ${x - width / 2},${y}
  `;

  return svg
    .append("polygon")
    .attr("points", points)
    .attr("fill", fillColor)
    .attr("stroke", strokeColor)
    .attr("stroke-width", strokeWidth);
}
