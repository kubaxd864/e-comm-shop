import {
  joinOrCreateRoom,
  sendMessage,
} from "../functions/socket.functions.js";

export function chatController(io) {
  io.on("connection", (socket) => {
    socket.on("joinOrCreateChat", async (data, cb) => {
      const room = await joinOrCreateRoom({
        contextType: data.type,
        contextId: data.id,
        shopId: socket.handshake.session.shop,
        userId: socket.handshake.session.userId,
      });
      socket.join(room.roomKey);
      cb({ ok: true, roomId: room.id });
    });

    socket.on("sendMessage", async (data, cb) => {
      const msg = await sendMessage({
        chatRoomId: data.roomId,
        senderId: socket.handshake.session.userId,
        senderRole: socket.handshake.session.role,
        text: data.text,
      });
      io.to(data.roomKey).emit("message", msg);
      cb({ ok: true });
    });
  });
}
