import { promisePool } from "../config/db.js";

export async function getFilteredProducts(query) {
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
        p.promotion_price,
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

export async function fetchStores() {
  const [stores] = await promisePool.query(`SELECT * FROM stores`);
  return stores;
}
