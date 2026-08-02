#!/usr/bin/env node
/**
 * Shared src -> lib/es transpile for lowcode-plugins packages.
 * Avoids build-plugin-component's duplicate Babel plugin merge on modern @babel/core.
 *
 * Usage: node ../../scripts/transpile-package.js
 * Run from a package directory that has a `src/` folder.
 */
const path = require('path');
const fs = require('fs');
const { transformFileSync } = require('@babel/core');

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

if (!fs.existsSync(SRC)) {
  console.error('No src/ directory in', ROOT);
  process.exit(1);
}

const SHARED_PLUGINS = [
  ['@babel/plugin-proposal-class-properties', { loose: true }],
];

function babelOpts(modules) {
  return {
    babelrc: false,
    configFile: false,
    presets: [
      ['@babel/preset-env', { modules, loose: true }],
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
    plugins: SHARED_PLUGINS,
  };
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) files.push(full);
    else if (/\.(scss|css|less|json)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function emit(outDir, modules) {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  for (const file of walk(SRC)) {
    const rel = path.relative(SRC, file);
    const destBase = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(destBase), { recursive: true });
    if (/\.(scss|css|less|json)$/.test(file)) {
      fs.copyFileSync(file, destBase);
      continue;
    }
    const opts = babelOpts(modules);
    opts.filename = file;
    const result = transformFileSync(file, opts);
    fs.writeFileSync(destBase.replace(/\.(tsx|ts|jsx)$/, '.js'), result.code);
  }
  const styleSrc = path.join(outDir, 'style.js');
  if (!fs.existsSync(styleSrc) && fs.existsSync(path.join(outDir, 'index.scss'))) {
    fs.writeFileSync(styleSrc, modules === false ? "import './index.scss';\n" : "require('./index.scss');\n");
  }
}

emit(path.join(ROOT, 'lib'), 'commonjs');
emit(path.join(ROOT, 'es'), false);
console.log(`[transpile] ${path.basename(ROOT)}: src -> lib/ + es/`);
