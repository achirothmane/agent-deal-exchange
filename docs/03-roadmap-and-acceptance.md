# Roadmap, Tests and Economic Acceptance

Project status as of 2026-10-09: **BOOTSTRAP**. No stages have verified runtime results.

| Gate | Deliverable | Acceptance evidence | Status |
| --- | --- | --- | --- |
| D0 | Constitution, architecture, deal protocol | Reviewable contracts in Git | DESIGNED |
| D1 | Upstream evaluation | License dependency audit, deployment smoke, feature gap map, pinned SHA | NOT STARTED |
| D2 | Negotiation simulator | Replayable buyer/seller trials, no real payments | NOT STARTED |
| D3 | Boundary and falsification | Deterministic caps/expiry/replay/identity/private-data tests | NOT STARTED |
| D4 | Commerce adapter | Verified Medusa quote/order API with idempotency and unknown-effect reconciliation | NOT STARTED |
| D5 | Dots / Data Engine / Marketing OS integration | Versioned contracts and scoped permission tests | NOT STARTED |
| D6 | Real user validation | Consenting test users, preference accuracy, regret rate, failed deal reasons | NOT STARTED |
| D7 | Small commercial experiment | Actual transaction or paid pilot evidence, margin net of expenses | NOT STARTED |

## Initial experimental questions

- How often does an agent correctly infer **hard** constraints, not merely rank items?
- What is the agreement rate, and how often are negotiations mutually beneficial *after* fees/time?
- Does automation save human time without increasing regret or unexpected commitments?
- How often are negotiations abandoned due to incomplete information?
- What is the cost per verified eligible negotiation and per completed transaction?
- Does the system exhibit unwanted strategic behavior or preference leakage?
- What is genuinely different from incumbent quote/approval and procurement software?

## Minimal metrics

`qualified_opportunities`, `negotiations_started`, `tentative_agreements`, `human_approved`, `effect_confirmed`, `unknown_effects`, `disputes`, `total_agent_cost`, `incremental_savings_evidence`, `attributable_revenue`, `net_contribution`.

Use verified net contribution, rather than transaction gross merchandise value, to characterize economic success.

## Build / kill logic

- Do not develop a settlement engine without a confirmed legal/payment provider integration need.
- If a standard Medusa quote flow suffices, adopt it instead of replacing it.
- If preference inference cannot beat a baseline manual workflow on actual user constraints, stop autonomous negotiation claims.
- Do not sell or publicly differentiate until there is buyer validation and Competitive Freshness evidence.

## Handoff

First engineering task is **D1**: inspect the Medusa B2B Starter backend and quote + approval extension points; run reproducible smoke tests; record evidence and gap decision. The current empty repository must not be represented as a fork or tested system.
