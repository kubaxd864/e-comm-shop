import { describe, expect, jest, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../config/db.js", () => ({
  promisePool: {
    query: jest.fn(),
  },
  pool: {},
}));

jest.unstable_mockModule("../../functions/shop.functions.js", () => ({
  buildCategoryTree: jest.fn(),
}));

jest.unstable_mockModule("../../functions/product.functions.js", () => ({
  fetchStores: jest.fn(),
}));

jest.unstable_mockModule("../../config/mail.js", () => ({
  transporter: {
    sendMail: jest.fn(),
  },
}));

const { promisePool } = await import("../../config/db.js");
const { transporter } = await import("../../config/mail.js");
const shopController = await import("../../controllers/shop.controller.js");
const shopFunctions = await import("../../functions/shop.functions.js");
const productFunctions = await import("../../functions/product.functions.js");

describe("Shop Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("getStores", () => {
    it("should fetch stores and categories, then return them", async () => {
      const mockStores = [{ id: 1, name: "Sklep Alfa" }];
      const mockCategories = [{ id: 10, name: "Elektronika" }];
      const mockTree = [{ id: 10, name: "Elektronika", children: [] }];
      productFunctions.fetchStores.mockResolvedValue(mockStores);
      promisePool.query.mockResolvedValue([mockCategories]);
      shopFunctions.buildCategoryTree.mockReturnValue(mockTree);
      await shopController.getStores(req, res);
      expect(productFunctions.fetchStores).toHaveBeenCalled();
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "SELECT id, name, parent_id, is_active FROM categories",
        ),
      );
      expect(shopFunctions.buildCategoryTree).toHaveBeenCalledWith(
        mockCategories,
      );
      expect(res.json).toHaveBeenCalledWith({
        stores: mockStores,
        categories: mockTree,
      });
    });
  });

  describe("contact", () => {
    it("should send email and return success message", async () => {
      req.body = {
        name: "Jan",
        email: "jan@example.mail",
        shopId: 1,
        subject: "Zapytanie o Produkt",
        message: "lorem ipsum",
      };
      transporter.sendMail.mockResolvedValue({ messageId: "123" });
      await shopController.contact(req, res);
      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `"Formularz kontaktowy" <jakubsobczyk2004@wp.pl>`,
          to: process.env.CONTACT_MAIL,
          replyTo: "jan@example.mail",
          subject: `[Kontakt] Zapytanie o Produkt`,
          text: `Imię: Jan E-mail: jan@example.mail\n\nlorem ipsum`,
        }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Wysłano" });
    });
    it("should handle email sending error", async () => {
      req.body = { name: "John" };
      transporter.sendMail.mockRejectedValue(new Error("SMTP Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await shopController.contact(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Błąd Wysyłania" });
      consoleSpy.mockRestore();
    });
  });
});
