# Architecture and Integration Boundaries

Status: **DESIGNED**. No live services or links have been verified.

```text
             Dots (single portfolio coordinator)
                         |
       +-----------------+------------------+
       |                 |                  |
  Marketing OS       Data Engine     Agent Deal Exchange
  acquisition        evidence        deal domain authority
  opt-in CRM         source truth          |
       |                 |          preference intake
       +-------> boundary APIs <----+     |
                                    v     v
                             identity / eligibility
                                    |
                             matching / discovery
                                    |
                              negotiated offers
                                    |
                          tentative agreement
                                    |
                        human approval / authority
                                    |
                         commerce / payment adapter
                                    |
                      verification and reconciliation
```

## Internal domain modules

1. **Principal / Authority**: identity, permissions, consent, delegation policy, expiry and ceilings.
2. **Preferences**: elicitation, item attributes, constraints, hard vs soft preferences, private valuations and evidence of user intent.
3. **Opportunity Discovery**: candidate listing, availability, price provenance and refresh dates.
4. **Matching**: candidate scoring with confidence and disqualification reasons; no unverified claims.
5. **Negotiation**: offer versions, timeouts, counteroffers, deadlines, transcript and private-state isolation.
6. **Agreement**: immutable terms digest, two-party acknowledgement, nonbinding vs authorized distinction.
7. **Effects**: commerce-adapter commands with idempotency keys; pending / known / unknown outcomes.
8. **Reconciliation**: destination evidence of orders, payments, refunds, delivery or cancellation; conflict handling.
9. **Economics**: savings vs measured counterfactual, gross margin, fees, conversion, repeat usage and unit cost.
10. **Observability**: trace IDs, privacy-safe audit trail and simulation replay.

## Upstream candidate

Medusa B2B Starter (MIT) is **under evaluation**, not imported. Existing quotes, company management, approvals, cart/checkout and order functionality may reduce the commerce infrastructure work. Its quote workflow is **not proof** that it supports autonomous two-sided bargaining or externally auditable settlement.

Use an adapter boundary for commerce so the domain protocol is not tightly coupled to Medusa. Investigate how offers/quotes work in its backend before deciding what to reuse or replace.

## Data-sharing contracts

- Marketing OS can supply properly consented lead acquisition and attribution events; no marketing system may authorize or conclude a deal.
- Data Engine supplies source-bound observations and quality/conflict signals; it does not determine legal identities or approve transactions by itself.
- Dots can supervise experiments and review evidence; no generic delegated authority over user funds.
- Integration contracts require schema version, idempotency key, source provenance, privacy scope, correlation ID, and error/unknown semantics.

## Execution design

Start with replayable deterministic negotiation simulation; evaluate Temporal only when durable distributed side effects are actually involved. Do not make a separate generic agent runtime. Prefer built-in primitives from existing approved tools where feasible.

## Human ownership

The human owner defines budgets, legally binding thresholds, allowed counterparties, privacy and acceptable risk. If terms diverge, approval expires or evidence conflicts, the system stops / escalates rather than extrapolating.
