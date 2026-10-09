# D1 / D2 experimental evidence checkpoint — 2026-10-09

## Independently verified in GitHub Actions

- Repository: `achirothmane/agent-deal-exchange`
- Branch: `d1/upstream-fit-and-negotiation-sim`
- Source SHA verified: `edbfe8be8ba8bf05ab1291579014f6bcde6da35c`
- Workflow run: https://github.com/achirothmane/agent-deal-exchange/actions/runs/37882722867
- Job ID: `113665816882`
- Runner action: `node --test prototype/deal-sim/engine.test.mjs`
- Result: **9 tests, 9 pass, 0 fail**.
- Scope: independent *in-memory* negotiation prototype, no side effects or commerce dependencies.

## Claims admitted

- Deterministic local negotiation simulation has bounded price, time, proposal-parent, term-hash, and delegation checks exercised by reproducible tests.
- Both simulated principals must acknowledge the same latest offer for `TENTATIVE`.
- External-effect state remains `NOT_REQUESTED`.

## Claims blocked / unknown

- The code does **not** independently authenticate the `actor` supplied by the caller.
- The code does **not** derive trusted time, store durable authorization, secure agent prompts or ensure network concurrency.
- Delegation revocation, taxes, shipping, escrow, legal agreement, payment, order placement and outcome reconciliation are **not implemented**.
- Medusa's install/build/integration tests and cross-customer authorization checks are **NOT VERIFIED**.
- Full Medusa source and its git history are **NOT IMPORTED**.
- Market demand, subscription revenue and completed business deals are **NOT VERIFIED**.

## Next action

Conduct upstream Medusa source-history import and integration tests in an environment with GitHub/network access, PostgreSQL, pnpm and a compatible Node version, then implement two-account negative tests for quote-changing routes. Do not mark D1 PASS before those gates.
