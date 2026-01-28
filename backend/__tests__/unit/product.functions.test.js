import { describe, expect, jest, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../config/db.js", () => ({
  promisePool: {
    query: jest.fn(),
  },
}));

const { promisePool } = await import("../../config/db.js");
const productFunctions = await import("../../functions/product.functions.js");

describe("Product Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchStores", () => {
    it("should fetch all stores from database", async () => {
      const mockStores = [
        { id: 1, name: "Sklep Alfa" },
        { id: 2, name: "Sklep Beta" },
      ];
      promisePool.query.mockResolvedValueOnce([mockStores]);
      const result = await productFunctions.fetchStores();
      expect(result).toEqual(mockStores);
      expect(promisePool.query).toHaveBeenCalledWith("SELECT * FROM stores");
    });
  });

  describe("getFilteredProducts", () => {
    const mockDbSequence = (
      products = [],
      categories = [],
      currentCategory = null,
    ) => {
      promisePool.query
        .mockResolvedValueOnce([products])
        .mockResolvedValueOnce([categories]);
      if (currentCategory !== undefined) {
        promisePool.query.mockResolvedValueOnce([[currentCategory]]);
      }
    };
    it("should return empty products and categories when DB is empty", async () => {
      mockDbSequence([], [], undefined);
      const result = await productFunctions.getFilteredProducts({});
      expect(result.products).toEqual([]);
      expect(result.categories).toEqual([]);
      expect(result.currentCategory).toBeNull();
      expect(promisePool.query).toHaveBeenCalledTimes(2);
    });
    it("should construct correct SQL for filtering products (name, price, shop)", async () => {
      mockDbSequence();
      const query = {
        name: "Laptop",
        priceMin: 1000,
        priceMax: 5000,
        shop: 1,
        condition: "new",
      };
      await productFunctions.getFilteredProducts(query);
      const [sql, params] = promisePool.query.mock.calls[0];
      expect(sql).toContain("p.name LIKE ?");
      expect(sql).toContain("p.price >= ?");
      expect(sql).toContain("p.price <= ?");
      expect(sql).toContain("p.store_id = ?");
      expect(sql).toContain("p.item_condition LIKE ?");

      expect(params).toContain("%Laptop%");
      expect(params).toContain(1000);
      expect(params).toContain(5000);
      expect(params).toContain(1);
      expect(params).toContain("%new%");
    });
    it("should handle category filtering correctly (triggering subquery and currentCategory fetch)", async () => {
      promisePool.query.mockImplementation(async (sql) => {
        if (sql.includes("FROM products")) return [[]];
        if (sql.includes("categories c")) return [[]];
        if (sql.includes("SELECT name FROM categories"))
          return [[{ name: "Smartphones" }]];
        return [[]];
      });

      const query = { category: 5 };
      const result = await productFunctions.getFilteredProducts(query);
      expect(promisePool.query).toHaveBeenCalledTimes(3);
      const [prodSql, prodParams] = promisePool.query.mock.calls[0];
      expect(prodSql).toContain("p.category_id IN");
      expect(prodSql).toContain("SELECT id FROM categories");
      expect(prodParams).toEqual(expect.arrayContaining([5, 5]));
      const [catSql, catParams] = promisePool.query.mock.calls[1];
      expect(catSql).toContain("c.parent_id = ?");
      expect(catParams).toContain(5);
      const [currCatSql, currCatParams] = promisePool.query.mock.calls[2];
      expect(currCatSql).toContain("SELECT name FROM categories WHERE id = ?");
      expect(currCatParams).toEqual([5]);
      expect(result.currentCategory).toEqual({ name: "Smartphones" });
    });
    it("should handle pagination (offset/limit)", async () => {
      mockDbSequence();
      const query = { page: 2, limit: 10 };
      await productFunctions.getFilteredProducts(query);
      const [sql] = promisePool.query.mock.calls[0];
      expect(sql).toContain("LIMIT 10 OFFSET 10");
    });
    it("should apply correct sorting", async () => {
      const sortOptions = [
        { key: "price_asc", expected: "p.price ASC" },
        { key: "price_desc", expected: "p.price DESC" },
        { key: "name_asc", expected: "p.name ASC" },
        { key: "newest", expected: "p.created_at DESC" },
        { key: "oldest", expected: "p.created_at ASC" },
      ];
      for (const option of sortOptions) {
        jest.clearAllMocks();
        mockDbSequence();
        await productFunctions.getFilteredProducts({ sort: option.key });
        const [sql] = promisePool.query.mock.calls[0];
        expect(sql).toContain(`ORDER BY ${option.expected}`);
      }
    });

    it("should filter categories by name if provided in query", async () => {
      mockDbSequence();
      const query = { name: "Gaming" };
      await productFunctions.getFilteredProducts(query);
      const [sql, params] = promisePool.query.mock.calls[1];
      expect(sql).toContain("p.name LIKE ?");
      expect(params).toContain("%Gaming%");
    });
  });
});
