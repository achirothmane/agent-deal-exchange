import test from "node:test";
import assert from "node:assert/strict";
import { BoundaryError, NegotiationSandbox } from "./engine.mjs";

const make = (overrides = {}) => new NegotiationSandbox({
  dealId: "deal-1",
  currency: "USD",
  buyer: { maxMinor: 8000, validUntil: 900, can: ["propose", "acknowledge"] },
  seller: { minMinor: 6500, validUntil: 900, can: ["propose", "acknowledge"] },
  opensAt: 0,
  expiresAt: 1000,
  ...overrides,
});

const bad = (fn, boundary, code) => assert.throws(fn,
  e => e instanceof BoundaryError && e.boundary === boundary && e.code === code);

test("buyer and seller negotiate and produce only a tentative agreement", () => {
  const n = make();
  const a = n.propose({ actor: "seller", offerId: "o1", amountMinor: 9000, currency: "USD", now: 10 });
  const b = n.propose({ actor: "buyer", offerId: "o2", priorOfferId: a.offerId, amountMinor: 7000, currency: "USD", now: 20 });
  const c = n.propose({ actor: "seller", offerId: "o3", priorOfferId: b.offerId, amountMinor: 7500, currency: "USD", now: 30 });
  const first = n.acknowledge({ actor: "buyer", offerId: "o3", termsDigest: c.termsDigest, now: 40 });
  assert.equal(first.phase, "NEGOTIATING");
  const second = n.acknowledge({ actor: "seller", offerId: "o3", termsDigest: c.termsDigest, now: 41 });
  assert.equal(second.phase, "TENTATIVE");
  assert.equal(n.publicState().effectPhase, "NOT_REQUESTED");
  assert.equal(n.publicState().offers.length, 3);
  assert.equal(typeof n.submitPayment, "undefined");
  assert.equal(typeof n.placeOrder, "undefined");
});

test("buyer and seller enforce private price boundaries independently", () => {
  const n = make();
  const a = n.propose({ actor: "seller", offerId: "high", amountMinor: 9000, currency: "USD", now: 10 });
  bad(() => n.acknowledge({ actor: "buyer", offerId: "high", termsDigest: a.termsDigest, now: 11 }), "REFUSED", "buyer_local_limit");
  bad(() => n.propose({ actor: "buyer", offerId: "bad-buyer", priorOfferId: "high", amountMinor: 8500, currency: "USD", now: 12 }), "REFUSED", "buyer_local_limit");
  n.propose({ actor: "buyer", offerId: "low", priorOfferId: "high", amountMinor: 6300, currency: "USD", now: 13 });
  const state = JSON.stringify(n.publicState());
  assert.equal(state.includes("maxMinor"), false);
  assert.equal(state.includes("minMinor"), false);
  assert.equal(state.includes("6500"), false);
  assert.equal(state.includes("8000"), false);
  const low = n.publicState().offers.at(-1);
  bad(() => n.acknowledge({ actor: "seller", offerId: "low", termsDigest: low.termsDigest, now: 14 }), "REFUSED", "seller_local_limit");
});

test("same offer id with same payload is idempotent; divergent payload is conflicting", () => {
  const n = make();
  const opts = { actor: "seller", offerId: "o1", amountMinor: 7600, currency: "USD", now: 1 };
  const a = n.propose(opts);
  assert.deepEqual(n.propose({ ...opts, now: 3 }), a);
  assert.equal(n.publicState().offers.length, 1);
  bad(() => n.propose({ ...opts, amountMinor: 7800 }), "CONFLICTING", "offer_id_payload_changed");
});

test("stale offer ancestry and two consecutive proposals by the same actor are refused", () => {
  const n = make();
  n.propose({ actor: "buyer", offerId: "o1", amountMinor: 7000, currency: "USD", now: 1 });
  bad(() => n.propose({ actor: "seller", offerId: "o2", priorOfferId: "outdated", amountMinor: 7500, currency: "USD", now: 2 }), "CONFLICTING", "stale_or_missing_parent_offer");
  bad(() => n.propose({ actor: "buyer", offerId: "o2", priorOfferId: "o1", amountMinor: 7200, currency: "USD", now: 2 }), "REFUSED", "consecutive_offers_same_principal");
  assert.equal(n.publicState().offers.length, 1);
});

test("tampered offer digest or old offer cannot be acknowledged", () => {
  const n = make();
  const a = n.propose({ actor: "buyer", offerId: "o1", amountMinor: 7000, currency: "USD", now: 1 });
  const b = n.propose({ actor: "seller", offerId: "o2", priorOfferId: "o1", amountMinor: 7600, currency: "USD", now: 2 });
  bad(() => n.acknowledge({ actor: "buyer", offerId: "o2", termsDigest: "tampered", now: 3 }), "CONFLICTING", "terms_or_offer_changed");
  bad(() => n.acknowledge({ actor: "buyer", offerId: "o1", termsDigest: a.termsDigest, now: 3 }), "CONFLICTING", "terms_or_offer_changed");
  assert.equal(n.acknowledge({ actor: "buyer", offerId: "o2", termsDigest: b.termsDigest, now: 3 }).phase, "NEGOTIATING");
});

test("delegation expiry and missing acknowledgement permissions block changes", () => {
  const expired = make({ buyer: { maxMinor: 8000, validUntil: 5, can: ["propose", "acknowledge"] } });
  bad(() => expired.propose({ actor: "buyer", offerId: "o1", amountMinor: 7000, currency: "USD", now: 5 }), "REFUSED", "delegation_not_authorized");
  const restricted = make({ seller: { minMinor: 6500, validUntil: 900, can: ["propose"] } });
  const s = restricted.propose({ actor: "seller", offerId: "o1", amountMinor: 7500, currency: "USD", now: 1 });
  bad(() => restricted.acknowledge({ actor: "seller", offerId: "o1", termsDigest: s.termsDigest, now: 2 }), "REFUSED", "delegation_not_authorized");
});

test("expired deal window, changed currency and missing evidence stop progress", () => {
  const n = make();
  bad(() => n.propose({ actor: "seller", offerId: "o1", amountMinor: 7500, currency: "EUR", now: 1 }), "REFUSED", "currency_mismatch");
  bad(() => n.propose({ actor: "seller", offerId: "o1", amountMinor: 7500, currency: "USD", now: 1000 }), "REFUSED", "deal_window_closed");
  bad(() => n.propose({ actor: "seller", offerId: "o1", amountMinor: 7500, currency: "USD" }), "UNKNOWN", "untrusted_or_missing_time");
  bad(() => n.propose({ actor: "buyer", offerId: "o1", amountMinor: 0, currency: "USD", now: 1 }), "UNKNOWN", "invalid_amount");
});

test("new negotiation cannot be constructed without critical preferences", () => {
  bad(() => make({ buyer: { validUntil: 900, can: ["propose"] } }), "UNKNOWN", "missing_buyer_limit");
  bad(() => make({ currency: "INVALID" }), "UNKNOWN", "missing_currency");
  bad(() => make({ expiresAt: 0 }), "UNKNOWN", "invalid_window");
});

test("tentative state refuses additional counteroffers without external effects", () => {
  const n = make();
  const o = n.propose({ actor: "seller", offerId: "o1", amountMinor: 7400, currency: "USD", now: 1 });
  n.acknowledge({ actor: "seller", offerId: "o1", termsDigest: o.termsDigest, now: 2 });
  n.acknowledge({ actor: "buyer", offerId: "o1", termsDigest: o.termsDigest, now: 3 });
  bad(() => n.propose({ actor: "buyer", offerId: "o2", priorOfferId: "o1", amountMinor: 7000, currency: "USD", now: 4 }), "REFUSED", "negotiation_closed");
  assert.deepEqual(n.propose({ actor: "seller", offerId: "o1", amountMinor: 7400, currency: "USD", now: 4 }), o);
  assert.equal(n.publicState().effectPhase, "NOT_REQUESTED");
});
