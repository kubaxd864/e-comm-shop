import { promisePool } from "../config/db.js";

export function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ message: "Użytkownik niezalogowany" });
}

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Brak autoryzacji" });
    }
    const [rows] = await promisePool.query(
      "SELECT role FROM users WHERE id = ? AND is_active = 1",
      [req.session.userId],
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

export const requireOwner = async (req, res, next) => {
  const [rows] = await promisePool.query(
    "SELECT role FROM users WHERE id = ?",
    [req.session.userId],
  );
  if (rows[0]?.role !== "owner") {
    return res.json({ message: "Brak uprawnień do tej operacji" });
  }
  next();
};

export async function getUserByEmail(email) {
  const [rows] = await promisePool.query(
    "SELECT id, email, password_hash, role, assigned_shop, is_active FROM users WHERE email = ?",
    [email],
  );
  return rows[0];
}
