import { jest } from "@jest/globals";
import request from "supertest";

const mockQuery = jest.fn();
jest.unstable_mockModule("../../config/db.js", () => ({
  pool: {},
  promisePool: {
    query: mockQuery,
    execute: mockQuery,
  },
}));

jest.unstable_mockModule("../../config/session.js", () => ({
  sessionMiddleware: (req, res, next) => {
    if (!req.session) req.session = {};
    next();
  },
  defaultSessionMaxAge: 60 * 60 * 1000,
  rememberMeMaxAge: 24 * 60 * 60 * 1000,
}));

jest.unstable_mockModule("../../functions/auth.functions.js", () => ({
  getUserByEmail: jest.fn(),
  requireAuth: jest.fn((req, res, next) => {
    req.session = req.session || {};
    req.session.userId = 1;
    req.session.deliverySelections = req.session.deliverySelections || {};
    next();
  }),
  requireAdmin: jest.fn((req, res, next) => next()),
  requireOwner: jest.fn((req, res, next) => next()),
}));

const mockPaymentIntentsCreate = jest.fn();
jest.unstable_mockModule("../../config/stripe.js", () => ({
  stripe: {
    paymentIntents: {
      create: mockPaymentIntentsCreate,
    },
  },
}));

const { default: app } = await import("../../index.js");

describe("Order API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/stripe/config should return publishable key", async () => {
    process.env.STRIPE_PUBLIC_KEY = "pk_test_12345";
    const res = await request(app).get("/api/stripe/config");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ publishablekey: "pk_test_12345" });
  });

  test("POST /api/stripe/create-payment-intent should create payment intent", async () => {
    mockPaymentIntentsCreate.mockResolvedValueOnce({
      client_secret: "secret_123",
    });
    const res = await request(app)
      .post("/api/stripe/create-payment-intent")
      .send({ amount: 1000 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ clientSecret: "secret_123" });
    expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1000,
        currency: "pln",
      }),
    );
  });

  test("POST /api/stripe/create-payment-intent should handle stripe errors", async () => {
    mockPaymentIntentsCreate.mockRejectedValueOnce(new Error("Stripe Error"));
    const res = await request(app)
      .post("/api/stripe/create-payment-intent")
      .send({ amount: 1000 });
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Stripe Error" });
  });

  test("POST /api/make_order should place an order successfully", async () => {
    const mockOrderData = {
      items: [
        { id: 10, quantity: 1, price: 50.0 },
        { id: 11, quantity: 2, price: 25.0 },
      ],
      itemsSum: 100.0,
      deliverySum: 15.0,
    };
    mockQuery.mockResolvedValueOnce([{ insertId: 100 }]);
    mockQuery.mockResolvedValueOnce([{ affectedRows: 2 }]);
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).post("/api/make_order").send(mockOrderData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Złożono zamówienie" });
  });
});
