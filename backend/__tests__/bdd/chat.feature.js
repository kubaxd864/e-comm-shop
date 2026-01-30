import { jest } from "@jest/globals";
import { loadFeature, defineFeature } from "jest-cucumber";
import request from "supertest";

const mockQuery = jest.fn();
const mockRequireAuth = jest.fn((req, res, next) => next());

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
  requireAuth: mockRequireAuth,
  requireAdmin: jest.fn((req, res, next) => next()),
  requireOwner: jest.fn((req, res, next) => next()),
}));

const { default: app } = await import("../../index.js");
const feature = loadFeature("./__tests__/bdd/features/chat.feature");

defineFeature(feature, (test) => {
  let response;
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockImplementation((req, res, next) => {
      req.session = req.session || {};
      next();
    });
  });

  test("Client retrieves their chat messages", ({ given, when, then, and }) => {
    given("I am a logged in client with ID 1", () => {
      mockRequireAuth.mockImplementation((req, res, next) => {
        req.session = req.session || {};
        req.session.userId = 1;
        req.session.role = "client";
        next();
      });
    });
    and(/^the chat room (\d+) exists with messages$/, (roomId) => {
      mockQuery.mockResolvedValueOnce([
        [
          { id: 1, message: "Hello", chat_room_id: parseInt(roomId) },
          { id: 2, message: "World", chat_room_id: parseInt(roomId) },
        ],
        undefined,
      ]);
    });
    when(/^I request messages for room (\d+)$/, async (roomId) => {
      response = await request(app).get(`/api/chat/messages/${roomId}`);
    });
    then("I should receive a list of messages", () => {
      expect(response.body.messages).toHaveLength(2);
      expect(response.body.messages[0].message).toBe("Hello");
    });
    and("the response should be successful", () => {
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });
  });

  test("Admin retrieves chat rooms", ({ given, when, then, and }) => {
    given("I am a logged in admin with Shop ID 1", () => {
      mockRequireAuth.mockImplementation((req, res, next) => {
        req.session = req.session || {};
        req.session.userId = 2; // Admin ID
        req.session.role = "admin";
        req.session.shop = 1;
        next();
      });
    });
    and("there are chat rooms for this shop", () => {
      mockQuery.mockResolvedValueOnce([
        [{ id: 10, shop_id: 1, client_id: 1, client_email: "client@test.com" }],
        undefined,
      ]);
    });
    when("I request the list of chat rooms", async () => {
      response = await request(app).get("/api/chat/get_rooms");
    });
    then("I should receive a list of rooms associated with the shop", () => {
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].shop_id).toBe(1);
    });
  });
});
