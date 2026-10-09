import type { RemoteQueryFunction } from "@medusajs/framework/types";
import { MedusaError } from "@medusajs/framework/utils";

/**
 * Fail closed before performing any quote mutation or disclosing a preview.
 *
 * Authentication alone does not authorize an agent/customer to access
 * arbitrary quote identifiers. Require a matching customer binding.
 * A production agent additionally needs scoped, revocable delegation.
 */
export async function requireQuoteOwner(
  query: Pick<RemoteQueryFunction, "graph">,
  quoteId: string,
  customerId: string | undefined
): Promise<void> {
  if (!customerId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Quote not found");
  }

  const { data } = await query.graph({
    entity: "quote",
    fields: ["id", "customer_id"],
    filters: { id: quoteId, customer_id: customerId },
  });

  const quote = data?.[0];
  if (!quote || quote.id !== quoteId || quote.customer_id !== customerId) {
    // Same response for missing and unauthorized resources.
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Quote not found");
  }
}
