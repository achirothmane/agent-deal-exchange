# Agent Deal Exchange

AI-native deal discovery, preference-aware matching, negotiation and verified deal outcomes.

**Project status — BOOTSTRAP (2026-10-09).** This repository is initialized with the project constitution and engineering contracts only. **No commerce framework, autonomous negotiator, production integration, or successful settlement is implemented or verified yet.**

## Why this exists

Give people and organizations the ability to delegate opportunity discovery and negotiation to software agents **within explicit human-controlled constraints**. The system is intended to start as an internal asset for our own projects, then be evaluated for commercial use when demand and measurable economic results exist. Do not preemptively limit the product to a single vertical.

A successful agent-to-agent negotiation is **not** a completed transaction. A deal is complete only after consent, required authorization, execution and independent outcome evidence.

## Project interfaces

- **Dots** — one central coordinator of the long-running portfolio; not an unrestricted payment or contracting authority.
- **Data Engine** — provenance-aware observations, identity and quality signals; not an implicit source of authority.
- **Marketing OS** — opt-in acquisition, attribution and lifecycle communication, separated from deal authorization.
- **Agent Deal Exchange** — buyer/seller preference boundaries, matching, offers, counteroffers, agreements, approval gates and settlement reconciliation.

## Engineering truth

Use the following labels strictly: `DESIGNED` (specified), `IMPLEMENTED` (code exists), `VERIFIED` (repeatable test evidence), `SHIPPED` (deployment evidence), `COMMERCIAL` (paid adoption or revenue evidence).

Every capability must document what it can do, assumptions, evidence, confidence, failure modes, falsification tests and an explicit boundary decision (KNOWN / UNKNOWN / AMBIGUOUS / CONFLICTING / REFUSED).

## Upstream evaluation

Candidate: [Medusa B2B Starter](https://github.com/medusajs/b2b-starter) (MIT), upstream revision `3ed7131d480ed4dbc8387bcc5f6cca606442d051`, checked 2026-10-09.

**The upstream source has NOT been imported, and this repository is NOT a GitHub fork.** If approved, import it as a separate Git history preserving the upstream license, notices and history rather than presenting this bootstrap as a completed hard fork.

## Immediate next work

1. Preserve architecture, provenance and negotiation invariants in reviewable docs.
2. Verify upstream fit and license, including all nested packages and distribution obligations.
3. Implement a bounded simulation with buyer and seller preferences, replayable offers, approval limits and adversarial tests.
4. Integrate the selected commerce substrate only after tests establish its value.
5. Test demand and economics before publishing or claiming market differentiation.

This is an independent repository with an independent release lifecycle under one Dots coordination model.
