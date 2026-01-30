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

jest.unstable_mockModule("../../functions/auth.functions.js", () => ({
  getUserByEmail: jest.fn(),
  requireAuth: jest.fn((req, res, next) => next()),
  requireAdmin: jest.fn((req, res, next) => next()),
  requireOwner: jest.fn((req, res, next) => next()),
}));

jest.unstable_mockModule("../../config/session.js", () => ({
  sessionMiddleware: (req, res, next) => {
    req.session = {
      regenerate: (cb) => cb(null),
      destroy: (cb) => cb(null),
      cookie: {},
    };
    next();
  },
  defaultSessionMaxAge: 3600000,
  rememberMeMaxAge: 86400000,
}));

jest.unstable_mockModule("express-rate-limit", () => ({
  default: jest.fn(() => (req, res, next) => next()),
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: jest.fn().mockResolvedValue("hashed_password_mock"),
    compare: jest.fn().mockResolvedValue(true),
  },
}));

jest.unstable_mockModule("../../config/stripe.js", () => ({
  stripe: {},
}));

const { default: app } = await import("../../index.js");
const { getUserByEmail } = await import("../../functions/auth.functions.js");

describe("Auth API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockResolvedValue([[], undefined]);
  });

  describe("POST /api/auth/register", () => {
    test("POST /api/auth/register return 201 if data is correct", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "StrongPassword123!",
        phone: "123456789",
        state: "Pomorskie",
        postcode: "80-001",
        city: "Gdańsk",
        address: "Malinowa 20",
      };
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }, undefined]);
      const res = await request(app).post("/api/auth/register").send(userData);
      expect(res.status).toBe(201);
    });
  });

  describe("POST /api/auth/login", () => {
    test("POST /api/auth/login return 200 if login is correct", async () => {
      const loginData = {
        email: "test@example.com",
        password: "StrongPassword123!",
      };
      getUserByEmail.mockResolvedValueOnce({
        id: 1,
        email: "test@example.com",
        password_hash: "hashed_password",
        role: "client",
        is_active: 1,
      });
      const res = await request(app).post("/api/auth/login").send(loginData);
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/auth/logout", () => {
    test("POST /api/auth/logout return 200 and clears cookie", async () => {
      const res = await request(app).post("/api/auth/logout");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Wylogowano z Konta");
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes("sid=;"))).toBe(true);
    });
  });
});
