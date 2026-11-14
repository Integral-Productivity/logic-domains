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
const UUID = new RegExp(schema.properties.classes.items.properties.uuid.pattern);
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
      assert.match(c.uuid ?? '', UUID, `${c.name}: bad uuid`);
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

  test(`${pkg.name}: the Flying Logic domain file matches the manifest`, (t) => {
    const file = join(root, pkg.source.path, m.flying_logic.domain_file);
    if (!existsSync(file)) {
      if (m.status === 'accepted') assert.fail(`missing ${m.flying_logic.domain_file}`);
      t.skip(`${m.flying_logic.domain_file} not exported yet`);
      return;
    }
    const xml = readFileSync(file, 'utf8');
    const domain = xml.match(/key="name">([^<]*)</);
    assert.equal(domain?.[1], m.flying_logic.domain_name, 'domain name differs');
    const found = new Map();
    for (const block of xml.split('<entityClass>').slice(1)) {
      const uuid = block.match(/key="uuid">([^<]*)</)?.[1];
      const name = block.match(/key="name">([^<]*)</)?.[1];
      if (uuid) found.set(uuid, name);
    }
    const listed = new Map(m.classes.map((c) => [c.uuid, c.name]));
    assert.deepEqual([...found].sort(), [...listed].sort(), 'classes in the .logic-d file differ from the manifest');
  });
}

test('class uuids are unique across Logic Domains', () => {
  const seen = new Set();
  for (const pkg of marketplace.packages) {
    for (const c of read(join(pkg.source.path, 'logic-domain.json')).classes) {
      assert.ok(!seen.has(c.uuid), `${c.name}: duplicate uuid ${c.uuid}`);
      seen.add(c.uuid);
    }
  }
});

test('class names are unique across Logic Domains', () => {
  const where = new Map();
  for (const pkg of marketplace.packages) {
    for (const c of read(join(pkg.source.path, 'logic-domain.json')).classes) {
      assert.ok(!where.has(c.name), `${c.name} is in ${where.get(c.name)} and ${pkg.name}`);
      where.set(c.name, pkg.name);
    }
  }
});
