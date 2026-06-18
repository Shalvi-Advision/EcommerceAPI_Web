#!/usr/bin/env node
/**
 * Tenant-isolation guard (multi-tenant SaaS, plan §3).
 *
 * In the DB-per-tenant model, request handlers MUST read/write through the
 * per-tenant connection exposed as `req.models.*` (bound by middleware/resolveTenant).
 * A direct `require('../models/X')` inside a route/controller/middleware re-binds
 * the model to a global/default connection and silently leaks data across tenants.
 *
 * This script fails (exit 1) if any such direct model require reappears in the
 * request-handling layer, so the regression can't merge. Run it in CI and locally:
 *   node scripts/check-tenant-isolation.js
 *
 * Allowed exceptions:
 *   - models/control/*          (control-plane models live on the control connection)
 *   - db/modelRegistry.js       (the registry is what binds models to tenant conns)
 *   - standalone CLI scripts at repo root (seed/upload/migrate) — not request code
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Directories whose files run inside the request lifecycle and therefore must
// never require a model directly.
const GUARDED_DIRS = ['routes', 'controllers', 'middleware'];

// require('...models/Name') — any relative depth, single or double quotes.
// Excludes models/control/... (those are control-plane, resolved separately).
const DIRECT_MODEL_REQUIRE = /require\(\s*['"](?:\.\.?\/)+models\/(?!control\/)[A-Za-z0-9_]+['"]\s*\)/;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      out.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];

for (const d of GUARDED_DIRS) {
  const dir = path.join(ROOT, d);
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (DIRECT_MODEL_REQUIRE.test(line)) {
        violations.push({ file: path.relative(ROOT, file), line: i + 1, text: line.trim() });
      }
    });
  }
}

if (violations.length) {
  console.error('\n✖ Tenant-isolation guard FAILED: direct model require() in request code.');
  console.error('  Use `const { X } = req.models;` inside the handler instead.\n');
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ${v.text}`);
  }
  console.error(`\n${violations.length} violation(s).\n`);
  process.exit(1);
}

console.log('✓ Tenant-isolation guard passed: no direct model requires in routes/controllers/middleware.');
process.exit(0);
