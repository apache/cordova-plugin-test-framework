const { cpSync, rmSync } = require('node:fs');
const path = require('node:path');

const jasmineSrc = path.join(path.dirname(require.resolve('jasmine-core')), 'jasmine-core');
const jasmineDest = path.join(__dirname, '..', 'www', 'assets', 'jasmine');

cpSync(jasmineSrc, jasmineDest, { recursive: true, force: true });
rmSync(path.join(jasmineDest, 'example'), { recursive: true, force: true });
