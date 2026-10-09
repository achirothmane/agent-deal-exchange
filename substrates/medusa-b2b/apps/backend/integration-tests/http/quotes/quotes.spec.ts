import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import {
  adminHeaders,
  createAdminUser,
  createStoreUser,
} from "../../utils/admin";
import {
  cartSeeder,
  productSeeder,
  regionSeeder,
  salesChannelSeeder,
} from "../../utils/seeder";
import {
  generatePublishableKey,
  generateStoreHeaders,
} from "../../utils/store";

// This substrate initializes a full Medusa database on CI; allow migration setup time.
jest.setTimeout(process.env.CI ? 240 * 1000 : 60 * 1000);

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let storeHeaders, cart, product, salesChannel, region, customerToken;

    beforeEach(async () => {
      const container = getContainer();
      await createAdminUser(adminHeaders, container);
      const publishableKey = await generatePublishableKey(container);
      storeHeaders = generateStoreHeaders({ publishableKey });
      const res = await createStoreUser({ api, storeHeaders });
      customerToken = res.token;
      storeHeaders.headers["Authorization"] = `Bearer ${customerToken}`;
      region = await regionSeeder({ api, adminHeaders, data: {} });

      salesChannel = await salesChannelSeeder({
        api,
        adminHeaders,
        data: {},
      });

      product = await productSeeder({
        api,
        adminHeaders,
        data: {
          sales_channels: [{ id: salesChannel.id }],
        },
      });

      await api.post(
        `/admin/api-keys/${publishableKey.id}/sales-channels`,
        { add: [salesChannel.id] },
        adminHeaders
      );

      // Medusa's create-product workflow starts in DRAFT even when the
      // creation input includes a status. Publishing is a separate update.
      const { data: { product: publishedProduct } } = await api.post(
        `/admin/products/${product.id}`,
        { status: "published" },
        adminHeaders
      );
      expect(publishedProduct.status).toBe("published");

      cart = await cartSeeder({
        api,
        storeHeaders,
        data: {
          region_id: region.id,
          sales_channel_id: salesChannel.id,
          items: [{ quantity: 1, variant_id: product.variants[0].id }],
        },
      });
    });

    describe("POST /store/quotes", () => {
      it("successfully initiates a quote with a draft order", async () => {
        const response = await api.post(
          "/store/quotes",
          { cart_id: cart.id },
          storeHeaders
        );

        const draftOrder = response.data.quote.draft_order;

        expect(response.status).toEqual(200);
        expect(response.data.quote).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            cart_id: cart.id,
            draft_order_id: expect.any(String),
            draft_order: expect.objectContaining({
              status: "draft",
              version: 1,
              items: [
                expect.objectContaining({
                  quantity: cart.items[0].quantity,
                  unit_price: cart.items[0].unit_price,
                }),
              ],
              summary: expect.objectContaining({
                paid_total: 0,
                refunded_total: 0,
                transaction_total: 0,
                pending_difference: 100,
                current_order_total: 100,
                original_order_total: 100,
              }),
            }),
            order_change: expect.objectContaining({
              actions: [],
            }),
          })
        );
      });
    });

    describe("GET /store/quotes/:id", () => {
      it("successfully retrieves a quote", async () => {
        const {
          data: { quote: newQuote },
        } = await api.post("/store/quotes", { cart_id: cart.id }, storeHeaders);

        const {
          data: { quote },
        } = await api.get(`/store/quotes/${newQuote.id}`, storeHeaders);

        expect(quote).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            cart: expect.objectContaining({
              id: cart.id,
            }),
            draft_order: expect.objectContaining({
              id: newQuote.draft_order_id,
            }),
          })
        );
      });

      it("should throw error when quote does not exist", async () => {
        const {
          response: { data },
        } = await api
          .get(`/store/quotes/does-not-exist`, storeHeaders)
          .catch((e) => e);

        expect(data).toEqual({
          type: "not_found",
          message: "Quote id not found: does-not-exist",
        });
      });
    });

    describe("GET /store/quotes", () => {
      let cart2;

      beforeEach(async () => {
        cart2 = await cartSeeder({
          api,
          storeHeaders,
          data: {
            region_id: region.id,
            sales_channel_id: salesChannel.id,
            items: [{ quantity: 1, variant_id: product.variants[0].id }],
          },
        });
      });

      it("successfully retrieves all quote for a customer", async () => {
        const {
          data: { quote: quote1 },
        } = await api.post("/store/quotes", { cart_id: cart.id }, storeHeaders);

        const {
          data: { quote: quote2 },
        } = await api.post(
          "/store/quotes",
          { cart_id: cart2.id },
          storeHeaders
        );

        const {
          data: { quotes },
        } = await api.get(`/store/quotes`, storeHeaders);

        expect(quotes).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: quote1.id,
              cart: expect.objectContaining({
                id: cart.id,
              }),
              draft_order: expect.objectContaining({
                id: quote1.draft_order_id,
              }),
            }),
            expect.objectContaining({
              id: quote2.id,
              cart: expect.objectContaining({
                id: cart2.id,
              }),
              draft_order: expect.objectContaining({
                id: quote2.draft_order_id,
              }),
            }),
          ])
        );
      });
    });

    describe("POST /store/quotes/:id/accept", () => {
      let quote1;

      beforeEach(async () => {
        const {
          data: { quote: newQuote },
        } = await api.post("/store/quotes", { cart_id: cart.id }, storeHeaders);

        quote1 = newQuote;
      });

      it("successfully accepts a quote", async () => {
        await api.post(`/admin/quotes/${quote1.id}/send`, {}, adminHeaders);

        const {
          data: { quote },
        } = await api.post(
          `/store/quotes/${quote1.id}/accept?fields=+draft_order.is_draft_order,+draft_order.status`,
          {},
          storeHeaders
        );

        expect(quote).toEqual(
          expect.objectContaining({
            id: quote1.id,
            draft_order: expect.objectContaining({
              id: quote1.draft_order_id,
              status: "pending",
              is_draft_order: false,
              summary: expect.objectContaining({
                pending_difference: 100,
              }),
              payment_collections: [
                expect.objectContaining({
                  amount: 100,
                }),
              ],
            }),
          })
        );
      });

      it("should throw an error when quote is already accepted", async () => {
        await api.post(`/admin/quotes/${quote1.id}/send`, {}, adminHeaders);

        await api.post(`/store/quotes/${quote1.id}/accept`, {}, storeHeaders);

        const { response } = await api
          .post(`/store/quotes/${quote1.id}/accept`, {}, storeHeaders)
          .catch((e) => e);

        expect(response.data).toEqual({
          type: "invalid_data",
          message: "Cannot accept quote when quote status is accepted",
        });
      });
    });

    describe("POST /store/quotes/:id/reject", () => {
      let quote1;

      beforeEach(async () => {
        const {
          data: { quote: newQuote },
        } = await api.post("/store/quotes", { cart_id: cart.id }, storeHeaders);

        quote1 = newQuote;
      });

      it("successfully rejects a quote", async () => {
        await api.post(`/admin/quotes/${quote1.id}/send`, {}, adminHeaders);

        const {
          data: { quote },
        } = await api.post(
          `/store/quotes/${quote1.id}/reject?fields=+draft_order.status`,
          {},
          storeHeaders
        );

        expect(quote).toEqual(
          expect.objectContaining({
            id: quote1.id,
            status: "customer_rejected",
          })
        );
      });
    });
    describe("Quote ownership isolation", () => {
      it("denies second customer quote access and mutation without changing owner state", async () => {
        const { data: { quote: ownedQuote } } = await api.post(
          "/store/quotes", { cart_id: cart.id }, storeHeaders
        );
        await api.post(`/admin/quotes/${ownedQuote.id}/send`, {}, adminHeaders);

        const otherEmail = "quote-second-customer@example.test";
        const { data: { token: registrationToken } } = await api.post(
          "/auth/customer/emailpass/register",
          { email: otherEmail, password: "test-only-second-user" }
        );
        await api.post("/store/customers", { email: otherEmail }, {
          headers: {
            ...storeHeaders.headers,
            Authorization: `Bearer ${registrationToken}`,
          },
        });
        const { data: { token: otherToken } } = await api.post(
          "/auth/customer/emailpass",
          { email: otherEmail, password: "test-only-second-user" }
        );
        const otherHeaders = {
          headers: {
            ...storeHeaders.headers,
            Authorization: `Bearer ${otherToken}`,
          },
        };

        const mustNotSee = async (promise) => {
          let status: number | undefined;
          try {
            await promise;
          } catch (err: any) {
            status = err.response?.status;
          }
          expect(status).toBe(404);
        };

        await mustNotSee(api.get(`/store/quotes/${ownedQuote.id}`, otherHeaders));
        await mustNotSee(api.get(`/store/quotes/${ownedQuote.id}/preview`, otherHeaders));
        await mustNotSee(api.post(`/store/quotes/${ownedQuote.id}/accept`, {}, otherHeaders));
        await mustNotSee(api.post(`/store/quotes/${ownedQuote.id}/reject`, {}, otherHeaders));
        await mustNotSee(api.post(
          `/store/quotes/${ownedQuote.id}/messages`,
          { text: "This must not be recorded" },
          otherHeaders
        ));

        const { data: { quote: after } } = await api.get(
          `/store/quotes/${ownedQuote.id}`, storeHeaders
        );
        expect(after.status).toBe("pending_customer");
        const { data: { quote: ownerAccepted } } = await api.post(
          `/store/quotes/${ownedQuote.id}/accept`, {}, storeHeaders
        );
        expect(ownerAccepted.status).toBe("accepted");
      });
    });

  },
});
