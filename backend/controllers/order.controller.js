import { promisePool } from "../config/db.js";
import { stripe } from "../config/stripe.js";
import dotenv from "dotenv";
dotenv.config();

export const getStripeConfig = (req, res) => {
  res.send({ publishablekey: env.STRIPE_PUBLIC_KEY });
};

export const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "pln",
      amount: amount,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
};

export const makeOrder = async (req, res) => {
  const { items, itemsSum, deliverySum } = req.body;
  const amount = itemsSum + deliverySum;
  try {
    req.session.deliverySelections = {};
    const [order] = await promisePool.query(
      "INSERT INTO orders (user_id, total_amount) VALUES (?, ?)",
      [req.session.userId, amount.toFixed(2)],
    );
    const values = items.map((item) => [
      order.insertId,
      item.id,
      item.quantity,
      item.price,
    ]);
    await promisePool.query(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
      [values],
    );
    await promisePool.query("DELETE FROM carts WHERE user_id = ?", [
      req.session.userId,
    ]);
    const ids = items.map((item) => item.id);
    await promisePool.query(
      "UPDATE products SET is_active = 0 WHERE id IN (?)",
      [ids],
    );
    res.status(200).json({ message: "Złożono zamówienie" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas dokonywania zamówienia" });
  }
};
