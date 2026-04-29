#!/usr/bin/env node
/**
 * Idempotent project bootstrap: immutable-install guard, safe .npmrc.
 * Run `node scripts/setup.cjs` before `npm install`.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const root      = process.cwd();
const scriptDir = __dirname;
const npmrcTpl  = path.join(scriptDir, 'npmrc.template');

function read(p)        { return fs.readFileSync(p, 'utf8'); }
function write(p, body) { fs.writeFileSync(p, body, 'utf8'); }

function ensureNpmrc() {
  if (!fs.existsSync(npmrcTpl)) return;
  const dest = path.join(root, '.npmrc');
  if (!fs.existsSync(dest)) {
    write(dest, read(npmrcTpl));
    console.log('[setup] Wrote .npmrc from template.');
    return;
  }
  const n = read(dest);
  if (/INSERT_|YOUR_ARTIFACTORY_TOKEN|registry\.npmjs\.procore\.com/.test(n)) {
    write(dest, read(npmrcTpl));
    console.log('[setup] Replaced stale registry config in .npmrc.');
  }
}

function main() {
  console.log('[setup] Normalising npm config in', root);
  ensureNpmrc();
  console.log('[setup] Done. Next: npm install');
}

main();
