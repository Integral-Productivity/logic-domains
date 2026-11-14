# Adaptive Cycle Mapping

Status: Proposed. Owner: not named yet.

The classes are the phases of the adaptive cycle from panarchy theory: growth or exploitation (Γ), conservation (Κ), collapse or release (Ω), reorganization (α), and an exit from the cycle (χ). They are in [logic-domain.json](logic-domain.json).

Open question: a phase describes the state of a system, not a cause or an effect. So no class has a logical kind yet (`unassigned`). The owner decides if the phases map to logical kinds or stay as tags on other entities.

The Flying Logic domain file is [adaptive-cycle-mapping.xlogicd](adaptive-cycle-mapping.xlogicd). It is copied from the source tree with `node scripts/extract-domain.mjs <tree.xlogic>`, or exported from Flying Logic with Entity > Export Selected Domain. To change a class, change it in Flying Logic, save the tree, and copy the file again. Do not edit or generate it: its class UUIDs keep existing trees linked.

Not here yet: checks and scripts.
