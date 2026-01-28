import { describe, expect, jest, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../config/db.js", () => ({
  promisePool: {
    query: jest.fn(),
  },
  pool: {},
}));

const { promisePool } = await import("../../config/db.js");
const authFunctions = await import("../../functions/auth.functions.js");

describe("Auth Functions", () => {
  let req, res, next;

  beforeEach(() => {
    req = { session: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("requireAuth", () => {
    it("should call next() if user is logged in", () => {
      req.session.userId = 1;
      authFunctions.requireAuth(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
    it("should return 401 if user is not logged in", () => {
      delete req.session.userId;
      authFunctions.requireAuth(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Użytkownik niezalogowany",
      });
    });
    it("should return 401 if session is missing", () => {
      delete req.session;
      authFunctions.requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe("requireAdmin", () => {
    it("should allow admin access", async () => {
      req.session.userId = 1;
      promisePool.query.mockResolvedValueOnce([[{ role: "admin" }]]);
      await authFunctions.requireAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.userRole).toBe("admin");
    });
    it("should allow owner access", async () => {
      req.session.userId = 1;
      promisePool.query.mockResolvedValueOnce([[{ role: "owner" }]]);
      await authFunctions.requireAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.userRole).toBe("owner");
    });
    it("should return 403 if user is just a regular user", async () => {
      req.session.userId = 1;
      promisePool.query.mockResolvedValueOnce([[{ role: "user" }]]);
      await authFunctions.requireAdmin(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Brak uprawnień administratora",
      });
    });
    it("should return 401 if not logged in", async () => {
      delete req.session.userId;
      await authFunctions.requireAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Brak autoryzacji" });
    });
    it("should handle database errors", async () => {
      req.session.userId = 1;
      promisePool.query.mockRejectedValue(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await authFunctions.requireAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Błąd serwera" });
      consoleSpy.mockRestore();
    });
  });

  describe("requireOwner", () => {
    it("should call next() if user have owner status", async () => {
      req.session.userId = 1;
      promisePool.query.mockResolvedValueOnce([[{ role: "owner" }]]);
      await authFunctions.requireOwner(req, res, next);
      expect(next).toHaveBeenCalled();
    });
    it("should return 403 if user is not owner", async () => {
      req.session.userId = 1;
      promisePool.query.mockResolvedValueOnce([[{ role: "admin" }]]);
      await authFunctions.requireOwner(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Brak uprawnień do tej operacji",
      });
    });
  });
});
