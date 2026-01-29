import bcrypt from "bcrypt";
import { promisePool } from "../config/db.js";
import { getUserByEmail } from "../functions/auth.functions.js";
import { rememberMeMaxAge, defaultSessionMaxAge } from "../config/session.js";

const bcryptRounds = Number(process.env.BCRYPT_ROUNDS) || 10;

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, state, postcode, city, address } =
      req.body;

    const existing = await getUserByEmail(email);
    if (existing) {
      return res
        .status(400)
        .json({ message: "Ten Email jest już przypisany do Konta" });
    }

    const password_hash = await bcrypt.hash(password, bcryptRounds);
    const firstName = name.split(" ")[0];
    const lastName = name.split(" ")[1] || "";

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
      ],
    );

    return res.status(201).json({
      message: "Stworzono Konto",
      userId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
  }
};

export const login = async (req, res) => {
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
      return res
        .status(403)
        .json({ message: "Twoje konto zostało zablokowane" });
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error("Błąd Sesji", err);
        return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
      }
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.role = user.role;
      req.session.shop = user.assigned_shop;
      req.session.cookie.maxAge = remember_me
        ? rememberMeMaxAge
        : defaultSessionMaxAge;
      return res.status(200).json({ message: "Zalogowano Pomyślnie" });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
  }
};

export const logout = async (req, res) => {
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
      return res.status(200).json({ message: "Wylogowano z Konta" });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
  }
};
