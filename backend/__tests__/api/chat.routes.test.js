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
    req.session.shop = "Sklep Test";
    req.session.role = "admin";
    next();
  }),
  requireAdmin: jest.fn((req, res, next) => next()),
  requireOwner: jest.fn((req, res, next) => next()),
}));

jest.unstable_mockModule("../../config/stripe.js", () => ({
  stripe: {},
}));

const { default: app } = await import("../../index.js");

describe("Chat API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/chat/get_rooms should return rooms list for admin", async () => {
    const mockRooms = [
      { id: 1, shop_id: 10, client_id: 5, client_email: "admin@test.mail" },
    ];
    mockQuery.mockResolvedValueOnce([mockRooms, undefined]);
    const res = await request(app).get("/api/chat/get_rooms");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].client_email).toBe("admin@test.mail");
  });

  test("GET /api/chat/messages/:roomId should return list of messages from roomId", async () => {
    const mockMessages = [{ id: 1, roomId: 12, text: "Witaj" }];
    mockQuery.mockResolvedValueOnce([mockMessages, undefined]);
    const res = await request(app).get("/api/chat/messages/12");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, messages: mockMessages });
  });
});
