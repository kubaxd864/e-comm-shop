import { jest } from "@jest/globals";
import request from "supertest";

const mockQuery = jest.fn();
jest.unstable_mockModule("../../config/db.js", () => ({
  pool: {},
  promisePool: {
    query: mockQuery,
    execute: mockQuery,
  },
}));

jest.unstable_mockModule("../../config/session.js", () => ({
  sessionMiddleware: (req, res, next) => {
    if (!req.session) req.session = {};
    next();
  },
  defaultSessionMaxAge: 60 * 60 * 1000,
  rememberMeMaxAge: 24 * 60 * 60 * 1000,
}));

const mockGetFilteredProducts = jest.fn();
const mockFetchStores = jest.fn();
jest.unstable_mockModule("../../functions/product.functions.js", () => ({
  getFilteredProducts: mockGetFilteredProducts,
  fetchStores: mockFetchStores,
}));

jest.unstable_mockModule("../../config/stripe.js", () => ({
  stripe: {},
}));

const { default: app } = await import("../../index.js");

describe("Product API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/get_products should return products list", async () => {
    const mockProducts = [{ id: 1, name: "Xbox", price: 799 }];
    mockQuery.mockResolvedValueOnce([mockProducts, undefined]);
    const res = await request(app)
      .get("/api/get_products")
      .query({ limit: 10, offset: 0 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ products: mockProducts });
  });

  test("GET /api/get_product/data/:id should return details", async () => {
    const mockDetails = { name: "Xbox", description: "Opis", price: 799 };
    mockQuery.mockResolvedValueOnce([[mockDetails], undefined]);
    const res = await request(app).get("/api/get_product/data/5");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ product: mockDetails });
  });

  test("GET /api/get_product/data/:id should returning 404 if missing", async () => {
    mockQuery.mockResolvedValueOnce([[], undefined]);
    const res = await request(app).get("/api/get_product/data/999");
    expect(res.statusCode).toBe(404);
  });

  test("GET /api/get_simular_products should return similar products", async () => {
    const mockSimilar = [{ id: 2, name: "PS5" }];
    mockQuery.mockResolvedValueOnce([mockSimilar, undefined]);
    const res = await request(app)
      .get("/api/get_simular_products")
      .query({ category_id: 1, id: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ products: mockSimilar });
  });

  test("GET /api/products should use filtered functions", async () => {
    mockGetFilteredProducts.mockResolvedValue({
      products: [{ id: 1, name: "Laptop Razer 2022" }],
      pageNum: 1,
      limitNum: 20,
      categories: [],
      currentCategory: { name: "Elektronika" },
    });
    mockFetchStores.mockResolvedValue([]);
    const res = await request(app)
      .get("/api/products")
      .query({ category: "elektronika" });
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.currentCategory).toBe("Elektronika");
    expect(mockGetFilteredProducts).toHaveBeenCalled();
  });
});
