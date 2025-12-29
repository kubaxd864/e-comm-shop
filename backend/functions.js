const qs = require("qs");
const axios = require("axios");
const { promisePool } = require("./db");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

async function getUserByEmail(email) {
  const [rows] = await promisePool.query(
    "SELECT id, email, password_hash, is_active FROM users WHERE email = ?",
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

async function getFilteredProducts(query) {
  const products = await fetchProducts(query);
  const categoriesResult = await fetchCategories(query);

  return {
    products: products.rows ?? [],
    pageNum: products.pageNum,
    limitNum: products.limitNum,
    categories: categoriesResult.rows,
    currentCategory: categoriesResult.currentCategory ?? null,
  };
}

async function fetchProducts(query) {
  const {
    name,
    category,
    priceMin,
    priceMax,
    condition,
    shop,
    sort = "newest",
    page = 1,
    limit = 20,
  } = query;

  const offset = (page - 1) * limit;
  const where = ["p.is_active = 1"];
  const params = [];

  const add = (cond, sql, val) => {
    if (!cond) return;
    where.push(sql);
    params.push(val);
  };

  add(name, "p.name LIKE ?", `%${name}%`);
  add(priceMin, "p.price >= ?", Number(priceMin));
  add(priceMax, "p.price <= ?", Number(priceMax));
  add(condition, "p.item_condition LIKE ?", `%${condition}%`);
  add(shop, "p.store_id = ?", Number(shop));

  if (category) {
    where.push(`
        p.category_id IN (
          SELECT id FROM categories
          WHERE id = ? OR parent_id = ? AND is_active
        )
      `);
    params.push(Number(category), Number(category));
  }

  const SORT_MAP = {
    name_asc: "p.name ASC",
    name_desc: "p.name DESC",
    price_asc: "p.price ASC",
    price_desc: "p.price DESC",
    newest: "p.created_at DESC",
    oldest: "p.created_at ASC",
  };

  const productsSql = `
      SELECT
        p.id,
        p.name,
        p.category_id,
        p.store_id,
        p.item_condition,
        p.price,
        img.file_path AS thumbnail,
        s.address AS store_address,
        s.city AS store_city
      FROM products p
      LEFT JOIN product_images img
        ON img.product_id = p.id AND img.is_main
      LEFT JOIN stores s ON s.id = p.store_id
      WHERE ${where.join(" AND ")}
      ORDER BY ${SORT_MAP[sort] ?? SORT_MAP.newest}
      LIMIT ${limit} OFFSET ${offset}
    `;

  const [rows] = await promisePool.query(productsSql, [...params]);
  return { rows };
}

async function fetchCategories(query) {
  const { name, category } = query;
  const where = ["c.is_active"];
  const params = [];

  if (name) {
    where.push("p.name LIKE ?");
    params.push(`%${name}%`);
  }

  if (category) {
    where.push("c.parent_id = ?");
    params.push(Number(category));
  }

  const categorysql = `
      SELECT
        c.id,
        c.name,
        c.slug,
        c.parent_id,
        COUNT(p.id) AS productCount
      FROM categories c
      LEFT JOIN products p
        ON p.category_id = c.id
       AND p.is_active = 1
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      GROUP BY c.id, c.name, c.slug, c.parent_id
      ORDER BY c.name
      `;

  const [rows] = await promisePool.query(categorysql, params);

  const [[currentCategory]] = category
    ? await promisePool.query(`SELECT name FROM categories WHERE id = ?`, [
        category,
      ])
    : [[null]];

  return { rows, currentCategory };
}

async function fetchStores() {
  const [stores] = await promisePool.query(`SELECT * FROM stores`);
  return stores;
}

async function fetchOrders() {
  const [orders] = await promisePool.query(
    "SELECT o.id, u.name, u.surname, o.total_amount, o.status, o.created_at FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC"
  );
  return orders;
}

async function fetchLatestProducts() {
  const [products] = await promisePool.query(
    `SELECT p.id, p.name, p.price, p.store_id, p.is_active, p.created_at, img.file_path AS thumbnail FROM products p 
    LEFT JOIN product_images img ON img.product_id = p.id AND img.is_main ORDER BY p.created_at DESC`
  );
  return products;
}

function buildCategoryTree(items) {
  const map = new Map();
  items.forEach((i) => map.set(i.id, { ...i, children: [] }));
  const roots = [];
  for (const item of items) {
    const node = map.get(item.id);
    if (item.parent_id == null) {
      roots.push(node);
    } else {
      const parent = map.get(item.parent_id);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  }
  return roots;
}

function uploadToCloudinary(file, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve({
          uploadId: result.public_id,
          url: result.secure_url,
        });
      }
    );
    uploadStream.end(file.buffer);
  });
}

function getPublicIdFromUrl(url) {
  const parts = url.split("/");
  const fileName = parts.pop();
  return `products/${fileName.split(".")[0]}`;
}

async function deleteFromCloudinary(publicId) {
  return await cloudinary.uploader.destroy(publicId);
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

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Brak autoryzacji" });
    }
    const [rows] = await promisePool.query(
      "SELECT role FROM users WHERE id = ? AND is_active = 1",
      [req.session.userId]
    );
    const role = rows[0].role;
    if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Brak uprawnień administratora" });
    }
    req.userRole = role;
    next();
  } catch (err) {
    console.error("requireAdmin error:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

const requireOwner = async (req, res, next) => {
  const [rows] = await promisePool.query(
    "SELECT role FROM users WHERE id = ?",
    [req.session.userId]
  );
  if (rows[0]?.role !== "owner") {
    return res.json({ message: "Brak uprawnień do tej operacji" });
  }
  next();
};

module.exports = {
  getUserByEmail,
  getOrCreateCart,
  getToken,
  getPrices,
  buildCartSummary,
  getFilteredProducts,
  fetchStores,
  fetchOrders,
  fetchLatestProducts,
  buildCategoryTree,
  uploadToCloudinary,
  getPublicIdFromUrl,
  deleteFromCloudinary,
  calculateDeliverySum,
  requireAuth,
  requireAdmin,
  requireOwner,
};
