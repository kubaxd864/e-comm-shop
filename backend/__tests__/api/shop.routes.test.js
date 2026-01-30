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

const mockFetchStores = jest.fn();
jest.unstable_mockModule("../../functions/product.functions.js", () => ({
  fetchStores: mockFetchStores,
  getFilteredProducts: jest.fn(),
}));

const mockBuildCategoryTree = jest.fn();
jest.unstable_mockModule("../../functions/shop.functions.js", () => ({
  buildCategoryTree: mockBuildCategoryTree,
}));

const mockSendMail = jest.fn();
jest.unstable_mockModule("../../config/mail.js", () => ({
  transporter: {
    sendMail: mockSendMail,
  },
}));

jest.unstable_mockModule("../../functions/auth.functions.js", () => ({
  getUserByEmail: jest.fn(),
  requireAuth: jest.fn((req, res, next) => {
    req.session = req.session || {};
    next();
  }),
  requireAdmin: jest.fn((req, res, next) => next()),
  requireOwner: jest.fn((req, res, next) => next()),
}));

jest.unstable_mockModule("../../config/stripe.js", () => ({
  stripe: {},
}));

const { default: app } = await import("../../index.js");

describe("Shop API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/get_stores should return stores and categories", async () => {
    const mockStores = [{ id: 1, name: "Sklep Testowy" }];
    mockFetchStores.mockResolvedValue(mockStores);
    const mockCategoriesDB = [{ id: 1, name: "Elektronika", parent_id: null }];
    mockQuery.mockResolvedValueOnce([mockCategoriesDB, undefined]);
    const mockTree = [{ id: 1, name: "Elektronika", children: [] }];
    mockBuildCategoryTree.mockReturnValue(mockTree);
    const res = await request(app).get("/api/get_stores");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      stores: mockStores,
      categories: mockTree,
    });
    expect(mockFetchStores).toHaveBeenCalled();
    expect(mockBuildCategoryTree).toHaveBeenCalledWith(mockCategoriesDB);
  });

  test("POST /api/contact should send email successfully", async () => {
    mockSendMail.mockResolvedValueOnce(true);
    const res = await request(app).post("/api/contact").send({
      name: "Jan",
      email: "jan@test.mail",
      subject: "Pytanie",
      message: "Treść wiadomości",
      shopId: 1,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Wysłano" });
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: process.env.CONTACT_MAIL,
        subject: expect.stringContaining("Pytanie"),
      }),
    );
  });

  test("POST /api/contact should handle mailer errors", async () => {
    mockSendMail.mockRejectedValueOnce(new Error("SMTP Error"));
    const res = await request(app).post("/api/contact").send({
      name: "Jan",
      email: "jan@test.mail",
      subject: "Błąd",
      message: "Treść",
    });
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: "Błąd Wysyłania" });
  });
});
