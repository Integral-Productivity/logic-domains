# 1. This repository holds Logic Domains and their catalog

Date: 2026-11-13

## Status

Accepted (2026-11-13).

## Context

The logical-thinking plugin holds the core method: the vocabulary and the CLR review. Its strategy says that added domains extend the core vocabulary and never change it. Its ADR 0001 also defined three concrete domains (Self-Organization, Product Lifecycle, Customer Progress), their source mappings, and ten competency questions. Those are content for one area of use, not core method. A decision about one check (the scope of CQ-09) showed that the domain owner, not the method, must make such choices.

Logic Domains also need a way to be shared and installed: in Flying Logic on a person's computer, and by other programs. The plan is a package model with marketplaces, like Claude plugins.

Options considered:

| Option | Outcome |
|---|---|
| A. Keep the domains in the plugin | Rejected: mixes content with method, against the plugin's strategy |
| B. Put the domains in a private business repository | Rejected: nobody outside could reuse them |
| C. One public repository for the Logic Domains and their catalog; the package manager in its own repository | Chosen |
| D. One public repository for the Logic Domains and the package manager | Rejected: couples domain releases with installer releases |

## Decision

1. This repository holds public Logic Domains, one folder each under `domains/`, each with a `logic-domain.json` manifest.
2. It holds the manifest schema (`schema/logic-domain.schema.json`) and the public marketplace index (`marketplace.json`).
3. The package manager (add, list, update, remove) lives in a separate repository. It is not built yet; it needs its own decision record.
4. Generic tree tools stay in the tool repository until the package manager exists.
5. Private Logic Domains live in their owners' repositories and are listed in private marketplaces. This repository never names them.
6. **The Flying Logic domain file is the source of class identity.** Each Logic Domain folder holds the `.xlogicd` file exported from Flying Logic (Entity > Export Selected Domain). Every class in it carries a hidden UUID, and trees link their entities to classes by that UUID. So the file is copied from Flying Logic and never generated: a generated file would carry new UUIDs, and importing it would add duplicate classes to existing trees. Two ways copy it: Entity > Export Selected Domain, or `scripts/extract-domain.mjs`, which copies the `<domain>` element out of a saved `.xlogic` tree. Both give the same bytes; a test holds the script to a real export. The `logic-domain.json` manifest names each class by its UUID and adds what the file cannot hold: the logical kind, the source record types, and later the checks. A CI check fails when the file and the manifest list different classes.
7. The term is "Logic Domain". "Domain" alone means the Flying Logic group of entity classes.

## Consequences

- The plugin supersedes its ADR 0001 and keeps only the extension contract: every class declares a logical kind, competency questions are acceptance tests, and the core evaluation set still passes with a Logic Domain loaded.
- Each Logic Domain needs a named owner, who decides changes such as the scope of a check.
- Until the package manager exists, people copy files by hand.

## Source

- Decided by the repository owner on 2026-11-13, in a design discussion on moving domains out of the logical-thinking plugin.
- [Flying Logic User Guide, Domains](https://docs.flyinglogic.com/user-guide/domains.html)
