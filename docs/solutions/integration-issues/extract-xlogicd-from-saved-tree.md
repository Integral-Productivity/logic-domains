---
title: Get a Flying Logic domain file from a saved tree, not from an old export
date: 2026-11-14
category: integration-issues
tags: [flying-logic, xlogicd, logic-domain, export, drift]
related:
  - docs/adr/0001-this-repository-holds-logic-domains-and-their-catalog.md
  - scripts/extract-domain.mjs
---

# Get a Flying Logic domain file from a saved tree, not from an old export

## Problem

Each Logic Domain needs a `.xlogicd` file. The file holds the domain's entity classes and their UUIDs. Trees link to classes by these UUIDs, so the file must be copied from Flying Logic and never generated.

Two traps came up when this repo was bootstrapped:

1. The extension is `.xlogicd`. It is not `.logic-d`, which an early draft used.
2. An export file found in a Downloads folder was stale. One class (UUID `7a17aa6c…`) was named "Action" in the export and "Next Action" in the current tree. A stale export looks valid, so nobody notices.

Flying Logic has no AppleScript support for the domain export. Scripting the menus would break when the UI changes.

## Solution

A `.xlogicd` file is the tree's `<domain>` element, with:

- the line `<?xml version="1.0" encoding="UTF-8"?>` first,
- `majorVersion` and `minorVersion` attributes copied from the `<flyingLogic>` root element,
- a trailing newline.

`scripts/extract-domain.mjs` copies the block from a saved `.xlogic` tree:

```sh
node scripts/extract-domain.mjs path/to/tree.xlogic
```

It writes `domains/<name>/<domain_file>` for each package in `marketplace.json` whose `flying_logic.domain_name` is in the tree. `scripts/extract-domain.test.mjs` proves the output is byte-identical to a real menu export (`scripts/fixtures/export-self-organization.xlogicd`).

## Prevention

- Take the domain from the tree that is the source of truth (in git), not from an export file of unknown age.
- `scripts/manifests.test.mjs` compares the classes in each `.xlogicd` with `logic-domain.json`, matched by UUID. A renamed class fails CI.
- When a class changes in the tree, run the extract script again and commit both files together.
