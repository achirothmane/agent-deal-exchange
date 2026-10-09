# Deal Protocol v0 — Boundary Contract

Status: **DESIGNED**. This is a protocol proposal; no runtime implementation yet.

## Identity and preference scope

A `deal_id` binds a buyer principal, seller principal, market/offer context, currency and timestamp. Each principal has a scoped authority document with version, issuer, explicit action allowlist, cap, expiry and revocation state.

An individual agent may receive private constraints; these **must never leak** to its counterparty unless consented by the principal. Do not put reserve prices or private customer information into shared negotiations, logs or generated public reports.

Each preference has source, confidence, validity period, hard vs soft flag, and an explicit user-confirmed value where available. Missing critical preferences give UNKNOWN, never an invented willingness to pay.

## Independent state dimensions

**Negotiation phase**:
`DISCOVERY` → `QUALIFIED` → `NEGOTIATING` → `TENTATIVE` → `AUTHORIZED`; terminal `REJECTED`, `EXPIRED`, `CANCELLED`, `DISPUTED`.

**Effect phase**:
`NOT_REQUESTED` → `RESERVED` → `SUBMITTED` → `CONFIRMED` or `REJECTED` or `UNKNOWN` or `CONFLICTING`.

Agreement ≠ approval. Approval ≠ submitted order. Submitted order ≠ paid. Payment accepted ≠ delivered. Keep proof for each independently.

## Proposed immutable offer envelope

```json
{
  "protocol_version": "0.1",
  "deal_id": "deal_001",
  "offer_id": "offer_003",
  "prior_offer_id": "offer_002",
  "proposer_principal_id": "seller_001",
  "recipient_principal_id": "buyer_001",
  "item_reference": "catalog_item_007",
  "quantity": 1,
  "currency": "USD",
  "total_minor_units": 7200,
  "terms_ref": "sha256:REPLACE_WITH_REAL_DIGEST",
  "expires_at": "2026-10-10T12:00:00Z",
  "authority_ref": "delegation_seller_v1",
  "evidence_refs": [],
  "negotiation_phase": "NEGOTIATING"
}
```

The envelope alone does **not** authorize payment, establish a legal contract or attest that the offer was delivered. A real terms digest must be computed over a canonical representation; example placeholder above must never pass validation.

## Mandatory invariants

1. Currency, units, tax, delivery, expiry and total terms must be unambiguous; no silent currency conversion or hidden fees.
2. Expired/revoked/unknown authority cannot permit binding execution.
3. Buyer cap and seller minimum are local private constraints; never automatically disclosed to the counterparty.
4. Duplicate offer IDs with different payloads are CONFLICTING.
5. Repeat requests with the same idempotency key must not duplicate external actions.
6. Unknown acknowledgement cannot be treated as failed execution; reconcile against the destination first.
7. A tentative agreement must reference exactly the terms each principal accepted.
8. All approvals have an explicit scope, terms digest, expiry and authorized human principal.
9. Claims about payment, delivery, refunds or settlement require destination-provided evidence.
10. Agents cannot impersonate or create artificial market liquidity to manipulate prices.

## Break cases (falsification)

- Altered offer digest after approval.
- Buyer cap breached using fees or currency conversion.
- Missing preference → fabricated acceptance.
- Agent makes counteroffer after authority revocation.
- Race: two offers accepted simultaneously.
- Webhook arrives twice or before HTTP acknowledgement.
- Provider times out after committing the order.
- Seller falsely claims shipment/payment.
- Expired quote replayed with new identity.
- A model attempts to disclose the counterparty's confidential limit.
- Provider source data changes between discovery and offer approval.

All require deterministic expected boundaries, not just a happy-path pass.
