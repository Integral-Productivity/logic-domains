# Logic Domains

A **Logic Domain** is a reusable set of entity classes for logic trees (Goal Tree, Current Reality Tree, Future Reality Tree, Prerequisite Tree). Each Logic Domain gives:

- the classes, and the **logical kind** of each class (effect, action, precondition, obstacle or indicator), so a review can read the kind and not the class name;
- the source record types each class can mirror (`src_type`);
- later: a Flying Logic domain file (`.logic-d`), checks, and scripts tuned to the domain.

"Domain" is the [Flying Logic term](https://docs.flyinglogic.com/user-guide/domains.html) for a group of entity classes. "Logic Domain" adds the qualifier so the term is not confused with a governance domain (for example a Holacracy domain).

## What this repository holds

| Holds | Does not hold |
|---|---|
| Public Logic Domains, one folder each under `domains/` | The package manager (a separate repository, later) |
| The manifest schema, `schema/logic-domain.schema.json` | Generic tree tools (outline, core structure checks) |
| The public marketplace index, `marketplace.json` | Private Logic Domains (they live in their owners' repositories) |
| Decision records, `docs/adr/` | The core method and CLR review (the logical-thinking plugin) |

See [ADR 0001](docs/adr/0001-this-repository-holds-logic-domains-and-their-catalog.md).

## Logic Domains

| Logic Domain | Status |
|---|---|
| [Self-Organization](domains/self-organization/) | Proposed |
| [Product Lifecycle](domains/product-lifecycle/) | Proposed |
| [Customer Progress](domains/customer-progress/) | Proposed |
| [Adaptive Cycle Mapping](domains/adaptive-cycle-mapping/) | Proposed |

The first three model the path from commitment to outcome. Adaptive Cycle Mapping marks where a system sits in its adaptive cycle. See [ADR 0002](docs/adr/0002-logic-domains-model-commitment-to-outcome.md).

## Check the manifests

```sh
node --test scripts/*.test.mjs
```

The check needs Node.js 20 or later and no packages.
