export function drawCircle(svg: any, x: number, y: number, config: any) {
  const radius = config.radius || 30;
  const fillColor = config.color || "#008000";
  const strokeColor = config.stroke?.color || "#000000";
  const strokeWidth = config.stroke?.width || 2;

  return svg
    .append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", radius)
    .attr("fill", fillColor)
    .attr("stroke", strokeColor)
    .attr("stroke-width", strokeWidth);
}
