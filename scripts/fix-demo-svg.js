const fs = require('fs');

try {
let inputSvg = fs.readFileSync('assets/demo.svg', 'utf8');

// 1. Remove unnecessary classes and tags
let cleanSvg = inputSvg
    .replace(/<g class="resize-handles"><\\/g>/g, '')
    .replace(/<circle class="port"[^>]*><\\/circle>/g, '')
    .replace(/<path class="connection-hitbox"[^>]*><\\/path>/g, '')
    .replace(/<path class="connection-ghost-line"[^>]*><\\/path>/g, '')
    .replace(/<g class="ghost-connection"[^>]*><\\/g>/g, '')
    .replace(/<g class="ghosts"[^>]*><\\/g>/g, '')
    .replace(/<g class="elements-group"[^>]*><\\/g>/g, '')
    .replace(/<g class="guides"[^>]*><\\/g>/g, '')
    .replace(/<g class="lasso"[^>]*><\\/g>/g, '')
    .replace(/<g class="visual-groups"><\\/g>/g, '')
    // remove empty g's
    .replace(/<g class="[^"]*"\\s*style="pointer-events:\\s*none;"\\s*><\\/g>/g, '');

// 2. Wrap it properly
const startWrapper = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" width="100%" height="auto" style="background-color: #FAFAFA; border-radius: 8px;">\\n' +
  '<defs>\\n' +
    '<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">\\n' +
      '<path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" stroke-width="0.5" />\\n' +
    '</pattern>\\n' +
    '<marker id="marker-arrow-000000" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">\\n' +
      '<path d="M 0 0 L 10 5 L 0 10 z" fill="#000000" />\\n' +
    '</marker>\\n' +
    '<marker id="marker-arrow-666666" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">\\n' +
      '<path d="M 0 0 L 10 5 L 0 10 z" fill="#666666" />\\n' +
    '</marker>\\n' +
    '<marker id="marker-arrow-333333" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">\\n' +
      '<path d="M 0 0 L 10 5 L 0 10 z" fill="#333333" />\\n' +
    '</marker>\\n' +
    '<marker id="marker-arrow-444444" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">\\n' +
      '<path d="M 0 0 L 10 5 L 0 10 z" fill="#444444" />\\n' +
    '</marker>\\n' +
  '</defs>\\n' +
  '<rect width="100%" height="100%" fill="url(#grid)" />\\n' +
  '<style>\\n' +
    '@keyframes draw { to { stroke-dashoffset: -24; } }\\n' +
    '.animated-flow { animation: draw 1s linear infinite; }\\n' +
    '.node-text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 600; text-anchor: middle; user-select: none; }\\n' +
  '</style>\\n';

const endWrapper = '</svg>\\n';

cleanSvg = startWrapper + cleanSvg + endWrapper;

// Handle foreignObjects: Convert text divs directly to SVG text elements.
cleanSvg = cleanSvg.replace(
  /<foreignObject[^>]*>.*?<div[^>]*color:\\s*(rgb\\([^\\)]+\\))[^>]*>(.*?)<\\/div>.*?<\\/foreignObject>/g,
  function(match, color, text) {
    if (text.includes("process 1")) {
      return '<text y="4" class="node-text" fill="' + color + '">process 1</text>';
    }
    if (text.includes("process 2")) {
      return '<text y="4" class="node-text" fill="' + color + '">process 2</text>';
    }
    if (text.includes("complete")) {
      return '<text y="4" class="node-text" fill="' + color + '">complete</text>';
    }
    return match;
  }
);

// Specifically handle the icons
cleanSvg = cleanSvg.replace(
  /<foreignObject[^>]*>.*?<div[^>]*>.*?<svg[^>]*class="lucide lucide-circle-play.*?">.*?<path d="M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z"><\\/path>.*?<circle cx="12" cy="12" r="10"><\\/circle><\\/svg><\\/div><\\/foreignObject>/g,
  '<g transform="translate(-10, -10)" stroke="#000000" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="10" cy="10" r="10"></circle>' +
      '<path d="M7 7 L12 10 L7 13 Z" fill="currentColor"></path>' +
   '</g>'
);

cleanSvg = cleanSvg.replace(
  /<foreignObject[^>]*>.*?<div[^>]*>.*?<svg[^>]*class="lucide lucide-alarm-clock-plus[^"]*">.*?<circle cx="12" cy="13" r="8"><\\/circle><path d="M5 3 2 6"><\\/path><path d="m22 6-3-3"><\\/path><path d="M6.38 18.7 4 21"><\\/path><path d="M17.64 18.67 20 21"><\\/path><path d="M12 10v6"><\\/path><path d="M9 13h6"><\\/path><\\/svg><\\/div><\\/foreignObject>/g,
  '<g transform="translate(-10, -10)" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="13" r="8"></circle>' +
      '<path d="M12 10v6"></path>' +
      '<path d="M9 13h6"></path>' +
   '</g>'
);

cleanSvg = cleanSvg.replace(
  /<foreignObject[^>]*>.*?<div[^>]*>.*?<svg[^>]*class="lucide lucide-check-check[^"]*">.*?<path d="M18 6 7 17l-5-5"><\\/path><path d="m22 10-7.5 7.5L13 16"><\\/path><\\/svg><\\/div><\\/foreignObject>.*?(<text[^>]*>complete<\\/text>)/g,
  function(match, textGroup) {
    return '<g transform="translate(-10, -20)" stroke="#22a720" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M18 6 7 17l-5-5"></path>' +
      '<path d="m22 10-7.5 7.5L13 16"></path>' +
    '</g>' + textGroup;
  }
);

cleanSvg = cleanSvg.replace(
  /<foreignObject[^>]*>.*?<div[^>]*>.*?<svg[^>]*class="lucide lucide-octagon-pause[^"]*">.*?<path d="M10 15V9"><\\/path><path d="M14 15V9"><\\/path>.*?<\\/svg><\\/div><\\/foreignObject>/s,
  '<g transform="translate(-10, -10)" stroke="#ff0000" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M8 7v6"></path>' +
      '<path d="M12 7v6"></path>' +
   '</g>'
);

// Replace any remaining foreignObjects (catch-all)
cleanSvg = cleanSvg.replace(/<foreignObject.*?>.*?<\\/foreignObject>/gs, '');

// Process animations
cleanSvg = cleanSvg.replace(/style="pointer-events:\\s*none;\\s*animation:[^"]*"/g, 'class="animated-flow"');
cleanSvg = cleanSvg.replace(/style="display:\\s*block;"/g, '');

// Adjust zoom bounds slightly in transform if needed.
cleanSvg = cleanSvg.replace('transform="translate(70.5999694824219,52.600047607421914) scale(0.96)"', 'transform="translate(0, -60)"');

fs.writeFileSync('assets/demo.svg', cleanSvg, 'utf8');

console.log("demo.svg generated successfully");

} catch(e) {
  console.error(e);
}
