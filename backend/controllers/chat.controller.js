import { promisePool } from "../config/db.js";

export const getMessages = async (req, res) => {
  const { roomId } = req.params;
  try {
    const [messages] = await promisePool.query(
      `SELECT * FROM chat_messages WHERE chat_room_id = ? ORDER BY created_at ASC`,
      [roomId],
    );
    res.json({ ok: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Błąd wewnętrzny serwera" });
  }
};

export const getRooms = async (req, res) => {
  try {
    const role = req.session.role;
    const userId = req.session.userId;
    const shopId = req.session.shop;
    let query;
    let params;
    if (role === "client") {
      query = `
        SELECT cr.*, u.email AS client_email
        FROM chat_rooms cr
        WHERE client_id = ?
        LEFT JOIN users u ON u.id = cr.client_id
        ORDER BY cr.last_message_at DESC
      `;
      params = [userId];
    } else if (role === "admin") {
      query = `
        SELECT cr.*, u.email AS client_email
        FROM chat_rooms cr
        WHERE shop_id = ?
        LEFT JOIN users u ON u.id = cr.client_id
        ORDER BY cr.last_message_at DESC
      `;
      params = [shopId];
    } else if (role === "owner") {
      query = `
        SELECT cr.*, u.email AS client_email
        FROM chat_rooms cr
        LEFT JOIN users u ON u.id = cr.client_id
        ORDER BY cr.last_message_at DESC
      `;
      params = [];
    } else {
      return res.status(403).json({ message: "Brak uprawnień" });
    }
    const [rooms] = await promisePool.query(query, params);
    res.json(rooms);
  } catch (err) {
    console.error("get_rooms error:", err);
    res.status(500).json({ message: "Błąd wewnętrzny serwera" });
  }
};
