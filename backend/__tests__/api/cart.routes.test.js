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

jest.unstable_mockModule("../../functions/cart.functions.js", () => ({
  getOrCreateCart: jest.fn(() => Promise.resolve({ id: 999, user_id: 1 })),
  buildCartSummary: jest.fn(() =>
    Promise.resolve({
      groups: [
        {
          store_id: 10,
          store_name: "Sklep Test",
          items: [],
          size: { width: 10, height: 10, length: 10, weight: 1 },
          cheapestdelivery: 15.0,
          deliveryOptions: [],
        },
      ],
      itemsSum: 150.0,
    }),
  ),
  calculateDeliverySum: jest.fn(() => 15.0),
  getToken: jest.fn(),
  getPrices: jest.fn(),
}));

const { default: app } = await import("../../index.js");
const { buildCartSummary } = await import("../../functions/cart.functions.js");

describe("Cart API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/cart/data should return cart", async () => {
    mockQuery.mockResolvedValueOnce([[]]);
    const res = await request(app).get("/api/cart/data");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("itemsSum");
    expect(res.body).toHaveProperty("deliverySum");
    expect(res.body.groupedByStore[0].store_name).toBe("Sklep Test");
  });

  test("POST /api/cart/delivery should update delivery option", async () => {
    const res = await request(app)
      .post("/api/cart/delivery")
      .send({ storeId: 10, price: 20, method: "kurier" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  test("POST /api/cart/lowerquantity/:productId should lower product quantity", async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).post("/api/cart/lowerquantity/10");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Zmniejszono Ilość" });
  });

  test("POST /api/cart/:productId should add product to cart or increase quantity", async () => {
    mockQuery.mockResolvedValueOnce([[{ stock: 100 }]]);
    mockQuery.mockResolvedValueOnce([[]]);
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).post("/api/cart/10");
    if (res.statusCode !== 200) console.error("POST error:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Dodano do koszyka" });
  });

  test("DELETE /api/cart/:productId should remove product from cart", async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete("/api/cart/10");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Usunięto z koszyka" });
  });
});
