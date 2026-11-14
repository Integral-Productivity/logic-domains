#!/usr/bin/env node
// Copies Flying Logic domains out of a saved .xlogic tree into .xlogicd files. Node.js 20+, no packages.
//
// Usage: node scripts/extract-domain.mjs <tree.xlogic>
//
// For each Logic Domain in marketplace.json whose flying_logic.domain_name is in the tree, it writes
// domains/<name>/<domain_file>. The output is the tree's <domain> element, unchanged, with the XML
// header and version attributes that Entity > Export Selected Domain adds. So it is the same file the
// export writes, with the same class UUIDs. It copies; it never makes new classes or UUIDs.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function extractDomains(xml) {
  const root = xml.match(/<flyingLogic\b[^>]*\bmajorVersion="(\d+)"[^>]*\bminorVersion="(\d+)"/);
  if (!root) throw new Error('not a Flying Logic tree: no <flyingLogic> element with a version');
  const [, major, minor] = root;
  const out = new Map();
  for (const [block] of xml.matchAll(/<domain>[\s\S]*?<\/domain>/g)) {
    const name = block.match(/<attributes>\s*<attribute class="java\.lang\.String" key="name">([^<]*)</)?.[1];
    if (!name) continue;
    const file = '<?xml version="1.0" encoding="UTF-8"?>' +
      block.replace('<domain>', `<domain majorVersion="${major}" minorVersion="${minor}">`) + '\n';
    out.set(name, file);
  }
  return out;
}

const isMain = process.argv[1] && new URL(import.meta.url).pathname === process.argv[1];
if (isMain) {
  const tree = process.argv[2];
  if (!tree) {
    console.error('usage: node scripts/extract-domain.mjs <tree.xlogic>');
    process.exit(2);
  }
  const root = new URL('..', import.meta.url).pathname;
  const domains = extractDomains(readFileSync(tree, 'utf8'));
  const marketplace = JSON.parse(readFileSync(join(root, 'marketplace.json'), 'utf8'));
  for (const pkg of marketplace.packages) {
    const m = JSON.parse(readFileSync(join(root, pkg.source.path, 'logic-domain.json'), 'utf8'));
    const file = domains.get(m.flying_logic.domain_name);
    if (!file) {
      console.log(`skip ${pkg.name}: no domain "${m.flying_logic.domain_name}" in the tree`);
      continue;
    }
    writeFileSync(join(root, pkg.source.path, m.flying_logic.domain_file), file);
    console.log(`wrote ${join(pkg.source.path, m.flying_logic.domain_file)}`);
  }
}
