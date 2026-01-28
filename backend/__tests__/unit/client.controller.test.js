import { describe, expect, jest } from "@jest/globals";

jest.unstable_mockModule("../../config/db.js", () => ({
  promisePool: {
    query: jest.fn(),
  },
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
  compare: jest.fn(),
  hash: jest.fn(),
}));

const { promisePool } = await import("../../config/db.js");
const bcryptModule = await import("bcrypt");
const bcrypt = bcryptModule.default;
const clientController = await import("../../controllers/client.controller.js");

describe("Client Controller", () => {
  let req;
  let res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      session: {
        userId: 1,
      },
      body: {},
      params: {},
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe("me", () => {
    it("should return user data when user exists", async () => {
      const mockUser = {
        id: 1,
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        role: "client",
      };
      promisePool.query.mockResolvedValueOnce([[mockUser], undefined]);
      await clientController.me(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [req.session.userId],
      );
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });
    it("should handle database errors", async () => {
      const error = new Error("DB Error");
      promisePool.query.mockRejectedValueOnce(error);
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await clientController.me(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd wewnętrzny serwera",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("userUpdate", () => {
    it("should update user successfully", async () => {
      req.body = {
        id: 1,
        name: "Jane",
        surname: "Doe",
        email: "jane@example.com",
        phone: "123456789",
        county: "County",
        postcode: "00-000",
        city: "City",
        adress: "Street 1",
      };
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await clientController.userUpdate(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users"),
        [
          req.body.name,
          req.body.surname,
          req.body.email,
          req.body.phone,
          req.body.county,
          req.body.postcode,
          req.body.city,
          req.body.adress,
          req.body.id,
        ],
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Dane zaktualizowano pomyślnie",
      });
    });
    it("should return 404 if user not found", async () => {
      req.body = { id: 999 };
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
      await clientController.userUpdate(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nie znaleziono Użytkownika",
      });
    });
    it("should handle database errors", async () => {
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await clientController.userUpdate(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd wewnętrzny serwera",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("changePassword", () => {
    beforeEach(() => {
      req.body = {
        oldpassword: "oldPass",
        newpassword: "newPass",
      };
    });
    it("should change password successfully", async () => {
      const mockHash = "hashed_new_pass";
      const currentHash = "hashed_old_pass";

      promisePool.query.mockResolvedValueOnce([
        [{ password_hash: currentHash }],
      ]);
      bcrypt.compare.mockResolvedValueOnce(true);
      bcrypt.hash.mockResolvedValueOnce(mockHash);
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await clientController.changePassword(req, res);
      expect(bcrypt.compare).toHaveBeenCalledWith("oldPass", currentHash);
      expect(bcrypt.hash).toHaveBeenCalledWith("newPass", expect.any(Number));
      expect(promisePool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("UPDATE users SET password_hash"),
        [mockHash, req.session.userId],
      );
      expect(res.json).toHaveBeenCalledWith({ message: "Zmieniono hasło" });
    });
    it("should return 400 if old password is correct but matches new password", async () => {
      req.body.newpassword = "oldPass";
      const currentHash = "hashed_old_pass";
      promisePool.query.mockResolvedValueOnce([
        [{ password_hash: currentHash }],
      ]);
      bcrypt.compare.mockResolvedValueOnce(true);
      await clientController.changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nowe hasło nie może być takie samo jak stare",
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
    it("should return 400 if old password is incorrect", async () => {
      const currentHash = "hashed_actual_pass";
      promisePool.query.mockResolvedValueOnce([
        [{ password_hash: currentHash }],
      ]);
      bcrypt.compare.mockResolvedValueOnce(false);
      await clientController.changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Niepoprawne aktualne hasło",
      });
    });
    it("should handle errors", async () => {
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await clientController.changePassword(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas pobierania danych",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("getFavorites", () => {
    it("should return favorites list", async () => {
      const mockFavorites = [
        { id: 1, name: "Product 1", price: 100 },
        { id: 2, name: "Product 2", price: 200 },
      ];
      promisePool.query.mockResolvedValueOnce([mockFavorites]);
      await clientController.getFavorites(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [req.session.userId],
      );
      expect(res.json).toHaveBeenCalledWith({ favorites: mockFavorites });
    });
    it("should handle database errors", async () => {
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await clientController.getFavorites(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas pobierania danych",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("addFavorite", () => {
    it("should add a favorite successfully", async () => {
      req.params.productId = 123;
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await clientController.addFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Dodano do Ulubionych",
      });
    });
    it("should handle database errors", async () => {
      req.params.productId = 123;
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await clientController.addFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas Dodawania",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("removeFavorite", () => {
    it("should remove favorite product successfuly", async () => {
      req.params.productId = 99;
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await clientController.removeFavorite(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usunięto z Ulubionych",
      });
    });
    it("should handle database errors", async () => {
      req.params.productId = 123;
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await clientController.removeFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas Usuwania",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("getMyOrders", () => {
    it("should get orders list with products linked to orders", async () => {
      const mockOrders = [
        { id: 1, total_amount: 348.99, status: "opłacone" },
        { id: 2, name: "Product 2", price: 200 },
      ];
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await clientController.removeFavorite(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usunięto z Ulubionych",
      });
    });
    it("should handle database errors", async () => {
      req.params.productId = 123;
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await clientController.removeFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas Usuwania",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("removeFavorite", () => {
    it("should remove favorite successfully", async () => {
      req.params.productId = 123;
      promisePool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await clientController.removeFavorite(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM favorites"),
        [req.session.userId, 123],
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Usunięto z Ulubionych",
      });
    });
    it("should handle database errors", async () => {
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await clientController.removeFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas Usuwania",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("getMyOrders", () => {
    it("should return empty array when no orders found", async () => {
      promisePool.query.mockResolvedValueOnce([[]]);
      await clientController.getMyOrders(req, res);
      expect(promisePool.query).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ orders: [] });
    });
    it("should return orders with items when orders exist", async () => {
      const mockOrders = [
        { id: 1, total_amount: 100, status: "completed" },
        { id: 2, total_amount: 50, status: "pending" },
      ];
      const mockItems = [
        { order_id: 1, product_id: 101, name: "Prod1", quantity: 1 },
        { order_id: 1, product_id: 102, name: "Prod2", quantity: 2 },
        { order_id: 2, product_id: 103, name: "Prod3", quantity: 1 },
      ];
      promisePool.query.mockResolvedValueOnce([mockOrders]);
      promisePool.query.mockResolvedValueOnce([mockItems]);
      await clientController.getMyOrders(req, res);
      expect(promisePool.query).toHaveBeenCalledTimes(2);
      expect(promisePool.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("SELECT o.id"),
        [req.session.userId],
      );
      expect(promisePool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("SELECT oi.order_id"),
        [[1, 2]],
      );
      const expectedOrders = [
        {
          ...mockOrders[0],
          items: [mockItems[0], mockItems[1]],
        },
        {
          ...mockOrders[1],
          items: [mockItems[2]],
        },
      ];
      expect(res.json).toHaveBeenCalledWith({ orders: expectedOrders });
    });

    it("should handle orders with no items", async () => {
      const mockOrders = [{ id: 1 }];
      const mockItems = [];
      promisePool.query.mockResolvedValueOnce([mockOrders]);
      promisePool.query.mockResolvedValueOnce([mockItems]);
      await clientController.getMyOrders(req, res);
      expect(res.json).toHaveBeenCalledWith({
        orders: [{ id: 1, items: [] }],
      });
    });
    it("should handle database errors", async () => {
      promisePool.query.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await clientController.getMyOrders(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas pobierania zamówień",
      });
      consoleSpy.mockRestore();
    });
  });
});
