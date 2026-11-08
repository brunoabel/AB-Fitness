const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const imgPath = path.join(publicDir, 'ab-logo.png');
const b64 = fs.readFileSync(imgPath).toString('base64');

// SVG exato que espelha perfeitamente o componente ABLogo
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#000000"/>
  <rect x="2" y="2" width="508" height="508" rx="110" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.12"/>
  <image href="data:image/png;base64,${b64}" x="46" y="32" width="420" height="350" preserveAspectRatio="xMidYMid meet" />
  <text x="256" y="446" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="800" font-size="28" fill="#ffffff" fill-opacity="0.9" letter-spacing="16">FITNESS</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'pwa-icon.svg'), svgContent, 'utf8');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');
console.log('pwa-icon.svg and favicon.svg successfully updated with the real AB logo!');
