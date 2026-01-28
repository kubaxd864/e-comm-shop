import { describe, expect, jest, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../config/db.js", () => ({
  promisePool: {
    query: jest.fn(),
  },
  pool: {},
}));

const { promisePool } = await import("../../config/db.js");
const { joinOrCreateRoom, sendMessage } =
  await import("../../functions/socket.functions.js");

describe("Socket Functions", () => {
  beforeEach(() => {
    promisePool.query.mockReset();
  });

  describe("joinOrCreateRoom", () => {
    it("should return existing room if found", async () => {
      promisePool.query.mockResolvedValueOnce([
        [{ id: 101, context_type: "order" }],
      ]);
      const result = await joinOrCreateRoom({
        contextType: "order",
        contextId: 123,
        shopId: 10,
        userId: 1,
      });
      expect(result).toEqual({ id: 101, context_type: "order" });
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM chat_rooms"),
        ["order", 123],
      );
    });
    it("should create new room if not found", async () => {
      promisePool.query.mockResolvedValueOnce([[]]);
      promisePool.query.mockResolvedValueOnce([{ insertId: 202 }]);
      const params = {
        contextType: "product",
        contextId: 456,
        shopId: 20,
        userId: 2,
      };
      const result = await joinOrCreateRoom(params);
      expect(result).toEqual({ id: 202 });
      expect(promisePool.query).toHaveBeenCalledTimes(2);
      expect(promisePool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO chat_rooms"),
        ["product", 456, 20, 2],
      );
    });
    it("should handle race condition", async () => {
      promisePool.query.mockResolvedValueOnce([[]]);
      const duplicateError = new Error("Duplicate entry");
      duplicateError.code = "ER_DUP_ENTRY";
      promisePool.query.mockRejectedValueOnce(duplicateError);
      promisePool.query.mockResolvedValueOnce([
        [{ id: 303, context_type: "product" }],
      ]);
      const result = await joinOrCreateRoom({
        contextType: "product",
        contextId: 456,
        shopId: 20,
        userId: 2,
      });
      expect(result).toEqual({ id: 303, context_type: "product" });
      expect(promisePool.query).toHaveBeenCalledTimes(3);
    });
    it("should throw other errors directly", async () => {
      promisePool.query.mockResolvedValueOnce([[]]);
      promisePool.query.mockRejectedValueOnce(
        new Error("Database connection error"),
      );
      await expect(
        joinOrCreateRoom({ contextType: "or", contextId: 1 }),
      ).rejects.toThrow("Database connection error");
    });
  });

  describe("sendMessage", () => {
    it("should insert message and update chat room timestamp", async () => {
      promisePool.query.mockResolvedValue([{}]);
      const msgData = {
        chatRoomId: 100,
        senderId: 5,
        senderRole: "client",
        text: "Hello World",
      };
      await sendMessage(msgData);
      expect(promisePool.query).toHaveBeenCalledTimes(2);
      expect(promisePool.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("INSERT INTO chat_messages"),
        [100, 5, "client", "Hello World"],
      );
      expect(promisePool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("UPDATE chat_rooms"),
        [100],
      );
    });
  });
});
