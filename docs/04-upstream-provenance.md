# Upstream Evaluation and Source Provenance

**Import state: NOT IMPORTED.** No third-party source code has been copied into this repository.

## Candidate

- Name: Medusa B2B Starter
- Repository: https://github.com/medusajs/b2b-starter
- Inspected main revision: `3ed7131d480ed4dbc8387bcc5f6cca606442d051` (2026-10-02)
- License at upstream root: MIT
- Feature claims from upstream README: companies, staff roles, spending limits, approval workflows, negotiable quotes with messaging, order editing, cart, checkout and promotions
- Stack: Medusa backend plus Next.js storefront; monorepo contains `apps/backend` and `apps/storefront`
- All transitive license obligations and runtime tests: **NOT VERIFIED**

## Candidate decision

**EVALUATE**, not **ADOPT**. It is a good commerce/quote baseline, but has not been shown to implement agent-to-agent bargaining, verified preferences, payment settlement or a general exchange network.

## Correct future import

Retain source lineage and preserve upstream MIT copyright/license notices. Preferred procedure for a hard fork is to fetch and import actual Git history from upstream, not copy selected files without provenance. This bootstrap README creates separate history, so merging histories will require a deliberate, reviewed integration commit (e.g. `--allow-unrelated-histories`), rather than rewriting or hiding project history.

Before import:
1. Reconfirm upstream HEAD, technical dependencies and nested licenses.
2. Verify reproducible install/build/tests in a controlled environment.
3. Document portability, feature gaps and data ownership.
4. Preserve this repository's constitution / decision register.
5. Import to a separate branch, inspect the diff and review the merge.
6. Mark `SOURCE_IMPORTED` only after actual verified Git commits.

No assumption of free hosted compute, payment processing, trust/escrow infrastructure or third-party API credits.
