import { promisePool } from "../config/db.js";
import bcrypt from "bcrypt";

const bcryptRounds = Number(process.env.BCRYPT_ROUNDS) || 10;

export const me = async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT id, name, surname, email, role, phone, county, postcode, city, adress FROM users WHERE id = ?",
      [req.session.userId],
    );
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
  }
};

export const userUpdate = async (req, res) => {
  try {
    const { id, name, surname, email, phone, county, postcode, city, adress } =
      req.body;
    const [result] = await promisePool.query(
      `UPDATE users
      SET name = ?, surname = ?, email = ?, phone = ?, county = ?, postcode = ?, city = ?, adress = ?
      WHERE id = ?`,
      [name, surname, email, phone, county, postcode, city, adress, id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nie znaleziono Użytkownika" });
    }
    return res.json({ message: "Dane zaktualizowano pomyślnie" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldpassword, newpassword } = req.body;
    const [rows] = await promisePool.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [req.session.userId],
    );
    const ok = await bcrypt.compare(oldpassword, rows[0].password_hash);
    if (!ok) {
      return res.status(400).json({ message: "Niepoprawne aktualne hasło" });
    }
    if (oldpassword === newpassword) {
      return res
        .status(400)
        .json({ message: "Nowe hasło nie może być takie samo jak stare" });
    }
    const newHash = await bcrypt.hash(newpassword, bcryptRounds);
    await promisePool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      newHash,
      req.session.userId,
    ]);
    return res.json({ message: "Zmieniono hasło" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas pobierania danych" });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT p.id, p.category_id, p.name, p.price, p.promotion_price, p.item_condition, img.file_path thumbnail, s.address AS store_address, s.city AS store_city
     FROM favorites f
     JOIN products p ON p.id = f.product_id
     LEFT JOIN product_images img
     ON img.product_id = p.id AND img.is_main
     LEFT JOIN stores s
     ON s.id = p.store_id
     WHERE f.user_id = ? AND p.is_active
     ORDER BY f.created_at DESC`,
      [req.session.userId],
    );
    return res.json({ favorites: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas pobierania danych" });
  }
};

export const addFavorite = async (req, res) => {
  try {
    await promisePool.query(
      `INSERT IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)`,
      [req.session.userId, req.params.productId],
    );
    return res.status(201).json({ message: "Dodano do Ulubionych" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas Dodawania" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    await promisePool.query(
      `DELETE FROM favorites WHERE user_id = ? AND product_id = ?`,
      [req.session.userId, req.params.productId],
    );
    return res.json({ message: "Usunięto z Ulubionych" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas Usuwania" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const [orders] = await promisePool.query(
      "SELECT o.id, o.total_amount, o.status, o.created_at FROM orders o WHERE user_id = ? ORDER BY o.created_at DESC",
      [req.session.userId],
    );
    if (!orders.length) return res.json({ orders: [] });

    const orderIds = orders.map((o) => o.id);
    const [items] = await promisePool.query(
      `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name AS product_name, img.file_path AS thumbnail
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       LEFT JOIN product_images img ON img.product_id = p.id AND img.is_main
       WHERE oi.order_id IN (?)`,
      [orderIds],
    );

    const itemsByOrder = items.reduce((acc, it) => {
      (acc[it.order_id] = acc[it.order_id] || []).push(it);
      return acc;
    }, {});

    const ordersWithItems = orders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] ?? [],
    }));
    res.json({ orders: ordersWithItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas pobierania zamówień" });
  }
};
