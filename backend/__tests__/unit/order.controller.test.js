import { describe, expect, jest } from "@jest/globals";

jest.unstable_mockModule("../../config/db.js", () => ({
  promisePool: {
    query: jest.fn(),
  },
  pool: {},
}));

jest.unstable_mockModule("../../config/stripe.js", () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn(),
    },
  },
}));

const { promisePool } = await import("../../config/db.js");
const { stripe } = await import("../../config/stripe.js");
const orderController = await import("../../controllers/order.controller.js");

describe("Order Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("getStripeConfig", () => {
    it("should return stripe api config key", async () => {
      process.env.STRIPE_PUBLIC_KEY = "mocked-api-key";
      await orderController.getStripeConfig(req, res);
      expect(res.send).toHaveBeenCalledWith({
        publishablekey: "mocked-api-key",
      });
    });
  });

  describe("createPaymentIntent", () => {
    it("should create payment intent and return client secret", async () => {
      req = { body: { amount: 100 } };
      const mockPaymentIntent = { client_secret: "secret_123" };
      stripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);
      await orderController.createPaymentIntent(req, res);
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        currency: "pln",
        amount: 100,
        automatic_payment_methods: { enabled: true },
      });
      expect(res.send).toHaveBeenCalledWith({ clientSecret: "secret_123" });
    });

    it("should handle stripe errors", async () => {
      req = { body: { amount: 2999 } };
      const error = new Error("Payment Error");
      stripe.paymentIntents.create.mockRejectedValueOnce(error);
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await orderController.createPaymentIntent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Payment Error" });
      consoleSpy.mockRestore();
    });
  });

  describe("makeOrder", () => {
    it("should finalize the ordering process by puting everything into database", async () => {
      req = {
        session: { userId: 1, deliverySelections: {} },
        body: {
          items: [
            { id: 21, quantity: 1, price: 39.99 },
            { id: 19, quantity: 1, price: 79.99 },
          ],
          itemsSum: 119.98,
          deliverySum: 15.0,
        },
      };

      const expectedAmount = 134.98;
      promisePool.query.mockResolvedValueOnce([{ insertId: 99 }]);
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
      await orderController.makeOrder(req, res);
      expect(promisePool.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("INSERT INTO orders"),
        [1, expect.any(String)],
      );
      const expectedValues = [
        [99, 21, 1, 39.99],
        [99, 19, 1, 79.99],
      ];
      expect(promisePool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO order_items"),
        [expectedValues],
      );
      expect(promisePool.query).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining("DELETE FROM carts"),
        [1],
      );
      expect(promisePool.query).toHaveBeenNthCalledWith(
        4,
        expect.stringContaining("UPDATE products SET is_active"),
        [[21, 19]],
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Złożono zamówienie" });
    });
  });
});
