# D1 — Medusa B2B Starter upstream-fit review

**Review date:** 2026-10-09  
**Upstream repository:** https://github.com/medusajs/b2b-starter  
**Pinned commit:** `3ed7131d480ed4dbc8387bcc5f6cca606442d051` (2026-10-02)  
**Disposition:** `CONDITIONAL_CANDIDATE` for commerce/quotes, **not adopted or imported**.

## Directly observed in pinned upstream source

| Capability | Evidence path at pinned revision | Observation |
|---|---|---|
| B2B quoting | `apps/backend/src/modules/quote/models/quote.ts` | Quote binds `customer_id`, `cart_id`, `draft_order_id`, `order_change_id`, status, messages |
| Conversation | `apps/backend/src/modules/quote/models/message.ts` | Quote messages support merchant/customer text |
| Buyer requests quote | `apps/backend/src/workflows/quote/workflows/create-request-for-quote.ts` | Cart becomes draft order; order edit and quote created |
| Merchant offer | `apps/backend/src/workflows/quote/workflows/merchant-send-quote.ts` | Changes quote status to `pending_customer` |
| Customer acceptance | `apps/backend/src/workflows/quote/workflows/customer-accept-quote.ts` | Verifies pending status, confirms staged order edit, converts draft order to `PENDING` |
| Customer read scoping | `apps/backend/src/api/store/quotes/[id]/route.ts` | GET filters by quote ID **and authenticated customer ID** |
| Customer acceptance entry | `apps/backend/src/api/store/quotes/[id]/accept/route.ts` | Forwards authenticated actor ID into workflow, then fetches quote by ID |
| Quote acceptance validation | `apps/backend/src/workflows/quote/steps/validate-quote-acceptance.ts` | Shown check is status `pending_customer`; cross-account authorization not established by this check |
| Existing HTTP tests | `apps/backend/integration-tests/http/quotes/quotes.spec.ts` | Create, GET, list, accept, reject, repeated-accept scenarios; no explicit cross-account acceptance case in inspected file |
| Approval workflow | `apps/backend/src/workflows/approval`, `apps/backend/src/api/store/approvals` | Reusable corporate approval features, not evidence of AI-specific agency |
| License | `LICENSE` at repo root | MIT text at upstream; full dependency/license audit not yet done |

### Key concerns requiring falsification, not vulnerability claims

1. **Quote ownership on mutating routes:** GET scopes ownership, but the inspected accept POST and acceptance step do not independently demonstrate an ownership check. Run a two-authenticated-customer negative test for accept, reject, message post, and cart ownership. **Security impact is not confirmed** until tested end-to-end.
2. **Agent authority:** authentication as a customer does not establish a revocable agent delegation with offer caps, allowed operations, expiry, terms hash or auditability.
3. **Preference confidentiality:** buyer maximum / seller minimum must not be disclosed to the counterparty or shared logs.
4. **Agreement ≠ payment:** quote acceptance moves to a pending order; it is not proof of payment, legal assent, delivery or settlement. Keep independently verifiable effect states.
5. **Lost acknowledgements and retries:** the inspected quote code does not establish externally verified exactly-once effects.
6. **Concurrency/price integrity:** test updated terms, repeated accept, racing accept/reject, taxes/shipping and currency changes.
7. **Practical installation:** `package.json` declares Node >=22.22.0 for root/backend, Medusa dependencies 2.21.2; PostgreSQL and pnpm required. Repo has substantial tracked source; not an importable single-library package.

## What was checked, and what was NOT

**Checked:** GitHub repository/revision, source tree, concrete quote & approval code paths, MIT root text, declared package versions, presence/coverage topics of existing HTTP tests.

**Not checked:** npm audit, nested license graph, full Medusa installation/build, database migrations, runtime tests, throughput, production security review, source-history import, real payments or actual AI-agent negotiation.

The development container cannot reach GitHub or package registries over DNS and has Node 22.16.0, below upstream's declared >=22.22.0. Do not call absence of runtime test a PASS. GitHub CI for our tiny *independent* simulator does not substitute for Medusa integration tests.

## Source-history-preserving import plan (not executed)

Keep `agent-deal-exchange` as the product repository. Evaluate upstream in a branch and import under `substrates/medusa-b2b` to avoid overwriting our constitution, without `--squash` (which would discard upstream history):

```bash
git clone https://github.com/achirothmane/agent-deal-exchange.git
cd agent-deal-exchange
git switch -c d1/medusa-source-import
git remote add medusa https://github.com/medusajs/b2b-starter.git
git fetch medusa main
git subtree add --prefix=substrates/medusa-b2b medusa main
# Check LICENSE, commits, nested dependencies and reproducible build.
# Open an import PR, never push directly to main.
```

Before invoking the command, confirm Medusa HEAD against the pinned reviewed SHA (or update the review). Subtree source imports retain upstream ancestry in the merge history if done without `--squash`. Review actual history after import.

**Gate to ADOPT:** scoped install/test CI, two-account authorization tests, adapter proof, license/dependency audit, reproducible provenance; otherwise KEEP_EVALUATING or REJECT.

## Non-substrate work

A deterministic, dependency-free simulation can validate our proposed preference / negotiation boundary contracts **independently of Medusa**. It must never be confused with functional upstream verification or real transaction execution.
