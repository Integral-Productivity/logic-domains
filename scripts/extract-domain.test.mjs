// The extract must write the same bytes as Flying Logic's own domain export.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extractDomains } from './extract-domain.mjs';

const fixture = (f) => readFileSync(new URL(`fixtures/${f}`, import.meta.url), 'utf8');

test('extract equals the Flying Logic export of the same domain', () => {
  const domains = extractDomains(fixture('tree.xlogic'));
  assert.equal(domains.get('Self-Organization'), fixture('export-self-organization.xlogicd'));
});

test('a file that is not a Flying Logic tree is refused', () => {
  assert.throws(() => extractDomains('<other/>'), /not a Flying Logic tree/);
});
