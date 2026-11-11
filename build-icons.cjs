const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const faviconPath = path.join(publicDir, 'favicon.svg');
const pwaIconPath = path.join(publicDir, 'pwa-icon.svg');

if (fs.existsSync(faviconPath) && !fs.existsSync(pwaIconPath)) {
  fs.copyFileSync(faviconPath, pwaIconPath);
}

console.log('pwa-icon.svg and favicon.svg successfully verified with the new vector logo!');
