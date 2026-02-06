import { promisePool } from "../config/db.js";
import axios from "axios";
import {
  fetchOrders,
  fetchLatestProducts,
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from "../functions/admin.functions.js";

export const getAdminData = async (req, res) => {
  try {
    const [sum] = await promisePool.query(
      `SELECT SUM(total_amount) AS total_sum FROM orders`,
    );
    const [weeklysum] = await promisePool.query(
      `SELECT SUM(total_amount) AS weekly_sum FROM orders WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)`,
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
};

export const addProduct = async (req, res) => {
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
      parameters,
      promotion_price,
      imageIsMain,
    } = req.body;
    const [weight, width, height, length] = size.split("/").map(Number);
    const result = {
      weight: weight,
      width: width,
      height: height,
      length: length,
    };
    const promoPrice =
      promotion_price === undefined ||
      promotion_price === null ||
      promotion_price === "null" ||
      promotion_price === ""
        ? null
        : Number(promotion_price);
    const product_parameters = Object.fromEntries(
      parameters.split(",").map((part) => {
        const [key, value] = part.split(":").map((s) => s.trim());
        return [key.toLowerCase(), value];
      }),
    );
    const [product] = await promisePool.query(
      "INSERT INTO products (name, category_id, description, quantity, size, parameters, store_id, item_condition, price, promotion_price, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        product_name,
        category,
        description,
        quantity,
        JSON.stringify(result),
        JSON.stringify(product_parameters),
        shop,
        condition,
        price,
        promoPrice,
        req.session.userId,
      ],
    );
    const productId = product.insertId;
    const uploadedImages = req.files?.length
      ? await Promise.all(
          req.files.map((file) =>
            uploadToCloudinary(file, `products/${productId}`),
          ),
        )
      : [];
    const imagesToInsert = uploadedImages.map((item, idx) => [
      productId,
      item.url,
      imageIsMain[idx],
      `Zdjęcie Produktu`,
    ]);
    if (imagesToInsert.length > 0) {
      await promisePool.query(
        "INSERT INTO product_images (product_id, file_path, is_main, alt_text) VALUES ?",
        [imagesToInsert],
      );
    }
    res.status(200).json({ message: "Dodano" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd Dodawania" });
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const products = await fetchLatestProducts();
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd Dodawania" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await promisePool.query(
      `UPDATE products
       SET is_active = NOT is_active
       WHERE id = ?`,
      [req.params.id],
    );
    return res.json({ message: "Zaktualizowano" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas Usuwania" });
  }
};

export const updateProduct = async (req, res) => {
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
      parameters,
      promotion_price,
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
    const promoPrice =
      promotion_price === undefined ||
      promotion_price === null ||
      promotion_price === "null" ||
      promotion_price === ""
        ? null
        : Number(promotion_price);
    const product_parameters = Object.fromEntries(
      parameters.split(",").map((part) => {
        const [key, value] = part.split(":").map((s) => s.trim());
        return [key.toLowerCase(), value];
      }),
    );
    const normalizedExistingImages = Array.isArray(existingImages)
      ? existingImages
      : existingImages
        ? [existingImages]
        : [];
    const normalizedExistingImageIsMain = Array.isArray(existingImageIsMain)
      ? existingImageIsMain
      : existingImageIsMain
        ? [existingImageIsMain]
        : [];
    const normalizedImageIsMain = Array.isArray(imageIsMain)
      ? imageIsMain
      : imageIsMain
        ? [imageIsMain]
        : [];
    await promisePool.query(
      `UPDATE products
      SET name = ?, category_id = ?, description = ?, quantity = ?, size = ?, parameters = ?, store_id = ?, item_condition = ?, price = ?, promotion_price = ?
      WHERE id = ?`,
      [
        product_name,
        category,
        description,
        quantity,
        JSON.stringify(result),
        JSON.stringify(product_parameters),
        shop,
        condition,
        price,
        promoPrice,
        id,
      ],
    );
    const [dbImages] = await promisePool.query(
      "SELECT * FROM product_images WHERE product_id = ?",
      [id],
    );
    const imagesToDelete = dbImages.filter(
      (img) => !normalizedExistingImages.includes(img.file_path),
    );
    for (let i = 0; i < normalizedExistingImages.length; i++) {
      await promisePool.query(
        "UPDATE product_images SET is_main = ? WHERE file_path = ? AND product_id = ?",
        [
          normalizedExistingImageIsMain[i] ??
            normalizedExistingImageIsMain[0] ??
            0,
          normalizedExistingImages[i],
          id,
        ],
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
          req.files.map((file) => uploadToCloudinary(file, `products/${id}`)),
        )
      : [];
    if (uploadedImages.length > 0) {
      const imagesToInsert = uploadedImages.map((item, idx) => [
        id,
        item.url,
        normalizedImageIsMain[idx] ?? normalizedImageIsMain[0] ?? 0,
        `Zdjęcie Produktu`,
      ]);
      await promisePool.query(
        "INSERT INTO product_images (product_id, file_path, is_main, alt_text) VALUES ?",
        [imagesToInsert],
      );
    }
    res.status(200).json({ message: "Zaktualizowano" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas Aktualizacji" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await fetchOrders();
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas Aktualizacji" });
  }
};

export const updateOrderStatus = async (req, res) => {
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
};

export const getUsers = async (req, res) => {
  try {
    const [users] = await promisePool.query(
      `SELECT id, name, surname, email, role, is_active, phone, county, postcode, city, adress, created_at
      FROM users ORDER BY CASE role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, created_at DESC`,
    );
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas Pobierania" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.body;
    await promisePool.query(
      "UPDATE users SET is_active = NOT is_active WHERE id = ?",
      [id],
    );
    res.status(200).json({ message: "Zaktualizowano" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas Aktualizacji" });
  }
};

export const updatePrivilages = async (req, res) => {
  try {
    const { id } = req.body;
    const [rows] = await promisePool.query(
      "SELECT role FROM users WHERE id = ?",
      [id],
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
};

export const addCategory = async (req, res) => {
  try {
    const { name, slug, parent_id } = req.body;
    await promisePool.query(
      "INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)",
      [name, slug, parent_id],
    );
    res.status(200).json({ message: "Dodano Kategorię" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas Aktualizacji" });
  }
};

export const updateCategoryStatus = async (req, res) => {
  try {
    const { id } = req.body;
    await promisePool.query(
      "UPDATE categories SET is_active = NOT is_active WHERE id = ?",
      [id],
    );
    res.status(200).json({ message: "Zaktualizowano" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Błąd podczas Aktualizacji" });
  }
};

export const getChatResponse = async (req, res) => {
  try {
    const { prompt } = req.query;
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          },
        );
        const generatedText = response.data.candidates[0].content.parts[0].text;
        return res.status(200).json({ content: generatedText });
      } catch (geminiError) {
        console.error(
          "Gemini API Error:",
          geminiError.response?.data || geminiError.message,
        );
      }
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
};
