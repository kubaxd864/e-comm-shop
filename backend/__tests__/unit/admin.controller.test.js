import { describe, expect, jest } from "@jest/globals";

jest.unstable_mockModule("../../config/db.js", () => ({
  promisePool: {
    query: jest.fn(),
  },
  pool: {},
}));

jest.unstable_mockModule("../../functions/admin.functions.js", () => ({
  fetchOrders: jest.fn(),
  fetchLatestProducts: jest.fn(),
  uploadToCloudinary: jest.fn(),
  deleteFromCloudinary: jest.fn(),
  getPublicIdFromUrl: jest.fn(),
}));

const { promisePool } = await import("../../config/db.js");
const adminController = await import("../../controllers/admin.controller.js");
const adminFunctions = await import("../../functions/admin.functions.js");

describe("Admin Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      session: {
        userId: 1,
      },
      params: {
        id: 1,
      },
      body: {},
      files: [],
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe("getAdminData", () => {
    it("should return data for creating graphs and calculating sales", async () => {
      promisePool.query
        .mockResolvedValueOnce([[{ total_sum: 1000 }]])
        .mockResolvedValueOnce([[{ weekly_sum: 200 }]])
        .mockResolvedValueOnce([[{ day: "2023-01-01", items_sold: 5 }]])
        .mockResolvedValueOnce([[{ day: "2023-01-01", new_users: 2 }]]);
      adminFunctions.fetchOrders.mockResolvedValue(["order1"]);
      adminFunctions.fetchLatestProducts.mockResolvedValue(["prod1"]);
      await adminController.getAdminData(req, res);
      expect(promisePool.query).toHaveBeenCalledTimes(4);
      expect(adminFunctions.fetchOrders).toHaveBeenCalled();
      expect(adminFunctions.fetchLatestProducts).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        sum: [{ total_sum: 1000 }],
        weeklysum: [{ weekly_sum: 200 }],
        weeklysales: [{ day: "2023-01-01", items_sold: 5 }],
        weeklyNewUsers: [{ day: "2023-01-01", new_users: 2 }],
        orders: ["order1"],
        products: ["prod1"],
      });
    });
    it("should handle connection errors", async () => {
      promisePool.query.mockRejectedValue(new Error("DB Connection Failed"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await adminController.getAdminData(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd Pobierania Danych",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("addProduct", () => {
    beforeEach(() => {
      req.body = {
        product_name: "Konsola Xbox One",
        category: 2,
        description: "Dziś w sprzedaży konsola xbox one",
        quantity: 1,
        size: "10/20/35/4",
        shop: 1,
        condition: "nowy",
        price: 50.99,
        parameters: "Marka: Microsoft, Model: One",
        promotion_price: null,
        imageIsMain: [1],
      };
      promisePool.query.mockResolvedValue([{ insertId: 230 }]);
    });
    it("should insert product and upload images successfully", async () => {
      req.files = [{ originalname: "img1.png", buffer: Buffer.from("abc") }];
      adminFunctions.uploadToCloudinary.mockResolvedValue({
        url: "http://cloudinary.com/img1.png",
      });
      await adminController.addProduct(req, res);
      expect(promisePool.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("INSERT INTO products"),
        expect.arrayContaining([
          "Konsola Xbox One",
          2,
          JSON.stringify({ weight: 10, width: 20, height: 35, length: 4 }),
          JSON.stringify({ marka: "Microsoft", model: "One" }),
          null,
        ]),
      );
      expect(adminFunctions.uploadToCloudinary).toHaveBeenCalled();
      expect(promisePool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO product_images"),
        [[[230, "http://cloudinary.com/img1.png", 1, "Zdjęcie Produktu"]]],
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Dodano" });
    });
    it("should insert product without images if no files provided", async () => {
      req.files = [];
      await adminController.addProduct(req, res);
      expect(promisePool.query).toHaveBeenCalledTimes(1);
      expect(adminFunctions.uploadToCloudinary).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
    it("should handle different promo price inputs correctly", async () => {
      req.body.promotion_price = "20";
      req.files = [];
      await adminController.addProduct(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([20]),
      );
    });
    it("should handle error during DB insert", async () => {
      promisePool.query.mockRejectedValue(new Error("Insert Failed"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await adminController.addProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Błąd Dodawania" });
      consoleSpy.mockRestore();
    });
  });

  describe("getAdminProducts", () => {
    it("should return full product list using fetchLatestProducts", async () => {
      const mockProducts = [
        {
          id: 2,
          name: "Konsola Xbox One",
          category: 2,
          price: 599.99,
        },
        {
          id: 3,
          name: "Konsola Playstation 5",
          category: 2,
          price: 799.99,
        },
      ];
      adminFunctions.fetchLatestProducts.mockResolvedValue(mockProducts);
      await adminController.getAdminProducts(req, res);
      expect(adminFunctions.fetchLatestProducts).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ products: mockProducts });
    });
    it("should handle errors from helper function", async () => {
      adminFunctions.fetchLatestProducts.mockRejectedValue(
        new Error("Fetch Failed"),
      );
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await adminController.getAdminProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Błąd Dodawania" });
      consoleSpy.mockRestore();
    });
  });

  describe("deleteProduct", () => {
    it("should update product status", async () => {
      req.params.id = 1;
      req.body.id = 1;
      promisePool.query.mockResolvedValueOnce([]);
      await adminController.deleteProduct(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringMatching(
          /UPDATE products\s+SET is_active = NOT is_active/,
        ),
        expect.arrayContaining([1]),
      );
      expect(res.json).toHaveBeenCalledWith({ message: "Zaktualizowano" });
    });
    it("should handle database errors", async () => {
      const error = new Error("DB Error");
      promisePool.query.mockRejectedValueOnce(error);
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await adminController.deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas Usuwania",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("updateProduct", () => {
    beforeEach(() => {
      req.params.id = 100;
      req.body = {
        product_name: "Updated Product",
        category: 5,
        description: "Updated Desc",
        quantity: 50,
        size: "5/10/15/20",
        shop: 1,
        condition: "used",
        price: 99.99,
        parameters: "Color: Blue",
        promotion_price: null,
        existingImages: ["old.jpg"],
        existingImageIsMain: [1],
        imageIsMain: [],
      };
      promisePool.query.mockResolvedValue([[{ id: 1, file_path: "old.jpg" }]]);
    });
    it("should update product data and handle images", async () => {
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      promisePool.query.mockResolvedValueOnce([
        [
          { id: 1, file_path: "old.jpg", is_main: 1 },
          { id: 2, file_path: "delete_me.jpg", is_main: 0 },
        ],
      ]);
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      adminFunctions.getPublicIdFromUrl.mockReturnValue("public_id_1");
      await adminController.updateProduct(req, res);
      expect(promisePool.query).toHaveBeenNthCalledWith(
        1,
        expect.stringMatching(/UPDATE products\s+SET name = \?,/),
        expect.arrayContaining(["Updated Product", 5, 100]),
      );
      expect(adminFunctions.deleteFromCloudinary).toHaveBeenCalledWith(
        "public_id_1",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Zaktualizowano" });
    });
    it("should upload new images if provided", async () => {
      req.files = [{ originalname: "new.png", buffer: Buffer.from("data") }];
      req.body.imageIsMain = [1];
      promisePool.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([[{ id: 1, file_path: "old.jpg" }]])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      adminFunctions.uploadToCloudinary.mockResolvedValue({
        url: "http://cloudinary/new.png",
      });
      await adminController.updateProduct(req, res);
      expect(adminFunctions.uploadToCloudinary).toHaveBeenCalled();
      expect(promisePool.query).toHaveBeenNthCalledWith(
        4,
        expect.stringContaining("INSERT INTO product_images"),
        expect.anything(),
      );
    });
    it("should handle update errors", async () => {
      promisePool.query.mockRejectedValue(new Error("Update Failed"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await adminController.updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas Aktualizacji",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("getOrders", () => {
    it("should return full orders list", async () => {
      adminFunctions.fetchOrders.mockResolvedValue(["order1"]);
      await adminController.getOrders(req, res);
      expect(adminFunctions.fetchOrders).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ orders: ["order1"] });
    });
    it("should handle update errors", async () => {
      adminFunctions.fetchOrders.mockRejectedValue(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await adminController.getOrders(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas Aktualizacji",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("updateOrderStatus", () => {
    it("should update order status by id", async () => {
      req.body = {
        id: 1,
        status: "opłacone",
      };
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await adminController.updateOrderStatus(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE orders SET status"),
        ["opłacone", 1],
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Zaktualizowano" });
    });

    it("should handle error during update", async () => {
      req.body = { id: 1, status: "opłacone" };
      promisePool.query.mockRejectedValue(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await adminController.updateOrderStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas Aktualizacji",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("getUsers", () => {
    it("should return full list of users", async () => {
      const mockUsers = [
        { id: 1, email: "jan@example.mail", role: "client", is_active: true },
        { id: 2, email: "jakub@example.mail", role: "admin", is_active: true },
      ];
      promisePool.query.mockResolvedValueOnce([mockUsers]);
      await adminController.getUsers(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, name, surname, email, role"),
      );
      expect(res.json).toHaveBeenCalledWith({ users: mockUsers });
    });
    it("should handle database errors", async () => {
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await adminController.getUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas Pobierania",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("updateUserStatus", () => {
    it("should update role of user by id", async () => {
      req.body = {
        id: 1,
      };
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await adminController.updateUserStatus(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users SET is_active"),
        [1],
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Zaktualizowano" });
    });
    it("should handle database errors", async () => {
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await adminController.updateUserStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas Aktualizacji",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("updatePrivilages", () => {
    it("should toggle role from user to admin", async () => {
      req.body = { id: 10 };
      promisePool.query.mockResolvedValueOnce([[{ role: "user" }]]);
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await adminController.updatePrivilages(req, res);
      expect(promisePool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("UPDATE users SET role = ?"),
        ["admin", 10],
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Zaktualizowano" });
    });

    it("should toggle role from admin to user", async () => {
      req.body = { id: 10 };
      promisePool.query.mockResolvedValueOnce([[{ role: "admin" }]]);
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await adminController.updatePrivilages(req, res);
      expect(promisePool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("UPDATE users SET role = ?"),
        ["user", 10],
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
    it("should prevent changing owner role", async () => {
      req.body = { id: 10 };
      promisePool.query.mockResolvedValueOnce([[{ role: "owner" }]]);
      await adminController.updatePrivilages(req, res);
      expect(promisePool.query).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nie można zmienić roli właściciela",
      });
    });
    it("should handle database errors", async () => {
      req.body = { id: 10 };
      promisePool.query.mockRejectedValue(new Error("DB Connection Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await adminController.updatePrivilages(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas Aktualizacji",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("addCategory", () => {
    it("should add new category to db", async () => {
      req.body = {
        name: "Konsole",
        slug: "konsole",
        parent_id: 1,
      };
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await adminController.addCategory(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO categories"),
        ["Konsole", "konsole", 1],
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Dodano Kategorię" });
    });
    it("should handle database errors", async () => {
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await adminController.addCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas Aktualizacji",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("updateCategoryStatus", () => {
    it("should update category status", async () => {
      req.body = {
        id: 1,
      };
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await adminController.updateCategoryStatus(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE categories SET is_active"),
        [1],
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Zaktualizowano" });
    });
    it("should handle database errors", async () => {
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await adminController.updateCategoryStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas Aktualizacji",
      });
      consoleSpy.mockRestore();
    });
  });
});
