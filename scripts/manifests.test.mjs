// Checks every Logic Domain manifest and the marketplace index. Node.js 20+, no packages.
// It applies the rules of schema/logic-domain.schema.json that matter today, plus rules a schema cannot state.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const schema = read('schema/logic-domain.schema.json');
const marketplace = read('marketplace.json');
const KINDS = schema.properties.classes.items.properties.kind.enum;
const SRC = new RegExp(schema.properties.classes.items.properties.src_types.items.pattern);
const TOP = Object.keys(schema.properties);
const CLASS_KEYS = Object.keys(schema.properties.classes.items.properties);

test('marketplace lists unique packages that exist', () => {
  const names = marketplace.packages.map((p) => p.name);
  assert.equal(new Set(names).size, names.length, 'duplicate package names');
  for (const p of marketplace.packages) {
    assert.ok(existsSync(join(root, p.source.path, 'logic-domain.json')), `${p.name}: no logic-domain.json at ${p.source.path}`);
  }
});

for (const pkg of marketplace.packages) {
  const m = read(join(pkg.source.path, 'logic-domain.json'));
  test(`${pkg.name}: manifest follows the schema`, () => {
    for (const key of schema.required) assert.ok(key in m, `missing ${key}`);
    for (const key of Object.keys(m)) assert.ok(TOP.includes(key), `unknown field ${key}`);
    assert.equal(m.name, pkg.name, 'name differs from the marketplace entry');
    assert.match(m.name, new RegExp(schema.properties.name.pattern));
    assert.match(m.version, new RegExp(schema.properties.version.pattern));
    assert.ok(schema.properties.status.enum.includes(m.status), `bad status ${m.status}`);
    const seen = new Set();
    for (const c of m.classes) {
      for (const key of Object.keys(c)) assert.ok(CLASS_KEYS.includes(key), `${c.name}: unknown field ${key}`);
      assert.ok(KINDS.includes(c.kind), `${c.name}: bad kind ${c.kind}`);
      assert.ok(!seen.has(c.name), `${c.name}: duplicate class`);
      seen.add(c.name);
      for (const s of c.src_types ?? []) assert.match(s, SRC, `${c.name}: bad src_type ${s}`);
    }
  });
  test(`${pkg.name}: an accepted Logic Domain has an owner and no unassigned kind`, () => {
    const gaps = m.classes.filter((c) => c.kind === 'unassigned').map((c) => c.name);
    if (m.status !== 'accepted') {
      if (gaps.length) console.log(`# ${pkg.name}: ${gaps.length} class(es) without a logical kind: ${gaps.join(', ')}`);
      return;
    }
    assert.ok(m.owner, 'no owner');
    assert.deepEqual(gaps, [], 'classes without a logical kind');
  });
}

test('class names are unique across Logic Domains', () => {
  const where = new Map();
  for (const pkg of marketplace.packages) {
    for (const c of read(join(pkg.source.path, 'logic-domain.json')).classes) {
      assert.ok(!where.has(c.name), `${c.name} is in ${where.get(c.name)} and ${pkg.name}`);
      where.set(c.name, pkg.name);
    }
  }
});
