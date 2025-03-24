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
