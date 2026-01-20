import { promisePool } from "../config/db.js";
import {
  getFilteredProducts,
  fetchStores,
} from "../functions/product.functions.js";

export const getProducts = async (req, res) => {
  const limit = req.query.limit;
  const offset = req.query.offset;
  try {
    const [rows] = await promisePool.query(
      `SELECT p.id, p.name, p.category_id, p.price, p.promotion_price, p.item_condition,
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
       LIMIT ${limit} OFFSET ${offset}`,
    );
    return res.json({ products: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas pobierania danych" });
  }
};

export const getProductData = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await promisePool.query(
      `SELECT p.name, p.description, p.item_condition, p.price, p.promotion_price, p.quantity, p.parameters, p.size, p.created_at, p.is_active, 
      c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.is_active AS category_active, s.id AS shop_id,
      s.name AS shop_name, s.email AS shop_email, s.phone AS shop_phone, s.address AS shop_address, s.city AS shop_city,
      GROUP_CONCAT(img.file_path SEPARATOR '||') AS images, MAX(CASE WHEN img.is_main = 1 THEN img.file_path END) AS thumbnail
      FROM products p
      LEFT JOIN product_images img ON img.product_id = p.id
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN stores s ON s.id = p.store_id
      WHERE p.id = ?`,
      [id],
    );

    if (!rows[0] || !rows[0].name) {
      // Check if product actually found (left join returns row of nulls if p.id matches nothing?) No, where p.id=? should return empty if not found, but GROUP BY aggregation might behave differently. Standard MySQL returns empty if no rows match WHERE.
      // However, promisePool query returns [rows]. If found rows[0] is object. If not found rows is empty[].
      // Wait, `rows` from mysql2 is array.
      if (rows.length === 0 || rows[0].name === null)
        return res.status(404).json({ message: "Nie znaleziono produktu" });
    }

    return res.json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas pobierania danych" });
  }
};

export const getSimilarProducts = async (req, res) => {
  const { category_id, id } = req.query;
  try {
    const [rows] = await promisePool.query(
      `SELECT p.id, p.name, p.price, img.file_path FROM products p LEFT JOIN product_images img ON img.product_id = p.id AND img.is_main WHERE p.category_id = ? AND p.id != ? AND p.is_active`,
      [category_id, id],
    );
    return res.json({ products: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Błąd podczas pobierania danych" });
  }
};

export const getFiltered = async (req, res) => {
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
};
