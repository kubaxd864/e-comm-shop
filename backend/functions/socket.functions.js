import { promisePool } from "../config/db.js";

export async function joinOrCreateRoom({
  contextType,
  contextId,
  shopId,
  userId,
}) {
  try {
    const [rows] = await promisePool.query(
      `SELECT * FROM chat_rooms
     WHERE context_type = ? AND context_id = ?`,
      [contextType, contextId],
    );
    if (rows.length) return rows[0];
    const [result] = await promisePool.query(
      `INSERT INTO chat_rooms
     (context_type, context_id, shop_id, client_id)
     VALUES (?, ?, ?, ?)`,
      [contextType, contextId, shopId, userId],
    );
    return {
      id: result.insertId,
    };
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const [rows] = await promisePool.query(
        `SELECT * FROM chat_rooms
         WHERE context_type = ? AND context_id = ?`,
        [contextType, contextId],
      );
      return rows[0];
    }
    throw err;
  }
}

export async function sendMessage({ chatRoomId, senderId, senderRole, text }) {
  await promisePool.query(
    `INSERT INTO chat_messages
     (chat_room_id, sender_id, sender_role, content)
     VALUES (?, ?, ?, ?)`,
    [chatRoomId, senderId, senderRole, text],
  );
  await promisePool.query(
    `UPDATE chat_rooms
     SET last_message_at = NOW()
     WHERE id = ?`,
    [chatRoomId],
  );
}
