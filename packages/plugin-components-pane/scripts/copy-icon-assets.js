const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '../src/Icon/icon.svg');
for (const dir of ['lib/Icon', 'es/Icon']) {
  const destDir = path.join(__dirname, '..', dir);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, path.join(destDir, 'icon.svg'));
  console.log('copied icon.svg ->', dir);
}
