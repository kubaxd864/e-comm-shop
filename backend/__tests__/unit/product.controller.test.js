import { describe, expect, jest } from "@jest/globals";

jest.unstable_mockModule("../../config/db.js", () => ({
  promisePool: {
    query: jest.fn(),
  },
  pool: {},
}));

jest.unstable_mockModule("../../functions/product.functions.js", () => ({
  getFilteredProducts: jest.fn(),
  fetchStores: jest.fn(),
}));

const { promisePool } = await import("../../config/db.js");
const productController =
  await import("../../controllers/product.controller.js");
const productFunctions = await import("../../functions/product.functions.js");

describe("Product Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("getProducts", () => {
    it("should return list of products", async () => {
      req.query = {
        limit: 20,
        offset: 1,
      };
      const mockedproducts = [
        {
          id: 1,
          name: "Konsola Xbox One",
          category_id: 2,
          price: 399,
          promotion_price: 359,
          item_condition: "nowy",
        },
        {
          id: 5,
          name: "Konsola Playstation 5",
          category_id: 2,
          price: 999,
          promotion_price: null,
          item_condition: "używany",
        },
      ];
      promisePool.query.mockResolvedValue([mockedproducts]);
      await productController.getProducts(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("LIMIT 20 OFFSET 1"),
      );
      expect(res.json).toHaveBeenCalledWith({ products: mockedproducts });
    });
  });
  it("should handle database errors", async () => {
    req.query = {
      limit: 20,
      offset: 1,
    };
    promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    await productController.getProducts(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Błąd podczas pobierania danych",
    });
    consoleSpy.mockRestore();
  });

  describe("getProductData", () => {
    it("should return product data when found", async () => {
      req.params = { id: 1 };
      const mockedProduct = {
        name: "Test Product",
        description: "Desc",
        price: 100,
      };
      promisePool.query.mockResolvedValue([[mockedProduct]]);
      await productController.getProductData(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT p.name"),
        [1],
      );
      expect(res.json).toHaveBeenCalledWith({ product: mockedProduct });
    });
    it("should return 404 when product is not found", async () => {
      req.params = { id: 999 };
      promisePool.query.mockResolvedValue([[]]);
      await productController.getProductData(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nie znaleziono produktu",
      });
    });
    it("should handle database errors", async () => {
      req.params = { id: 1 };
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await productController.getProductData(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas pobierania danych",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("getSimilarProducts", () => {
    it("should get list of similar products by id", async () => {
      req.query = {
        category_id: 2,
        id: 1,
      };
      const mockedproducts = [
        {
          id: 5,
          name: "Konsola Playstation 5",
          category_id: 2,
          price: 999,
          promotion_price: null,
          item_condition: "używany",
        },
      ];
      promisePool.query.mockResolvedValue([mockedproducts]);
      await productController.getSimilarProducts(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT p.id, p.name"),
        [2, 1],
      );
      expect(res.json).toHaveBeenCalledWith({ products: mockedproducts });
    });
    it("should handle database errors", async () => {
      req.query = {
        category_id: 2,
        id: 1,
      };
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await productController.getSimilarProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas pobierania danych",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("getFiltered", () => {
    it("should return object including products, categories, currentCategory, stores", async () => {
      req.query = { page: 1 };
      const filteredData = {
        products: [{ id: 1 }],
        pageNum: 1,
        limitNum: 20,
        categories: [{ id: 2, name: "Laptopy" }],
        currentCategory: { name: "Elektronika" },
      };
      const stores = [{ id: 1, name: "Sklep Alfa" }];
      productFunctions.getFilteredProducts.mockResolvedValue(filteredData);
      productFunctions.fetchStores.mockResolvedValue(stores);
      await productController.getFiltered(req, res);
      expect(productFunctions.getFilteredProducts).toHaveBeenCalledWith(
        req.query,
      );
      expect(productFunctions.fetchStores).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        count: 1,
        products: filteredData.products,
        categories: filteredData.categories,
        currentCategory: "Elektronika",
        stores,
      });
    });
    it("should handle null currentCategory", async () => {
      req.query = {};
      const filteredData = {
        products: [],
        pageNum: 1,
        limitNum: 20,
        categories: [],
        currentCategory: null,
      };
      productFunctions.getFilteredProducts.mockResolvedValue(filteredData);
      productFunctions.fetchStores.mockResolvedValue([]);
      await productController.getFiltered(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          currentCategory: null,
        }),
      );
    });
    it("should handle database errors", async () => {
      productFunctions.getFilteredProducts.mockRejectedValue(
        new Error("DB Error"),
      );
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await productController.getFiltered(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas pobierania produktów",
      });
      consoleSpy.mockRestore();
    });
  });
});
