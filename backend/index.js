require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bcrypt = require("bcrypt");
const cors = require("cors");
const Stripe = require("stripe");
const nodemailer = require("nodemailer");
const { upload } = require("./multer");
const { pool, promisePool } = require("./db");
const {
  getUserByEmail,
  getOrCreateCart,
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
} = require("./functions");
const app = express();
const PORT = 5000;
const defaultSessionMaxAge = 60 * 60 * 1000;
const rememberMeMaxAge = 24 * 60 * 60 * 1000;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const bcryptRounds = Number(process.env.BCRYPT_ROUNDS);
const sessionStore = new MySQLStore(
  {
    expiration: Number(24 * 60 * 60 * 1000),
    createDatabaseTable: true,
    schema: {
      tableName: "sessions",
      columnNames: {
        session_id: "session_id",
        expires: "expires",
        data: "data",
      },
    },
  },
  pool
);

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
  tls: { rejectUnauthorized: false },
});

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  session({
    key: "sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: defaultSessionMaxAge,
      domain: undefined,
    },
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Za duże obiążenie serwera, spróbuj ponownie",
});

app.post("/api/auth/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password, phone, state, postcode, city, address } =
      req.body;

    const existing = await getUserByEmail(email);
    if (existing)
      return res
        .status(400)
        .json({ message: "Ten Email jest już przypisany do Konta" });

    const password_hash = await bcrypt.hash(password, bcryptRounds);
    const firstName = name.split(" ")[0];
    const lastName = name.split(" ")[1];
    const [result] = await promisePool.query(
      "INSERT INTO users (name, surname, email, password_hash, phone, county, postcode, city, adress) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        firstName,
        lastName,
        email,
        password_hash,
        phone,
        state,
        postcode,
        city,
        address,
      ]
    );

    return res.status(201).json({
      message: "Stworzono Konto",
      userId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password, remember_me } = req.body;
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Niepoprawne Dane Logowania" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Niepoprawne Dane Logowania" });
    }

    if (!user.is_active) {
      return res.status(403).json({
        message: "Twoje konto zostało zablokowane",
      });
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error("Błąd Sesji", err);
        return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
      }
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.cookie.maxAge = remember_me
        ? rememberMeMaxAge
        : defaultSessionMaxAge;
      return res.json({ message: "Zalogowano Pomyślnie" });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Błąd Sesji", err);
        return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
      }

      res.clearCookie("sid", {
        path: "/",
        sameSite: "lax",
        secure: false,
        httpOnly: true,
      });
      return res.json({ message: "Wylogowano z Konta" });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
  }
});

app.get("/api/me", async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT id, name, surname, email, role, phone, county, postcode, city, adress FROM users WHERE id = ?",
      [req.session.userId]
    );
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
  }
});

app.put("/api/user_update", requireAuth, async (req, res) => {
  try {
    const { id, name, surname, email, phone, county, postcode, city, adress } =
      req.body;
    const [result] = await promisePool.query(
      `UPDATE users
      SET name = ?, surname = ?, email = ?, phone = ?, county = ?, postcode = ?, city = ?, adress = ?
      WHERE id = ?`,
      [name, surname, email, phone, county, postcode, city, adress, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nie znaleziono Użytkownika" });
    }
    return res.json({ message: "Dane zaktualizowano pomyślnie" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
  }
});

app.get("/api/get_products", async (req, res) => {
  const limit = req.query.limit;
  const offset = req.query.offset;
  try {
    const [rows] = await promisePool.query(
      `SELECT p.id, p.name, p.price, p.item_condition,
       img.file_path AS thumbnail,
       s.address AS store_address, s.city AS store_city
        FROM products p
       LEFT JOIN product_images img
        ON img.product_id = p.id AND img.is_main
       LEFT JOIN stores s
        ON s.id = p.store_id
       LEFT JOIN categories c 
        ON c.id = p.category_id
       WHERE p.is_active = 1 AND c.is_active
       ORDER BY p.created_at
       LIMIT ${limit} OFFSET ${offset}`
    );
    return res.json({ products: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas pobierania danych" });
  }
});

app.get("/api/get_product/data/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await promisePool.query(
      `SELECT p.name, p.description, p.item_condition, p.price, p.quantity, p.size, p.created_at, p.is_active, 
      c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.is_active AS category_active, s.id AS shop_id,
      s.name AS shop_name, s.email AS shop_email, s.phone AS shop_phone, s.address AS shop_address, s.city AS shop_city,
      GROUP_CONCAT(img.file_path SEPARATOR '||') AS images, MAX(CASE WHEN img.is_main = 1 THEN img.file_path END) AS thumbnail
      FROM products p
      LEFT JOIN product_images img ON img.product_id = p.id
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN stores s ON s.id = p.store_id
      WHERE p.id = ?`,
      [id]
    );
    if (rows[0].is_active == 0 || rows[0].category_active == 0) {
      return res.status(404).json({ message: "Nie znaleziono produktu" });
    }
    if (!rows[0])
      return res.status(404).json({ message: "Nie znaleziono produktu" });

    return res.json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas pobierania danych" });
  }
});

app.get("/api/get_simular_products", async (req, res) => {
  const { category_id, id } = req.query;
  try {
    const [rows] = await promisePool.query(
      `SELECT p.id, p.name, p.price, img.file_path FROM products p LEFT JOIN product_images img ON img.product_id = p.id AND img.is_main WHERE p.category_id = ? AND p.id != ? AND p.is_active`,
      [category_id, id]
    );
    return res.json({ products: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas pobierania danych" });
  }
});

app.get("/api/favorites", requireAuth, async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT p.id, p.name, p.price, p.item_condition, img.file_path thumbnail, s.address AS store_address, s.city AS store_city
     FROM favorites f
     JOIN products p ON p.id = f.product_id
     LEFT JOIN product_images img
     ON img.product_id = p.id AND img.is_main
     LEFT JOIN stores s
     ON s.id = p.store_id
     WHERE f.user_id = ? AND p.is_active
     ORDER BY f.created_at DESC`,
      [req.session.userId]
    );
    return res.json({ favorites: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas pobierania danych" });
  }
});

app.post("/api/favorites/:productId", requireAuth, async (req, res) => {
  try {
    await promisePool.query(
      `INSERT IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)`,
      [req.session.userId, req.params.productId]
    );
    return res.status(201).json({ message: "Dodano do Ulubionych" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas Dodawania" });
  }
});

app.delete("/api/favorites/:productId", requireAuth, async (req, res) => {
  try {
    await promisePool.query(
      `DELETE FROM favorites WHERE user_id = ? AND product_id = ?`,
      [req.session.userId, req.params.productId]
    );
    return res.json({ message: "Usunięto z Ulubionych" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas Usuwania" });
  }
});

app.get("/api/cart", requireAuth, async (req, res) => {
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
      [cart.id]
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
});

app.post("/api/cart/delivery", requireAuth, (req, res) => {
  const { storeId, price, method } = req.body;
  if (!req.session.deliverySelections) {
    req.session.deliverySelections = {};
  }
  req.session.deliverySelections[storeId] = { price, method };
  res.json({ success: true });
});

app.post("/api/cart/:productId", requireAuth, async (req, res) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.session.userId);
  const [stockRows] = await promisePool.query(
    "SELECT quantity AS stock FROM products WHERE id = ? FOR UPDATE",
    [productId]
  );
  const [existingRows] = await promisePool.query(
    "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? FOR UPDATE",
    [cart.id, productId]
  );
  const stock = Number(stockRows[0].stock);
  const quantity = Number(existingRows[0]?.quantity ?? 0);
  if (quantity + 1 > stock) {
    return res.status(400).json({ message: "Maksymalna ilość Produktu" });
  }
  if (quantity > 0) {
    await promisePool.query(
      "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
      [1, existingRows[0].id]
    );
  } else {
    await promisePool.query(
      "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
      [cart.id, productId, 1]
    );
  }
  res.json({ message: "Dodano do koszyka" });
});

app.post(
  "/api/cart/lowerquantity/:productId",
  requireAuth,
  async (req, res) => {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.session.userId);
    await promisePool.query(
      "UPDATE cart_items SET quantity = quantity - ? WHERE cart_id = ? AND product_id = ?",
      [1, cart.id, productId]
    );
    res.json({ message: "Zmniejszono Ilość" });
  }
);

app.delete("/api/cart/:productId", requireAuth, async (req, res) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.session.userId);
  await promisePool.query(
    "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
    [cart.id, productId]
  );
  res.json({ message: "Usunięto z koszyka" });
});

app.get("/api/stripe_config", requireAuth, (req, res) => {
  res.send({ publishablekey: process.env.STRIPE_PUBLIC_KEY });
});

app.post("/api/stripe/create-payment-intent", requireAuth, async (req, res) => {
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
  }
});

app.post("/api/make_order", requireAuth, async (req, res) => {
  const { items, itemsSum, deliverySum } = req.body;
  const amount = itemsSum + deliverySum;
  try {
    req.session.deliverySelections = {};
    const [order] = await promisePool.query(
      "INSERT INTO orders (user_id, total_amount) VALUES (?, ?)",
      [req.session.userId, amount.toFixed(2)]
    );
    const values = items.map((item) => [
      order.insertId,
      item.id,
      item.quantity,
      item.price,
    ]);
    await promisePool.query(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
      [values]
    );
    await promisePool.query("DELETE FROM carts WHERE user_id = ?", [
      req.session.userId,
    ]);
    const ids = items.map((item) => item.id);
    await promisePool.query(
      "UPDATE products SET is_active = 0 WHERE id IN (?)",
      [ids]
    );
    res.status(200).json({ message: "Złożono zamówienie" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas dokonywania zamówienia" });
  }
});

app.get("/api/my_orders", requireAuth, async (req, res) => {
  try {
    const [orders] = await promisePool.query(
      "SELECT o.id, o.total_amount, o.status, o.created_at FROM orders o WHERE user_id = ?",
      [req.session.userId]
    );
    if (!orders.length) return res.json({ orders: [] });

    const orderIds = orders.map((o) => o.id);
    const [items] = await promisePool.query(
      `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name AS product_name, img.file_path AS thumbnail
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       LEFT JOIN product_images img ON img.product_id = p.id AND img.is_main
       WHERE oi.order_id IN (?)`,
      [orderIds]
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
});

app.get("/api/products", async (req, res) => {
  try {
    const { products, pageNum, limitNum, categories, currentCategory } =
      await getFilteredProducts(req.query);
    const stores = await fetchStores();

    res.json({
      page: pageNum,
      limit: limitNum,
      count: products.length,
      products,
      categories,
      currentCategory: currentCategory ? currentCategory.name : null,
      stores,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Błąd podczas pobierania produktów",
    });
  }
});

app.get("/api/get_stores", async (req, res) => {
  const stores = await fetchStores();
  const [categories] = await promisePool.query(
    "SELECT id, name, parent_id, is_active FROM categories"
  );
  const tree = buildCategoryTree(categories);
  res.json({ stores, categories: tree });
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, shopId, subject, message } = req.body;
    await transporter.sendMail({
      from: `"Formularz kontaktowy" <jakubsobczyk2004@wp.pl>`,
      to: process.env.CONTACT_MAIL,
      replyTo: email,
      subject: `[Kontakt] ${subject}`,
      text: `Imię: ${name} E-mail: ${email}\n\n${message}`,
    });
    res.status(200).json({ message: "Wysłano" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Błąd Wysyłania",
    });
  }
});

app.get("/api/admin_data", requireAdmin, async (req, res) => {
  try {
    const [sum] = await promisePool.query(
      `SELECT SUM(total_amount) AS total_sum FROM orders`
    );
    const [weeklysum] = await promisePool.query(
      `SELECT SUM(total_amount) AS weekly_sum FROM orders WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)`
    );
    const [weeklysales] = await promisePool.query(`
      SELECT
        DATE(o.created_at) AS day,
        SUM(oi.quantity) AS items_sold
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.created_at >= CURDATE() - INTERVAL 6 DAY
        AND o.created_at < CURDATE() + INTERVAL 1 DAY
      GROUP BY DATE(o.created_at)
      ORDER BY DATE(o.created_at)
    `);
    const [weeklyNewUsers] = await promisePool.query(`
      SELECT DATE(u.created_at) AS day, COUNT(*) AS new_users
      FROM users u
      WHERE u.created_at >= CURDATE() - INTERVAL 6 DAY
        AND u.created_at < CURDATE() + INTERVAL 1 DAY
      GROUP BY DATE(u.created_at)
      ORDER BY DATE(u.created_at)
    `);
    const orders = await fetchOrders();
    const products = await fetchLatestProducts();
    res.json({
      sum,
      weeklysum,
      weeklysales,
      weeklyNewUsers,
      orders,
      products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Błąd Pobierania Danych",
    });
  }
});

app.post(
  "/api/admin/add_product",
  requireAdmin,
  upload.array("images"),
  async (req, res) => {
    try {
      const {
        product_name,
        category,
        description,
        quantity,
        size,
        shop,
        condition,
        price,
        imageIsMain,
      } = req.body;
      const [weight, width, height, length] = size.split("/").map(Number);
      const result = {
        weight: weight,
        width: width,
        height: height,
        length: length,
      };
      const [product] = await promisePool.query(
        "INSERT INTO products (name, category_id, description, quantity, size, store_id, item_condition, price, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          product_name,
          category,
          description,
          quantity,
          JSON.stringify(result),
          shop,
          condition,
          price,
          req.session.userId,
        ]
      );
      const productId = product.insertId;
      const uploadedImages = req.files?.length
        ? await Promise.all(
            req.files.map((file) =>
              uploadToCloudinary(file, `products/${productId}`)
            )
          )
        : [];
      const imagesToInsert = uploadedImages.map((item, idx) => [
        productId,
        item.url,
        imageIsMain[idx],
        `Zdjęcie Produktu`,
      ]);
      await promisePool.query(
        "INSERT INTO product_images (product_id, file_path, is_main, alt_text) VALUES ?",
        [imagesToInsert]
      );
      res.status(200).json({ message: "Dodano" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Błąd Dodawania" });
    }
  }
);

app.get("/api/admin/get_products", requireAdmin, async (req, res) => {
  try {
    const products = await fetchLatestProducts();
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd Dodawania" });
  }
});

app.put("/api/admin/delete_product/:id", requireAdmin, async (req, res) => {
  try {
    await promisePool.query(
      `UPDATE products
       SET is_active = NOT is_active
       WHERE id = ?`,
      [req.params.id]
    );
    return res.json({ message: "Zaktualizowano" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas Usuwania" });
  }
});

app.put(
  "/api/admin/update_product/:id",
  requireAdmin,
  upload.array("images"),
  async (req, res) => {
    try {
      const id = req.params.id;
      const {
        product_name,
        category,
        description,
        quantity,
        size,
        shop,
        condition,
        price,
        imageIsMain,
        existingImages,
        existingImageIsMain,
      } = req.body;
      const [weight, width, height, length] = size.split("/").map(Number);
      const result = {
        weight: weight,
        width: width,
        height: height,
        length: length,
      };
      await promisePool.query(
        `UPDATE products
        SET name = ?, category_id = ?, description = ?, quantity = ?, size = ?, store_id = ?, item_condition = ?, price = ?
        WHERE id = ?`,
        [
          product_name,
          category,
          description,
          quantity,
          JSON.stringify(result),
          shop,
          condition,
          price,
          id,
        ]
      );
      const [dbImages] = await promisePool.query(
        "SELECT * FROM product_images WHERE product_id = ?",
        [id]
      );
      const imagesToDelete = dbImages.filter(
        (img) => !existingImages.includes(img.file_path)
      );
      for (let i = 0; i < existingImages.length; i++) {
        await promisePool.query(
          "UPDATE product_images SET is_main = ? WHERE file_path = ? AND product_id = ?",
          [existingImageIsMain[i], existingImages[i], id]
        );
      }
      for (const img of imagesToDelete) {
        const publicId = getPublicIdFromUrl(img.file_path);
        await deleteFromCloudinary(publicId);
        await promisePool.query("DELETE FROM product_images WHERE id = ?", [
          img.id,
        ]);
      }
      const uploadedImages = req.files?.length
        ? await Promise.all(
            req.files.map((file) => uploadToCloudinary(file, `products/${id}`))
          )
        : [];
      if (uploadedImages.length > 0) {
        const imagesToInsert = uploadedImages.map((item, idx) => [
          id,
          item.url,
          imageIsMain[idx],
          `Zdjęcie Produktu`,
        ]);
        await promisePool.query(
          "INSERT INTO product_images (product_id, file_path, is_main, alt_text) VALUES ?",
          [imagesToInsert]
        );
      }
      res.status(200).json({ message: "Zaktualizowano" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Błąd podczas Aktualizacji" });
    }
  }
);

app.get("/api/admin/orders", requireAdmin, async (req, res) => {
  try {
    const orders = await fetchOrders();
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas Aktualizacji" });
  }
});

app.put("/api/admin/update_order_status", requireAdmin, async (req, res) => {
  try {
    const { id, status } = req.body;
    await promisePool.query("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    res.status(200).json({ message: "Zaktualizowano" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas Aktualizacji" });
  }
});

app.get("/api/admin/users", requireAdmin, async (req, res) => {
  try {
    const [users] = await promisePool.query(
      `SELECT id, name, surname, email, role, is_active, phone, county, postcode, city, adress, created_at
      FROM users ORDER BY CASE role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, created_at DESC`
    );
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas Aktualizacji" });
  }
});

app.put("/api/admin/update_user_status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    await promisePool.query(
      "UPDATE users SET is_active = NOT is_active WHERE id = ?",
      [id]
    );
    res.status(200).json({ message: "Zaktualizowano" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas Aktualizacji" });
  }
});

app.put("/api/admin/update_privilages", requireOwner, async (req, res) => {
  try {
    const { id } = req.body;
    const [rows] = await promisePool.query(
      "SELECT role FROM users WHERE id = ?",
      [id]
    );
    const currentRole = rows[0]?.role;
    if (currentRole === "owner") {
      return res
        .status(400)
        .json({ message: "Nie można zmienić roli właściciela" });
    }
    const nextRole = currentRole === "user" ? "admin" : "user";
    await promisePool.query("UPDATE users SET role = ? WHERE id = ?", [
      nextRole,
      id,
    ]);
    res.status(200).json({ message: "Zaktualizowano" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas Aktualizacji" });
  }
});

app.post("/api/admin/add_category", requireAdmin, async (req, res) => {
  try {
    const { name, slug, parent_id } = req.body;
    await promisePool.query(
      "INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)",
      [name, slug, parent_id]
    );
    res.status(200).json({ message: "Zaktualizowano" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas Aktualizacji" });
  }
});

app.put("/api/admin/update_category_status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    await promisePool.query(
      "UPDATE categories SET is_active = NOT is_active WHERE id = ?",
      [id]
    );
    res.status(200).json({ message: "Zaktualizowano" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas Aktualizacji" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
