# D1 — Medusa HTTP integration verified checkpoint

Verification date: 2026-10-09

## Provenance
- Repository: `achirothmane/agent-deal-exchange`
- Head commit tested: `cf54454296a74ef18edad29bcc7f8fc6e0e9b23f`
- Upstream source imported preserving original parent: `3ed7131d480ed4dbc8387bcc5f6cca606442d051`
- Actions run: https://github.com/achirothmane/agent-deal-exchange/actions/runs/37885785705
- Job: `113675365401`
- Command: `TEST_TYPE=integration:http NODE_OPTIONS=--experimental-vm-modules pnpm exec jest integration-tests/http/quotes/quotes.spec.ts --runInBand --forceExit`
- Environment: Node 22.22.0, PostgreSQL 15, pnpm 9.15.0.
- Result: **1 passing suite; 8 tests passed; 0 failed**.
- Frozen pnpm install and imported backend build also passed in the run.

## Verified behavior
- A customer can request a quote from a valid cart; draft order and quote are created.
- Customer quote retrieval (single and listing) is scoped.
- Merchant can send the quote; the customer can accept, resulting in pending order.
- Acceptance after already accepted is rejected.
- Customer rejects a quote.
- A second authenticated customer cannot read, preview, accept, reject or post a message to the first customer's quote. The original quote remains in pending state, and the true customer can later accept it.
- Store mutation/read routes now enforce a direct quote -> authenticated customer binding.

## Boundary / warning
The ownership test is scoped to **one quote, two authenticated users, and these five operations**. It is not a comprehensive authorization or concurrency security audit. A failed multi-customer test before hardening should be responsibly triaged with upstream if independently reproduced, not published as an exploit.

No tests of:
- cart ownership at quote creation; business/company memberships and delegated agents;
- quote/price editing, concurrent accept/reject, lost acknowledgement reconciliation, payment, refunds or delivery;
- package dependency license closure, supply chain vulnerabilities, throughput or production durability;
- AI preference inference, bargaining, human approval or real commercial acceptance.

## Corrected CI environment / old test fixtures
- Used `localhost` as test host to avoid Medusa test runner's unintended SSL driver branch for `127.0.0.1`.
- Set `DB_*` credentials for temporary PostgreSQL databases used by Medusa integration test utilities.
- Explicitly published test products via administrative update before creating the cart, rather than assuming product creation publishes.
- Removed obsolete `difference_sum` test assertion; summary's `current_order_total`, `original_order_total`, `pending_difference` and other amount checks remain.
- Added pipeline concurrency cancellation.

## Gate
**D1_SOURCE_IMPORTED = PASS**.
**D1_BACKEND_BUILD = PASS**.
**D1_SCOPED_QUOTES_HTTP = PASS (8/8)**.
**D1_FULL_ADOPTION = BLOCKED** pending cart ownership, delegated authority, nested licensing and concurrency/effects tests.
**PRODUCTION / COMMERCIAL = UNVERIFIED**.

Keep import PR in DRAFT until remaining adoption obligations are decided and tested.
