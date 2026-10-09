import { requireQuoteOwner } from "../../require-quote-owner";
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createQuoteMessageWorkflow } from "../../../../../workflows/quote/workflows";
import { StoreCreateQuoteMessageType } from "../../validators";

export const POST = async (
  req: AuthenticatedMedusaRequest<StoreCreateQuoteMessageType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await requireQuoteOwner(query, id, req.auth_context.actor_id);

  await createQuoteMessageWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      customer_id: req.auth_context.actor_id,
      quote_id: id,
    },
  });

  const {
    data: [quote],
  } = await query.graph(
    {
      entity: "quote",
      fields: req.queryConfig.fields,
      filters: { id, customer_id: req.auth_context.actor_id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ quote });
};
