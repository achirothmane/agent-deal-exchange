import { createHash } from "node:crypto";

/**
 * Deterministic, local-only negotiation sandbox.
 * NO authentication, payments, orders, signatures or binding agreements.
 * "actor" and "now" are trusted inputs ONLY within controlled tests.
 */
export class BoundaryError extends Error {
  constructor(boundary, code) {
    super(code);
    this.name = "BoundaryError";
    this.boundary = boundary;
    this.code = code;
  }
}

const deny = (boundary, code) => { throw new BoundaryError(boundary, code); };
const positiveMinor = (n) => Number.isSafeInteger(n) && n > 0;
const time = (n) => Number.isSafeInteger(n) && n >= 0;
const hash = (obj) => createHash("sha256").update(JSON.stringify(obj)).digest("hex");

export class NegotiationSandbox {
  #dealId;
  #currency;
  #policy;
  #opensAt;
  #expiresAt;
  #offers = [];
  #replays = new Map();
  #ack = new Set();
  #phase = "DISCOVERY";

  constructor({ dealId, currency, buyer, seller, opensAt, expiresAt }) {
    if (typeof dealId !== "string" || !dealId.trim()) deny("UNKNOWN", "missing_deal_id");
    if (!/^[A-Z]{3}$/.test(currency ?? "")) deny("UNKNOWN", "missing_currency");
    if (!buyer || !positiveMinor(buyer.maxMinor)) deny("UNKNOWN", "missing_buyer_limit");
    if (!seller || !positiveMinor(seller.minMinor)) deny("UNKNOWN", "missing_seller_limit");
    if (!time(opensAt) || !time(expiresAt) || expiresAt <= opensAt) deny("UNKNOWN", "invalid_window");
    if (!time(buyer.validUntil) || !time(seller.validUntil)) deny("UNKNOWN", "missing_delegation_expiry");

    this.#dealId = dealId;
    this.#currency = currency;
    this.#opensAt = opensAt;
    this.#expiresAt = expiresAt;
    // Never expose the private reservation values via publicState().
    this.#policy = {
      buyer: { limitMinor: buyer.maxMinor, validUntil: buyer.validUntil, can: new Set(buyer.can ?? []) },
      seller: { limitMinor: seller.minMinor, validUntil: seller.validUntil, can: new Set(seller.can ?? []) },
    };
  }

  #check(actor, operation, now) {
    if (!time(now)) deny("UNKNOWN", "untrusted_or_missing_time");
    const p = this.#policy[actor];
    if (!p) deny("REFUSED", "unrecognized_principal");
    if (now < this.#opensAt || now >= this.#expiresAt) deny("REFUSED", "deal_window_closed");
    if (now >= p.validUntil || !p.can.has(operation)) deny("REFUSED", "delegation_not_authorized");
    if (this.#phase === "TENTATIVE") deny("REFUSED", "negotiation_closed");
    return p;
  }

  propose({ actor, offerId, amountMinor, priorOfferId = null, currency, termsVersion = "v1", now }) {
    if (typeof offerId !== "string" || !offerId.trim()) deny("UNKNOWN", "missing_offer_id");
    if (!positiveMinor(amountMinor)) deny("UNKNOWN", "invalid_amount");
    if (typeof termsVersion !== "string" || !termsVersion.trim()) deny("UNKNOWN", "missing_terms_version");
    if (currency !== this.#currency) deny("REFUSED", "currency_mismatch");
    const fingerprint = hash([actor, offerId, amountMinor, priorOfferId, currency, termsVersion]);
    const existing = this.#replays.get(offerId);
    if (existing) {
      if (existing.fingerprint !== fingerprint) deny("CONFLICTING", "offer_id_payload_changed");
      return existing.offer; // Idempotent retry, even after a tentative agreement.
    }
    const policy = this.#check(actor, "propose", now);
    if (actor === "buyer" && amountMinor > policy.limitMinor) deny("REFUSED", "buyer_local_limit");
    if (actor === "seller" && amountMinor < policy.limitMinor) deny("REFUSED", "seller_local_limit");
    const last = this.#offers.at(-1);
    if ((last?.offerId ?? null) !== priorOfferId) deny("CONFLICTING", "stale_or_missing_parent_offer");
    if (last && last.actor === actor) deny("REFUSED", "consecutive_offers_same_principal");

    const offer = Object.freeze({
      offerId,
      actor,
      amountMinor,
      currency: this.#currency,
      priorOfferId,
      termsVersion,
      termsDigest: hash({ dealId: this.#dealId, actor, offerId, amountMinor, currency, priorOfferId, termsVersion }),
      proposedAt: now,
    });
    this.#offers.push(offer);
    this.#replays.set(offerId, { fingerprint, offer });
    this.#ack.clear();
    this.#phase = "NEGOTIATING";
    return offer;
  }

  acknowledge({ actor, offerId, termsDigest, now }) {
    const policy = this.#check(actor, "acknowledge", now);
    const latest = this.#offers.at(-1);
    if (!latest) deny("UNKNOWN", "no_offer_to_acknowledge");
    if (offerId !== latest.offerId || termsDigest !== latest.termsDigest) {
      deny("CONFLICTING", "terms_or_offer_changed");
    }
    // Each principal enforces only its own reservation value.
    if (actor === "buyer" && latest.amountMinor > policy.limitMinor) deny("REFUSED", "buyer_local_limit");
    if (actor === "seller" && latest.amountMinor < policy.limitMinor) deny("REFUSED", "seller_local_limit");
    this.#ack.add(actor);
    if (this.#ack.size === 2) this.#phase = "TENTATIVE";
    return Object.freeze({ phase: this.#phase, offerId: latest.offerId, acknowledgedBy: [...this.#ack].sort() });
  }

  publicState() {
    return {
      dealId: this.#dealId,
      currency: this.#currency,
      phase: this.#phase,
      effectPhase: "NOT_REQUESTED",
      offers: this.#offers.map(o => ({ ...o })),
      acknowledgedBy: [...this.#ack].sort(),
    };
  }
}
