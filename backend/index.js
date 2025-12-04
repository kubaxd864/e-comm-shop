require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bcrypt = require("bcrypt");
const cors = require("cors");
const { pool, promisePool } = require("./db");
const app = express();
const PORT = 5000;
const defaultSessionMaxAge = 60 * 60 * 1000;
const rememberMeMaxAge = 24 * 60 * 60 * 1000;
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

async function getUserByEmail(email) {
  const [rows] = await promisePool.query(
    "SELECT id, email, password_hash FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
}

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ message: "Użytkownik niezalogowany" });
}

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
    if (!user)
      return res.status(401).json({ message: "Niepoprawne Dane Logowania" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Niepoprawne Dane Logowania" });
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

app.get("/api/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT id, name, surname, email, role, phone, county, postcode, city, adress FROM users WHERE id = ?",
      [req.session.userId]
    );
    if (!rows[0])
      return res.status(404).json({ message: "Nie znaleziono Użytkownika" });

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
  try {
    const [rows] = await promisePool.query(
      `SELECT p.id, p.name, p.price, p.item_condition, img.file_path AS thumbnail, s.address AS store_address, s.city AS store_city
       FROM products p
       LEFT JOIN product_images img
         ON img.product_id = p.id
        AND img.alt_text = "Zdjęcie 1"
       LEFT JOIN stores s
         ON s.id = p.store_id
       LIMIT 20 OFFSET 0`
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
      `SELECT p.name, p.description, p.item_condition, p.price, p.created_at, c.id AS category_id, c.name AS category_name, c.slug AS category_slug, s.name AS shop_name, s.email AS shop_email, s.phone AS shop_phone, s.address AS shop_address, s.city AS shop_city, GROUP_CONCAT(img.file_path SEPARATOR '||') AS images 
      FROM products p LEFT JOIN product_images img ON img.product_id = p.id LEFT JOIN categories c ON c.id = p.category_id LEFT JOIN stores s ON s.id = p.store_id WHERE p.id = ?`,
      [id]
    );
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
      `SELECT p.id, p.name, p.price, img.file_path FROM products p LEFT JOIN product_images img ON img.product_id = p.id AND img.alt_text = 'Zdjęcie 1' WHERE p.category_id = ? AND p.id != ?`,
      [category_id, id]
    );
    return res.json({ products: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas pobierania danych" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
