import { promisePool } from "../config/db.js";
import {
  getOrCreateCart,
  buildCartSummary,
  calculateDeliverySum,
} from "../functions/cart.functions.js";

export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.session.userId);
    const [items] = await promisePool.query(
      `SELECT p.id,
              p.name,
              p.price,
              c.quantity,
              p.store_id,
              p.size,
              s.name AS store_name,
              img.file_path AS thumbnail
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       JOIN stores s ON s.id = p.store_id
       LEFT JOIN product_images img
         ON img.product_id = p.id AND img.is_main
       WHERE c.cart_id = ?`,
      [cart.id],
    );

    const deliverySelections = req.session.deliverySelections ?? {};
    const { groups, itemsSum } = await buildCartSummary(items);
    const deliverySum = calculateDeliverySum(groups, deliverySelections);

    return res.json({
      items: items,
      groupedByStore: groups,
      itemsSum,
      deliverySum,
      deliverySelections,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas pobierania danych" });
  }
};

export const updateDelivery = (req, res) => {
  const { storeId, price, method } = req.body;
  if (!req.session.deliverySelections) {
    req.session.deliverySelections = {};
  }
  req.session.deliverySelections[storeId] = { price, method };
  res.json({ success: true });
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.session.userId);
    const [stockRows] = await promisePool.query(
      "SELECT quantity AS stock FROM products WHERE id = ? FOR UPDATE",
      [productId],
    );
    const [existingRows] = await promisePool.query(
      "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? FOR UPDATE",
      [cart.id, productId],
    );
    const stock = Number(stockRows[0].stock);
    const quantity = Number(existingRows[0]?.quantity ?? 0);
    if (quantity + 1 > stock) {
      return res.status(400).json({ message: "Maksymalna ilość Produktu" });
    }
    if (quantity > 0) {
      await promisePool.query(
        "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
        [1, existingRows[0].id],
      );
    } else {
      await promisePool.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
        [cart.id, productId, 1],
      );
    }
    res.json({ message: "Dodano do koszyka" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

export const lowerQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.session.userId);
    await promisePool.query(
      "UPDATE cart_items SET quantity = quantity - ? WHERE cart_id = ? AND product_id = ?",
      [1, cart.id, productId],
    );
    res.json({ message: "Zmniejszono Ilość" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.session.userId);
    await promisePool.query(
      "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cart.id, productId],
    );
    res.json({ message: "Usunięto z koszyka" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};
