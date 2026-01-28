import { describe, expect, jest } from "@jest/globals";

jest.unstable_mockModule("../../config/db.js", () => ({
  promisePool: {
    query: jest.fn(),
  },
  pool: {},
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.unstable_mockModule("../../functions/auth.functions.js", () => ({
  getUserByEmail: jest.fn(),
  requireAuth: jest.fn(),
  requireAdmin: jest.fn(),
  requireOwner: jest.fn(),
}));

const { promisePool } = await import("../../config/db.js");
const bcryptModule = await import("bcrypt");
const bcrypt = bcryptModule.default;
const authFunctions = await import("../../functions/auth.functions.js");
const authController = await import("../../controllers/auth.controller.js");

describe("Auth Controller", () => {
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
  describe("register", () => {
    it("register new account into database", async () => {
      req.body = {
        name: "Jan Kowalski",
        email: "jan234@tempmail.com",
        password: "haslo123",
        phone: "535333222",
        state: "pomorskie",
        postcode: "80-290",
        city: "Gdańsk",
        address: "Grunwaldzka 472F",
      };
      authFunctions.getUserByEmail.mockResolvedValue(false);
      bcrypt.hash.mockResolvedValue("hashed_password_123");
      promisePool.query.mockResolvedValueOnce([
        { insertId: 99, affectedRows: 1 },
      ]);
      await authController.register(req, res);
      expect(authFunctions.getUserByEmail).toHaveBeenCalledWith(
        "jan234@tempmail.com",
      );
      expect(bcrypt.hash).toHaveBeenCalledWith("haslo123", expect.any(Number));
      expect(promisePool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        expect.any(Array),
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Stworzono Konto",
        userId: 99,
      });
    });
    it("should return 404 if email is already assigned to account", async () => {
      req.body = {
        name: "Jan Kowalski",
        email: "jan234@tempmail.com",
        password: "haslo123",
        phone: "535333222",
        state: "pomorskie",
        postcode: "80-290",
        city: "Gdańsk",
        address: "Grunwaldzka 472F",
      };
      authFunctions.getUserByEmail.mockResolvedValue(true);
      await authController.register(req, res);
      expect(authFunctions.getUserByEmail).toHaveBeenCalledWith(
        "jan234@tempmail.com",
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ten Email jest już przypisany do Konta",
      });
    });
    it("should handle database errors", async () => {
      req.body = {
        name: "Jan Kowalski",
        email: "jan234@tempmail.com",
        password: "haslo123",
        phone: "535333222",
        state: "pomorskie",
        postcode: "80-290",
        city: "Gdańsk",
        address: "Grunwaldzka 472F",
      };
      authFunctions.getUserByEmail.mockResolvedValue(false);
      bcrypt.hash.mockResolvedValue("hashed_pass");
      const error = new Error("DB Error");
      promisePool.query.mockRejectedValueOnce(error);
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd wewnętrzny serwera",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("login", () => {
    it("should return 401 if username is not in the database", async () => {
      req.body = {
        email: "jan234@tempmail.com",
        password: "haslo123",
        remember_me: true,
      };
      authFunctions.getUserByEmail.mockResolvedValue(false);
      await authController.login(req, res);
      expect(authFunctions.getUserByEmail).toHaveBeenCalledWith(
        "jan234@tempmail.com",
      );
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Niepoprawne Dane Logowania",
      });
    });
    it("should return 401 if password is incorrect", async () => {
      req.body = {
        email: "jan234@tempmail.com",
        password: "haslo123",
        remember_me: true,
      };
      authFunctions.getUserByEmail.mockResolvedValue(true);
      bcrypt.compare.mockResolvedValueOnce(false);
      await authController.login(req, res);
      expect(authFunctions.getUserByEmail).toHaveBeenCalledWith(
        "jan234@tempmail.com",
      );
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Niepoprawne Dane Logowania",
      });
    });
    it("should return 401 if password is incorrect", async () => {
      req.body = {
        email: "jan234@tempmail.com",
        password: "haslo123",
        remember_me: true,
      };
      authFunctions.getUserByEmail.mockResolvedValue(true);
      bcrypt.compare.mockResolvedValueOnce(false);
      await authController.login(req, res);
      expect(authFunctions.getUserByEmail).toHaveBeenCalledWith(
        "jan234@tempmail.com",
      );
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Niepoprawne Dane Logowania",
      });
    });
    it("should return 403 if account is blocked", async () => {
      req.body = {
        email: "jan234@tempmail.com",
        password: "haslo123",
        remember_me: true,
      };
      const mockUser = {
        id: 1,
        email: "jan234@tempmail.com",
        password: "haslo123",
        is_active: 0,
      };
      authFunctions.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Twoje konto zostało zablokowane",
      });
    });

    it("should handle session errors", async () => {
      req.body = {
        email: "jan234@tempmail.com",
        password: "haslo123",
        remember_me: true,
      };
      const mockUser = {
        id: 1,
        email: "jan234@tempmail.com",
        role: "client",
        is_active: 1,
        assigned_shop: null,
      };
      authFunctions.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      req.session.regenerate = jest.fn((callback) => {
        callback(new Error("Session error"));
      });
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd wewnętrzny serwera",
      });
      consoleSpy.mockRestore();
    });
    it("should login successfully", async () => {
      req.body = {
        email: "jan234@tempmail.com",
        password: "haslo123",
        remember_me: true,
      };
      const mockUser = {
        id: 1,
        email: "jan234@tempmail.com",
        role: "client",
        is_active: 1,
        assigned_shop: null,
      };
      authFunctions.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      req.session.regenerate = jest.fn((callback) => callback(null));
      req.session.cookie = {};
      await authController.login(req, res);
      expect(req.session.regenerate).toHaveBeenCalled();
      expect(req.session.userId).toBe(1);
      expect(req.session.email).toBe("jan234@tempmail.com");
      expect(req.session.role).toBe("client");
      expect(res.json).toHaveBeenCalledWith({
        message: "Zalogowano Pomyślnie",
      });
    });
    it("should handle database errors", async () => {
      req.body = {
        email: "jan234@tempmail.com",
        password: "haslo123",
        remember_me: true,
      };
      const mockUser = {
        id: 1,
        email: "jan234@tempmail.com",
        role: "client",
        is_active: 1,
        assigned_shop: null,
      };
      authFunctions.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue(true);
      const error = new Error("DB Error");
      promisePool.query.mockRejectedValueOnce(error);
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd wewnętrzny serwera",
      });
      consoleSpy.mockRestore();
    });
  });

  describe("logout", () => {
    it("should handle session errors", async () => {
      req.session.destroy = jest.fn((callback) => {
        callback(new Error("Session error"));
      });
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      await authController.logout(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Błąd wewnętrzny serwera",
      });
      consoleSpy.mockRestore();
    });

    it("should destroy session and clear cookie", async () => {
      req.session.destroy = jest.fn((callback) => callback(null));
      res.clearCookie = jest.fn().mockReturnThis();
      await authController.logout(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith("sid", {
        path: "/",
        sameSite: "lax",
        secure: false,
        httpOnly: true,
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "Wylogowano z Konta",
      });
    });
  });
});
