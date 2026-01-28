import { describe, expect, jest, beforeEach, it } from "@jest/globals";

const mockPost = jest.fn();
jest.unstable_mockModule("axios", () => ({
  default: {
    post: mockPost,
  },
}));

jest.unstable_mockModule("../../config/db.js", () => ({
  promisePool: {
    query: jest.fn(),
  },
}));

const { promisePool } = await import("../../config/db.js");
const axios = (await import("axios")).default;
const cartFunctions = await import("../../functions/cart.functions.js");

describe("Cart Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrCreateCart", () => {
    it("should return existing cart if found", async () => {
      const mockCart = { id: 10, user_id: 1 };
      promisePool.query.mockResolvedValueOnce([[mockCart]]);
      const cart = await cartFunctions.getOrCreateCart(1);
      expect(cart).toEqual(mockCart);
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM carts"),
        [1],
      );
    });

    it("should create new cart if not found", async () => {
      promisePool.query.mockResolvedValueOnce([[]]);
      promisePool.query.mockResolvedValueOnce([{ insertId: 99 }]);
      const cart = await cartFunctions.getOrCreateCart(1);
      expect(cart).toEqual({ id: 99, userId: 1 });
      expect(promisePool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO carts"),
        [1],
      );
    });
  });

  describe("getToken", () => {
    it("should fetch token from external API", async () => {
      mockPost.mockResolvedValueOnce({
        data: { access_token: "test_token_123" },
      });
      const token = await cartFunctions.getToken();
      expect(token).toBe("test_token_123");
      expect(mockPost).toHaveBeenCalledWith(
        "https://api.epaka.pl/oauth/token",
        expect.stringContaining("client_id="),
        expect.objectContaining({
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }),
      );
    });
  });

  describe("getPrices", () => {
    it("should fetch prices using token", async () => {
      mockPost.mockResolvedValueOnce({ data: { access_token: "mock_token" } });
      const mockCouriers = [{ name: "DHL", price: 15 }];
      mockPost.mockResolvedValueOnce({
        data: { couriers: mockCouriers },
      });
      const prices = await cartFunctions.getPrices({
        width: 10,
        height: 10,
        length: 10,
        weight: 1,
      });
      expect(prices).toEqual(mockCouriers);
      expect(mockPost).toHaveBeenNthCalledWith(
        2,
        "https://api.epaka.pl/v1/order/prices",
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock_token",
          }),
        }),
      );
    });
    it("should handle api errors gracefully", async () => {
      mockPost.mockResolvedValueOnce({ data: { access_token: "mock_token" } });
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      const error = { response: { data: "API Error" } };
      mockPost.mockRejectedValueOnce(error);
      await cartFunctions.getPrices({
        width: 10,
        height: 10,
        length: 10,
        weight: 1,
      });
      expect(consoleSpy).toHaveBeenCalledWith("API Error");
      consoleSpy.mockRestore();
    });
  });

  describe("calculateDeliverySum", () => {
    it("should sum up cheapest delivery when no selection is made", () => {
      const groups = [
        { store_id: 1, cheapestdelivery: 10 },
        { store_id: 2, cheapestdelivery: 20 },
      ];
      const sum = cartFunctions.calculateDeliverySum(groups, {});
      expect(sum).toBe(30);
    });
    it("should use selected delivery price if available", () => {
      const groups = [
        { store_id: 1, cheapestdelivery: 10 },
        { store_id: 2, cheapestdelivery: 20 },
      ];
      const selections = {
        1: { price: 15 },
      };
      const sum = cartFunctions.calculateDeliverySum(groups, selections);
      expect(sum).toBe(15 + 20);
    });
  });

  describe("buildCartSummary", () => {
    it("should group items by store and calculate delivery options", async () => {
      const items = [
        {
          id: 1,
          name: "P1",
          price: 100,
          quantity: 2,
          store_id: 5,
          size: '{"width":10,"height":10,"length":10,"weight":1}',
        },
        {
          id: 2,
          name: "P2",
          price: 50,
          quantity: 1,
          store_id: 5,
          size: '{"width":5,"height":5,"length":5,"weight":1}',
        },
      ];
      mockPost.mockResolvedValue({ data: { access_token: "token" } });
      mockPost.mockResolvedValue({
        data: { couriers: [{ grossPriceTotal: 25 }] },
      });
      let callCount = 0;
      mockPost.mockImplementation(async (url) => {
        if (url.includes("token")) return { data: { access_token: "token" } };
        if (url.includes("prices"))
          return { data: { couriers: [{ grossPriceTotal: 25 }] } };
        return {};
      });
      const result = await cartFunctions.buildCartSummary(items);
      expect(result.itemsSum).toBe(250);
      expect(result.groups).toHaveLength(1);
      expect(result.groups[0].store_id).toBe(5);
      expect(result.groups[0].size.width).toBe(15);
      expect(result.groups[0].cheapestdelivery).toBe(25);
    });
  });
});
