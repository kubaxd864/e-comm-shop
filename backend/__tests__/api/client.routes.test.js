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
    req.session.role = "client";
    next();
  }),
  requireAdmin: jest.fn((req, res, next) => next()),
  requireOwner: jest.fn((req, res, next) => next()),
}));

const mockCompare = jest.fn();
const mockHash = jest.fn();
jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: mockCompare,
    hash: mockHash,
  },
}));

const { default: app } = await import("../../index.js");

describe("Client API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/me should return logged user data", async () => {
    const mockUser = { id: 1, name: "Jan", email: "jan@test.mail" };
    mockQuery.mockResolvedValueOnce([[mockUser], undefined]);
    const res = await request(app).get("/api/me");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ user: mockUser });
  });

  test("PUT /api/user_update should update user details", async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app)
      .put("/api/user_update")
      .send({ id: 1, name: "Jan Paweł" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Dane zaktualizowano pomyślnie" });
  });

  test("PUT /api/user_update should return 404 if no user updated", async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).put("/api/user_update").send({ id: 999 });
    expect(res.statusCode).toBe(404);
  });

  test("PUT /api/change_password should change password successfully", async () => {
    mockQuery.mockResolvedValueOnce([[{ password_hash: "hashed_old" }]]);
    mockCompare.mockResolvedValue(true);
    mockHash.mockResolvedValue("hashed_new");
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app)
      .put("/api/change_password")
      .send({ oldpassword: "old", newpassword: "new" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Zmieniono hasło" });
    expect(mockCompare).toHaveBeenCalledWith("old", "hashed_old");
  });

  test("PUT /api/change_password should fail if old password incorrect", async () => {
    mockQuery.mockResolvedValueOnce([[{ password_hash: "hashed_old" }]]);
    mockCompare.mockResolvedValue(false);
    const res = await request(app)
      .put("/api/change_password")
      .send({ oldpassword: "wrong", newpassword: "new" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Niepoprawne/);
  });

  test("GET /api/favorites should return favorites list", async () => {
    const mockFavs = [{ id: 1, name: "Konsola Xbox One" }];
    mockQuery.mockResolvedValueOnce([mockFavs, undefined]);
    const res = await request(app).get("/api/favorites");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ favorites: mockFavs });
  });

  test("POST /api/favorites/:productId should add favorite", async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).post("/api/favorites/10");
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: "Dodano do Ulubionych" });
  });

  test("DELETE /api/favorites/:productId should remove favorite", async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete("/api/favorites/10");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Usunięto z Ulubionych" });
  });

  test("GET /api/my_orders should return orders with items", async () => {
    const mockOrders = [{ id: 100, total_amount: "50.00" }];
    const mockItems = [{ order_id: 100, product_name: "Test Product" }];
    mockQuery.mockResolvedValueOnce([mockOrders, undefined]);
    mockQuery.mockResolvedValueOnce([mockItems, undefined]);
    const res = await request(app).get("/api/my_orders");
    expect(res.statusCode).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].items).toHaveLength(1);
    expect(res.body.orders[0].items[0].product_name).toBe("Test Product");
  });

  test("GET /api/my_orders should return empty list if no orders", async () => {
    mockQuery.mockResolvedValueOnce([[], undefined]);
    const res = await request(app).get("/api/my_orders");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ orders: [] });
  });
});
