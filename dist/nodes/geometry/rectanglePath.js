/**
 * Builds an SVG path for a rectangle with independent corner radii.
 */
function roundedRectPath(x, y, width, height, r1, r2, r3, r4) {
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

export { roundedRectPath };
//# sourceMappingURL=rectanglePath.js.map
