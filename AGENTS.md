# Agent Deal Exchange — Agent Operating Rules

One Dots coordinates the portfolio. This repository owns independent engineering history and cannot inherit verified status from another repository.

## First actions for any development agent

1. Read `README.md` and `docs/00-constitution.md` through `docs/04-upstream-provenance.md`.
2. Inspect the actual Git HEAD and work tree. Never assume upstream code is already installed.
3. Consult project-stage evidence; distinguish DESIGNED, IMPLEMENTED, VERIFIED, SHIPPED and COMMERCIAL.
4. Preserve privacy boundaries, authority scope, provenance, auditability and real-world effect reconciliation.
5. Produce a narrow reviewable PR with falsification tests and traceable results. Do not merge unverifiable claims.

## Stop rules

- Never make binding contracts or authorize money movement without explicit scoped human approval.
- Never infer order, payment, delivery or settlement success from negotiation agreement.
- On lost acknowledgement, check provider postconditions before any replay; UNKNOWN is a first-class outcome.
- Do not send bulk unsolicited emails or impersonate counterparties.
- Do not attempt to build a generic agent orchestration platform; integrate with existing Dots and use domain-specific contracts.
- Do not narrow the long-term product to one industry prematurely, but keep each experimental test small and measurable.

## Definition of done

A capability is complete only when its preconditions, evidence, boundary, failure cases and falsification tests are recorded, the implementation is merged, and repeatable verification is linked to a known commit. A financial claim requires actual transaction/provider evidence and costs.
