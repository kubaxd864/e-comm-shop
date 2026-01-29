import { jest } from "@jest/globals";
import request from "supertest";

const mockQuery = jest.fn();
jest.unstable_mockModule("../../config/db.js", () => ({
  pool: {},
  promisePool: {
    query: mockQuery,
  },
}));

jest.unstable_mockModule("../../functions/auth.functions.js", () => ({
  requireAdmin: (req, res, next) => next(),
  requireOwner: (req, res, next) => next(),
  requireAuth: (req, res, next) => next(),
  getUserByEmail: jest.fn(),
}));

jest.unstable_mockModule("cloudinary", () => {
  const v2 = {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({}),
      upload_stream: jest.fn((opts, cb) => {
        cb(null, { secure_url: "http://test", public_id: "test" });
        return { end: jest.fn() };
      }),
      destroy: jest.fn(),
    },
  };
  return {
    default: { v2 },
    v2,
  };
});

jest.unstable_mockModule("../../config/session.js", () => ({
  sessionMiddleware: (req, res, next) => {
    req.session = {};
    next();
  },
  defaultSessionMaxAge: 1000,
  rememberMeMaxAge: 2000,
}));

const { default: app } = await import("../../index.js");

describe("Admin API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockResolvedValue([[], undefined]);
  });

  describe("GET Endpoints", () => {
    test("GET /api/admin/data should return 200", async () => {
      mockQuery.mockResolvedValueOnce([[{ total_sum: 1000 }]], undefined);
      const res = await request(app).get("/api/admin/data");
      expect(res.status).toBe(200);
    });

    test("GET /api/admin/get_products should return list", async () => {
      mockQuery.mockResolvedValueOnce(
        [[{ id: 1, name: "Prod1", price: 100 }]],
        undefined,
      );
      const res = await request(app).get("/api/admin/get_products");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.products)).toBeTruthy();
    });

    test("GET /api/admin/orders should return 200", async () => {
      const res = await request(app).get("/api/admin/orders");
      expect(res.status).toBe(200);
    });

    test("GET /api/admin/users should return 200", async () => {
      const res = await request(app).get("/api/admin/users");
      expect(res.status).toBe(200);
    });
  });

  describe("POST/PUT Endpoints", () => {
    test("POST /api/admin/add_product should return 200", async () => {
      mockQuery.mockResolvedValue([{ insertId: 1 }], undefined);
      const res = await request(app)
        .post("/api/admin/add_product")
        .field("product_name", "New Product")
        .field("price", 100)
        .field("category", 1)
        .field("description", "Desc")
        .field("quantity", 10)
        .field("shop", 1)
        .field("condition", "new")
        .field("size", "10/10/10/10")
        .field("parameters", "Color:Red,Material:Wood")
        .field("imageIsMain", [1])
        .attach("images", Buffer.from("fake"), { filename: "test.jpg" });

      expect(res.status).toBe(200);
    });

    test("PUT /api/admin/update_product/:id should return 200", async () => {
      mockQuery
        .mockResolvedValueOnce([{ affectedRows: 1 }], undefined)
        .mockResolvedValueOnce([[], undefined]);

      const res = await request(app)
        .put("/api/admin/update_product/1")
        .field("product_name", "Valid Update")
        .field("price", 200)
        .field("category", 1)
        .field("description", "Desc")
        .field("quantity", 10)
        .field("shop", 1)
        .field("condition", "new")
        .field("size", "20/20/20/20")
        .field("parameters", "Color:Blue")
        .field("imageIsMain", [])
        .field("existingImages", [])
        .field("existingImageIsMain", []);
      expect(res.status).toBe(200);
    });

    test("PUT /api/admin/delete_product/:id should return 200", async () => {
      const res = await request(app).put("/api/admin/delete_product/1");
      expect(res.status).toBe(200);
    });

    test("PUT /api/admin/update_order_status should return 200", async () => {
      const res = await request(app)
        .put("/api/admin/update_order_status")
        .send({ id: 1, status: "sent" });
      expect(res.status).toBe(200);
    });

    test("PUT /api/admin/update_user_status should return 200", async () => {
      const res = await request(app)
        .put("/api/admin/update_user_status")
        .send({ id: 1, is_active: false });
      expect(res.status).toBe(200);
    });

    test("POST /api/admin/add_category should return 200", async () => {
      const res = await request(app)
        .post("/api/admin/add_category")
        .send({ name: "Elektronika" });
      expect(res.status).toBe(200);
    });

    test("PUT /api/admin/update_category_status should return 200", async () => {
      const res = await request(app)
        .put("/api/admin/update_category_status")
        .send({ id: 1 });
      expect(res.status).toBe(200);
    });
  });
});
