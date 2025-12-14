const qs = require("qs");
const axios = require("axios");
const { promisePool } = require("./db");

async function getUserByEmail(email) {
  const [rows] = await promisePool.query(
    "SELECT id, email, password_hash FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
}

async function getOrCreateCart(userId) {
  const [rows] = await promisePool.query(
    "SELECT * FROM carts WHERE user_id = ?",
    [userId]
  );
  if (rows.length > 0) return rows[0];
  const [result] = await promisePool.query(
    "INSERT INTO carts (user_id) VALUES (?)",
    [userId]
  );
  const newCart = {
    id: result.insertId,
    userId,
  };
  return newCart;
}

async function getToken() {
  const data = qs.stringify({
    grant_type: "client_credentials",
    client_id: process.env.EPAKA_CLIENT_ID,
    client_secret: process.env.EPAKA_CLIENT_SECRET,
  });

  const res = await axios.post("https://api.epaka.pl/oauth/token", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return res.data.access_token;
}

async function getPrices({ width, height, length, weight }) {
  try {
    const token = await getToken();
    const payload = {
      shippingType: "package",
      courierId: 0,
      senderPostCode: "00-001",
      receiverPostCode: "62-200",
      packages: [
        {
          width: Math.round(width),
          height: Math.round(height),
          length: Math.round(length),
          weight: Math.max(1, Math.round(weight)),
          type: 0,
        },
      ],
    };

    const res = await axios.post(
      "https://api.epaka.pl/v1/order/prices",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.couriers;
  } catch (err) {
    console.log(err.response.data);
  }
}

async function buildCartSummary(items) {
  let itemsSum = 0;

  const map = items.reduce((acc, it) => {
    const sid = it.store_id ?? it.storeId ?? 0;
    if (!acc.has(sid)) {
      acc.set(sid, {
        store_id: sid,
        store_name: it.store_name ?? it.shop_name ?? `Sklep ${sid}`,
        items: [],
        size: { width: 0, height: 0, length: 0, weight: 0 },
        cheapestdelivery: 0,
        deliveryOptions: [],
      });
    }

    const group = acc.get(sid);
    itemsSum += it.quantity * it.price;

    let parsedSize = null;
    try {
      parsedSize =
        typeof it.size === "object" ? it.size : JSON.parse(it.size ?? null);
    } catch {
      parsedSize = null;
    }

    if (parsedSize) {
      group.size.width += parsedSize.width ?? 0;
      group.size.height += parsedSize.height ?? 0;
      group.size.length += parsedSize.length ?? 0;
      group.size.weight += parsedSize.weight ?? 0;
    }

    group.items.push({
      id: it.id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      thumbnail: it.thumbnail,
      store_id: sid,
    });

    return acc;
  }, new Map());

  for (const group of map.values()) {
    try {
      const deliveries = await getPrices({
        width: group.size.width,
        height: group.size.height,
        length: group.size.length,
        weight: group.size.weight,
      });
      group.deliveryOptions = deliveries;
      const cheapest = group.deliveryOptions.reduce((acc, option) => {
        const price = Number(option?.grossPriceTotal);
        if (price <= 0) return acc;
        return price < acc ? price : acc;
      }, Infinity);
      group.cheapestdelivery = cheapest || 0;
    } catch (err) {
      console.error("Błąd pobierania cen dostaw", err);
    }
  }

  const groups = [...map.values()].map((g) => ({
    ...g,
    items: [...g.items],
  }));

  return { groups, itemsSum };
}

function calculateDeliverySum(groups, deliverySelections = {}) {
  return groups.reduce((acc, group) => {
    const selected = deliverySelections[group.store_id];
    return acc + (selected?.price ?? group.cheapestdelivery ?? 0);
  }, 0);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ message: "Użytkownik niezalogowany" });
}

module.exports = {
  getUserByEmail,
  getOrCreateCart,
  getToken,
  getPrices,
  buildCartSummary,
  calculateDeliverySum,
  requireAuth,
};
