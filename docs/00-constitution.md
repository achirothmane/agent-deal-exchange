# Agent Deal Exchange — Constitution

Status: **DESIGNED**, not implemented. Date: 2026-10-09.

## Objective

Build a general-purpose AI-native deal operating system that discovers opportunities, elicits real preferences, matches counterparties, negotiates within delegated boundaries, and verifies deal outcomes. First use it ourselves, as a compounding owned asset. Expand to paying customers only after credible evidence of demand and a viable distribution and cost model.

Do not equate: technical sophistication = customer demand, expressed willingness to pay = payment, an offer accepted = a completed order, or a payment submitted = a settled payment.

## Authority and safety

- One **Dots** coordinates the long-running portfolio; each product retains separate code, data, contracts, releases and evidence.
- Buyer and seller agents are separate principals, with separate permissions, budgets and information visibility.
- Agents may propose, search, rank and negotiate when authorized; they **must not** execute binding commitments, move money, spend above caps or reveal reserved prices without explicit scoped authority.
- No fabricated counterparties, deceptive impersonation, unsolicited bulk marketing, nonconsensual personal data enrichment or undisclosed agent identity.
- Expose uncertainty: `KNOWN`, `UNKNOWN`, `AMBIGUOUS`, `CONFLICTING`, `REFUSED`. Unknown execution effect must not be assumed failed or retried blindly.
- Every meaningful capability carries preconditions, observations, reasoning/evidence references, decision, confidence or limitations, known failure modes, and falsification tests.
- Separation of private valuation limits and public negotiation transcript is a mandatory information boundary.
- Never claim human acceptance, legal enforceability, shipping, payment, escrow or delivery without destination-specific evidence.

## Competitive Freshness Gate

Before positioning as a differentiated product, answer using recent evidence:
1. What do strong incumbents do today?
2. Is the claimed novelty already an incumbent feature?
3. What measurable difference do we deliver?
4. Does a buyer care and have purchasing authority/budget?

## Acceptance labels

- DESIGNED: documented intent / contract only
- IMPLEMENTED: changes landed in a named repository commit
- VERIFIED: repeatable tests tied to a concrete commit/environment
- SHIPPED: independently observable live deployment
- COMMERCIAL: verified paid customer or attributable actual revenue

## Scope

Do not narrow prematurely to procurement, SaaS licenses, consumer resale or a single market. However, start testing in a legally and technically bounded environment with clear budgets, human consent and measurable outcomes. Broaden only with supporting evidence.
