import { describe, expect, jest, beforeEach, it } from "@jest/globals";

const mockUploadStream = jest.fn();
const mockDestroy = jest.fn();
const mockConfig = jest.fn();

jest.unstable_mockModule("cloudinary", () => ({
  default: {
    v2: {
      config: mockConfig,
      uploader: {
        upload_stream: mockUploadStream,
        destroy: mockDestroy,
      },
    },
  },
}));

jest.unstable_mockModule("../../config/db.js", () => ({
  promisePool: {
    query: jest.fn(),
  },
  pool: {},
}));

const { promisePool } = await import("../../config/db.js");
const adminFunctions = await import("../../functions/admin.functions.js");

describe("Admin Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchOrders", () => {
    it("should execute SELECT query and return orders list", async () => {
      const mockOrders = [{ id: 1, total_amount: 79.99 }];
      promisePool.query.mockResolvedValueOnce([mockOrders]);
      const result = await adminFunctions.fetchOrders();
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT o.id, u.name"),
      );
      expect(result).toEqual(mockOrders);
    });
  });

  describe("fetchLatestProducts", () => {
    it("should execute SELECT query and return products list", async () => {
      const mockProducts = [{ id: 10, name: "Konsola Xbox One" }];
      promisePool.query.mockResolvedValueOnce([mockProducts]);
      const result = await adminFunctions.fetchLatestProducts();
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT p.id, p.name"),
      );
      expect(result).toEqual(mockProducts);
    });
  });

  describe("getPublicIdFromUrl", () => {
    it("should extract filename from link", () => {
      const url =
        "http://res.cloudinary.com/demo/image/upload/v123/folder/my-image.jpg";
      const result = adminFunctions.getPublicIdFromUrl(url);
      expect(result).toBe("products/my-image");
    });
    it("should handle clean filenames without paths", () => {
      const url = "simple-image.png";
      const result = adminFunctions.getPublicIdFromUrl(url);
      expect(result).toBe("products/simple-image");
    });
  });

  describe("deleteFromCloudinary", () => {
    it("should call uploader.destroy with provided publicId", async () => {
      const publicId = "products/item-123";
      mockDestroy.mockResolvedValue({ result: "ok" });
      await adminFunctions.deleteFromCloudinary(publicId);
      expect(mockDestroy).toHaveBeenCalledWith(publicId);
    });
  });

  describe("uploadToCloudinary", () => {
    it("should resolve with url and public_id on success", async () => {
      const mockFile = { buffer: Buffer.from("test-image") };
      const folder = "products/123";
      mockUploadStream.mockImplementation((options, callback) => {
        if (callback) {
          callback(null, {
            public_id: "res_id_123",
            secure_url: "http://cloudinary.com/img.jpg",
          });
        }
        return { end: jest.fn() };
      });
      const result = await adminFunctions.uploadToCloudinary(mockFile, folder);
      expect(mockUploadStream).toHaveBeenCalledWith(
        expect.objectContaining({ folder, resource_type: "auto" }),
        expect.any(Function),
      );
      expect(result).toEqual({
        uploadId: "res_id_123",
        url: "http://cloudinary.com/img.jpg",
      });
    });
    it("should reject error when upload fails", async () => {
      const mockFile = { buffer: Buffer.from("bad-image") };
      mockUploadStream.mockImplementation((options, callback) => {
        if (callback) {
          callback(new Error("Cloudinary Error"), null);
        }
        return { end: jest.fn() };
      });
      await expect(
        adminFunctions.uploadToCloudinary(mockFile, "folder"),
      ).rejects.toThrow("Cloudinary Error");
    });
  });
});
