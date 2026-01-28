import { jest, describe, it, expect, beforeEach } from "@jest/globals";

jest.unstable_mockModule("../../functions/socket.functions.js", () => ({
  joinOrCreateRoom: jest.fn(),
  sendMessage: jest.fn(),
}));

const socketFunctions = await import("../../functions/socket.functions.js");
const { chatController } =
  await import("../../controllers/socket.controller.js");

describe("Socket Controller - chatController", () => {
  let io;
  let socket;
  let callback;

  beforeEach(() => {
    io = {
      on: jest.fn(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    socket = {
      on: jest.fn(),
      join: jest.fn(),
      handshake: {
        session: {
          shop: 10,
          userId: 1,
          role: "client",
        },
      },
    };
    callback = jest.fn();
    jest.clearAllMocks();
  });
  it("should register connection handler on init", () => {
    chatController(io);
    expect(io.on).toHaveBeenCalledWith("connection", expect.any(Function));
  });
  describe("Connection & Events", () => {
    let connectionHandler;
    let eventHandlers = {};
    beforeEach(() => {
      chatController(io);
      connectionHandler = io.on.mock.calls[0][1];
      socket.on.mockImplementation((eventName, handler) => {
        eventHandlers[eventName] = handler;
      });
      connectionHandler(socket);
    });
    it("should register joinOrCreateChat and sendMessage events", () => {
      expect(socket.on).toHaveBeenCalledWith(
        "joinOrCreateChat",
        expect.any(Function),
      );
      expect(socket.on).toHaveBeenCalledWith(
        "sendMessage",
        expect.any(Function),
      );
    });

    describe("joinOrCreateChat event", () => {
      it("should call joinOrCreateRoom, join socket room and callback", async () => {
        const data = { type: "order", id: 123 };
        const mockRoom = { id: 999, roomKey: "room-999" };
        socketFunctions.joinOrCreateRoom.mockResolvedValue(mockRoom);
        const joinHandler = eventHandlers["joinOrCreateChat"];
        await joinHandler(data, callback);
        expect(socketFunctions.joinOrCreateRoom).toHaveBeenCalledWith({
          contextType: data.type,
          contextId: data.id,
          shopId: 10,
          userId: 1,
        });
        expect(socket.join).toHaveBeenCalledWith(mockRoom.roomKey);
        expect(callback).toHaveBeenCalledWith({
          ok: true,
          roomId: mockRoom.id,
        });
      });
    });

    describe("sendMessage event", () => {
      it("should save message, broadcast it to room and confirm via callback", async () => {
        const data = { roomId: 999, text: "Hello World", roomKey: "room-999" };
        const mockMsg = { id: 50, text: "Hello World", author: "Me" };
        socketFunctions.sendMessage.mockResolvedValue(mockMsg);
        const msgHandler = eventHandlers["sendMessage"];
        await msgHandler(data, callback);
        expect(socketFunctions.sendMessage).toHaveBeenCalledWith({
          chatRoomId: data.roomId,
          senderId: 1,
          senderRole: "client",
          text: data.text,
        });
        expect(io.to).toHaveBeenCalledWith(data.roomKey);
        expect(io.emit).toHaveBeenCalledWith("message", mockMsg);
        expect(callback).toHaveBeenCalledWith({ ok: true });
      });
    });
  });
});
