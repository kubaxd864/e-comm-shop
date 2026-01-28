import { describe, expect, jest, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../config/db.js", () => ({
  promisePool: {
    query: jest.fn(),
  },
  pool: {},
}));

jest.unstable_mockModule("../../functions/cart.functions.js", () => ({
  getOrCreateCart: jest.fn(),
  buildCartSummary: jest.fn(),
  calculateDeliverySum: jest.fn(),
}));

const { promisePool } = await import("../../config/db.js");
const cartController = await import("../../controllers/cart.controller.js");
const cartFunctions = await import("../../functions/cart.functions.js");

describe("Cart Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      session: {
        userId: 1,
        deliverySelections: {},
      },
      params: { productId: 101 },
      body: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getCart", () => {
    it("should return cart object including: items, groupedItems, itemsSum, deliverySum", async () => {
      const mockCart = { id: 123 };
      const mockItems = [
        { id: 1, name: "Product", price: 100, store_id: 1, quantity: 1 },
      ];
      const mockGroups = [{ store_id: 1, items: mockItems }];
      const mockItemsSum = 100;
      const mockDeliverySum = 15;
      cartFunctions.getOrCreateCart.mockResolvedValue(mockCart);
      promisePool.query.mockResolvedValue([mockItems]);
      cartFunctions.buildCartSummary.mockResolvedValue({
        groups: mockGroups,
        itemsSum: mockItemsSum,
      });
      cartFunctions.calculateDeliverySum.mockReturnValue(mockDeliverySum);
      await cartController.getCart(req, res);
      expect(cartFunctions.getOrCreateCart).toHaveBeenCalledWith(1);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT p.id"),
        [123],
      );
      expect(cartFunctions.buildCartSummary).toHaveBeenCalledWith(mockItems);
      expect(res.json).toHaveBeenCalledWith({
        items: mockItems,
        groupedByStore: mockGroups,
        itemsSum: mockItemsSum,
        deliverySum: mockDeliverySum,
        deliverySelections: {},
      });
    });
    it("should handle database errors", async () => {
      cartFunctions.getOrCreateCart.mockRejectedValue(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await cartController.getCart(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd podczas pobierania danych",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("updateDelivery", () => {
    it("should initialize deliverySelections if missing and save selection", () => {
      req.body = { storeId: 1, price: 25.0, method: "DHL" };
      delete req.session.deliverySelections;
      cartController.updateDelivery(req, res);
      expect(req.session.deliverySelections).toBeDefined();
      expect(req.session.deliverySelections[1]).toEqual({
        price: 25.0,
        method: "DHL",
      });
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
    it("should update existing deliverySelections for a specific store", () => {
      req.session.deliverySelections = {
        2: { price: 13.99, method: "DPD" },
      };
      req.body = { storeId: 1, price: 15.0, method: "INPOST" };
      cartController.updateDelivery(req, res);
      expect(req.session.deliverySelections[1]).toEqual({
        price: 15.0,
        method: "INPOST",
      });
      expect(req.session.deliverySelections[2]).toEqual({
        price: 13.99,
        method: "DPD",
      });
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe("addToCart", () => {
    it("should add new product to cart", async () => {
      cartFunctions.getOrCreateCart.mockResolvedValue({ id: 1 });
      const mockStockRows = [{ stock: 10 }];
      const mockExistingRows = [];
      promisePool.query
        .mockResolvedValueOnce([mockStockRows])
        .mockResolvedValueOnce([mockExistingRows])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);
      await cartController.addToCart(req, res);
      expect(promisePool.query).toHaveBeenCalledTimes(3);
      expect(promisePool.query).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining("INSERT INTO cart_items"),
        [1, 101, 1],
      );
      expect(res.json).toHaveBeenCalledWith({ message: "Dodano do koszyka" });
    });
    it("should increment quantity if product already in cart", async () => {
      cartFunctions.getOrCreateCart.mockResolvedValue({ id: 1 });
      const mockStockRows = [{ stock: 10 }];
      const mockExistingRows = [{ id: 55, quantity: 2 }];
      promisePool.query
        .mockResolvedValueOnce([mockStockRows])
        .mockResolvedValueOnce([mockExistingRows])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);
      await cartController.addToCart(req, res);
      expect(promisePool.query).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining(
          "UPDATE cart_items SET quantity = quantity + ?",
        ),
        [1, 55],
      );
      expect(res.json).toHaveBeenCalledWith({ message: "Dodano do koszyka" });
    });
    it("should return error if quantity exceeds stock", async () => {
      cartFunctions.getOrCreateCart.mockResolvedValue({ id: 1 });
      const mockStockRows = [{ stock: 5 }];
      const mockExistingRows = [{ id: 55, quantity: 5 }];
      promisePool.query
        .mockResolvedValueOnce([mockStockRows])
        .mockResolvedValueOnce([mockExistingRows]);
      await cartController.addToCart(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Maksymalna ilość Produktu",
      });
      expect(promisePool.query).toHaveBeenCalledTimes(2);
    });
    it("should handle server errors", async () => {
      cartFunctions.getOrCreateCart.mockRejectedValue(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await cartController.addToCart(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Błąd serwera" });
      consoleSpy.mockRestore();
    });
  });

  describe("lowerQuantity", () => {
    it("should decrement product quantity", async () => {
      cartFunctions.getOrCreateCart.mockResolvedValue({ id: 1 });
      await cartController.lowerQuantity(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "UPDATE cart_items SET quantity = quantity - ?",
        ),
        [1, 1, 101],
      );
      expect(res.json).toHaveBeenCalledWith({ message: "Zmniejszono Ilość" });
    });
    it("should handle server errors", async () => {
      cartFunctions.getOrCreateCart.mockRejectedValue(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await cartController.lowerQuantity(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Błąd serwera" });
      consoleSpy.mockRestore();
    });
  });

  describe("removeFromCart", () => {
    it("should remove product from cart", async () => {
      cartFunctions.getOrCreateCart.mockResolvedValue({ id: 1 });
      await cartController.removeFromCart(req, res);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM cart_items WHERE cart_id = ?"),
        [1, 101],
      );
      expect(res.json).toHaveBeenCalledWith({ message: "Usunięto z koszyka" });
    });
    it("should handle server errors", async () => {
      cartFunctions.getOrCreateCart.mockRejectedValue(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await cartController.removeFromCart(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Błąd serwera" });
      consoleSpy.mockRestore();
    });
  });
});
