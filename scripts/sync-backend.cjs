const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
fs.copyFileSync(path.join(root, 'core.js'), path.join(root, 'backend/Core.gs'));
console.log('Shared accounting copied to backend/Core.gs');
