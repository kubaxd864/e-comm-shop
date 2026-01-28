import { describe, expect, jest } from "@jest/globals";

jest.unstable_mockModule("../../config/db.js", () => ({
  promisePool: {
    query: jest.fn(),
  },
  pool: {},
}));

const { promisePool } = await import("../../config/db.js");
const chatController = await import("../../controllers/chat.controller.js");

describe("Chat Controller", () => {
  let req;
  let res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {
        roomId: 12,
      },
      session: {
        role: "client",
        userId: 1,
        shopId: null,
      },
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });
  describe("getMessages", () => {
    it("should get all messages from the chat by id", async () => {
      const mockMessages = [
        { id: 1, text: "Cześć", chat_room_id: 12 },
        { id: 2, text: "Witamy w sklepie", chat_room_id: 12 },
      ];
      promisePool.query.mockResolvedValue([mockMessages, undefined]);
      await chatController.getMessages(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM chat_messages"),
        [12],
      );
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        messages: mockMessages,
      });
    });
    it("should handle message errors", async () => {
      const error = new Error("DB Error");
      promisePool.query.mockRejectedValueOnce(error);
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await chatController.getMessages(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        error: "Błąd wewnętrzny serwera",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("getRooms", () => {
    it("should return rooms for client role", async () => {
      req.session.role = "client";
      req.session.userId = 1;
      const mockRooms = [
        { id: 101, client_id: 1, last_message_at: "2023-01-01" },
      ];
      promisePool.query.mockResolvedValueOnce([mockRooms]);
      await chatController.getRooms(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE client_id = ?"),
        [1],
      );
      expect(res.json).toHaveBeenCalledWith(mockRooms);
    });
    it("should return rooms for admin role", async () => {
      req.session.role = "admin";
      req.session.userId = 5;
      req.session.shop = 2;
      const mockRooms = [{ id: 202, shop_id: 99, client_id: 10 }];
      promisePool.query.mockResolvedValueOnce([mockRooms]);
      await chatController.getRooms(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE shop_id = ?"),
        [2],
      );
      expect(res.json).toHaveBeenCalledWith(mockRooms);
    });
    it("should return rooms for owner role", async () => {
      req.session.role = "owner";
      req.session.userId = 7;
      const mockRooms = [{ id: 303, client_id: 15 }];
      promisePool.query.mockResolvedValueOnce([mockRooms]);
      await chatController.getRooms(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM chat_rooms cr"),
        [],
      );
      expect(res.json).toHaveBeenCalledWith(mockRooms);
    });
    it("should return 403 for unknown role", async () => {
      req.session.role = "guest";
      await chatController.getRooms(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Brak uprawnień" });
      expect(promisePool.query).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.session.role = "client";
      req.session.userId = 1;
      promisePool.query.mockRejectedValueOnce(new Error("DB Fail"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await chatController.getRooms(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd wewnętrzny serwera",
      });
      consoleSpy.mockRestore();
    });
  });
});
