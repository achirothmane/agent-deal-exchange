# D1 — Actual Medusa source import evidence

Date: 2026-10-09.

## Source imported (verified)

- Upstream: https://github.com/medusajs/b2b-starter
- Pinned upstream SHA: `3ed7131d480ed4dbc8387bcc5f6cca606442d051`.
- Import target: `substrates/medusa-b2b/`.
- Import commit: `fc7da71515098d32143fa213c56c09b7e4bfb74d`.
- Commit first parent: `c36c0dcad80bab685064702acca250c540a15a32` (our bootstrap).
- Commit second parent: `3ed7131d480ed4dbc8387bcc5f6cca606442d051` (upstream source).
- Complete GitHub tree (recursive, not truncated): 976 entries under the source prefix, comprising 635 file blobs. This is not merely a README or a copy of source excerpts.
- Preserved root MIT license (`substrates/medusa-b2b/LICENSE`) and separate storefront MIT license (`substrates/medusa-b2b/apps/storefront/LICENSE`).
- Source-import workflow: https://github.com/achirothmane/agent-deal-exchange/actions/runs/37882863814 — SUCCESS.

## Scope of claim

**PASS: source import and direct Git ancestry.**

**UNKNOWN/PENDING: dependency license audit, actual runtime/HTTP tests, cross-customer authorization, payment handling, legally effective delegation, production release and commercial traction.**

Additional `.github/workflows/verify-medusa-baseline.yml` runs controlled dependency installation, backend build, and existing HTTP quote integration on a PostgreSQL service. Its result must be assessed independently. A passing import test is not sufficient to mark D1 complete.
