import { jest } from "@jest/globals";
import { loadFeature, defineFeature } from "jest-cucumber";
import request from "supertest";

const mockQuery = jest.fn();
const mockRequireAuth = jest.fn((req, res, next) => next());
const mockBcryptCompare = jest.fn();
const mockBcryptHash = jest.fn();

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
    req.session.userId = 1;
    req.session.role = "client";
    next();
  },
  defaultSessionMaxAge: 60 * 60 * 1000,
  rememberMeMaxAge: 24 * 60 * 60 * 1000,
}));

jest.unstable_mockModule("../../functions/auth.functions.js", () => ({
  getUserByEmail: jest.fn(),
  requireAuth: mockRequireAuth,
  requireAdmin: jest.fn((req, res, next) => next()),
  requireOwner: jest.fn((req, res, next) => next()),
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: mockBcryptCompare,
    hash: mockBcryptHash,
  },
}));

jest.unstable_mockModule("../../config/stripe.js", () => ({
  stripe: {},
}));

const { default: app } = await import("../../index.js");
const feature = loadFeature("./__tests__/bdd/features/client.feature");

defineFeature(feature, (test) => {
  let response;
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockImplementation((req, res, next) => {
      req.session = req.session || {};
      req.session.userId = 1;
      req.session.role = "client";
      next();
    });
    mockBcryptCompare.mockResolvedValue(true);
    mockBcryptHash.mockResolvedValue("hashed_password");
    mockQuery.mockResolvedValue([[], []]);
  });

  const givenLoggedIn = (given) => {
    given("I am a logged-in user", () => {});
  };

  test("Client retrieves information about their account", ({
    given,
    when,
    then,
  }) => {
    givenLoggedIn(given);
    when("I request my account information", async () => {
      const mockUser = {
        id: 1,
        name: "Jan",
        surname: "Kowalski",
        email: "jan@test.mail",
        role: "client",
      };
      mockQuery.mockResolvedValueOnce([[mockUser], []]);
      response = await request(app).get("/api/me");
    });
    then(
      "I should receive my user details including name, email, and role",
      () => {
        expect(response.status).toBe(200);
        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe("jan@test.mail");
        expect(response.body.user.name).toBe("Jan");
      },
    );
  });

  test("Client updates profile information successfully", ({
    given,
    when,
    then,
  }) => {
    givenLoggedIn(given);
    when("I update my profile with: name, surname, city", async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
      const updateData = {
        name: "Jan Paweł",
        surname: "Kowalski",
        city: "Gdansk",
        email: "jan@test.mail",
        phone: "123456789",
        id: 1,
      };
      response = await request(app).put("/api/user_update").send(updateData);
    });
    then(
      'the response should indicate success with message "Dane zaktualizowano pomyślnie"',
      () => {
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Dane zaktualizowano pomyślnie");
      },
    );
  });
  test("Client changes password successfully", ({ given, when, then }) => {
    givenLoggedIn(given);

    given(/^my current password is "(.*)"$/, (pwd) => {
      mockQuery.mockResolvedValueOnce([
        [{ password_hash: "hashed_" + pwd }],
        [],
      ]);
    });
    when(
      /^I change my password from "(.*)" to "(.*)"$/,
      async (oldPwd, newPwd) => {
        mockBcryptCompare.mockResolvedValueOnce(true);
        response = await request(app).put("/api/change_password").send({
          oldpassword: oldPwd,
          newpassword: newPwd,
        });
      },
    );
    then(/^the response should indicate "(.*)"$/, (msg) => {
      expect(response.body.message).toBe(msg);
    });
  });

  test("Client fails to change password with incorrect old password", ({
    given,
    when,
    then,
    and,
  }) => {
    givenLoggedIn(given);
    given(/^my current password is "(.*)"$/, (pwd) => {
      mockQuery.mockResolvedValueOnce([
        [{ password_hash: "hashed_" + pwd }],
        [],
      ]);
    });

    when(
      /^I change my password from "(.*)" to "(.*)"$/,
      async (oldPwd, newPwd) => {
        mockBcryptCompare.mockResolvedValueOnce(false);
        response = await request(app).put("/api/change_password").send({
          oldpassword: oldPwd,
          newpassword: newPwd,
        });
      },
    );
    then(/^the response status should be (\d+)$/, (status) => {
      expect(response.status).toBe(Number(status));
    });
    and(/^the response should contain message "(.*)"$/, (msg) => {
      expect(response.body.message).toBe(msg);
    });
  });

  test("Client fails to change password when new password is same as old", ({
    given,
    when,
    then,
    and,
  }) => {
    givenLoggedIn(given);
    given(/^my current password is "(.*)"$/, (pwd) => {
      mockQuery.mockResolvedValueOnce([
        [{ password_hash: "hashed_" + pwd }],
        [],
      ]);
    });
    when(
      /^I change my password from "(.*)" to "(.*)"$/,
      async (oldPwd, newPwd) => {
        mockBcryptCompare.mockResolvedValueOnce(true);
        response = await request(app).put("/api/change_password").send({
          oldpassword: oldPwd,
          newpassword: newPwd,
        });
      },
    );
    then(/^the response status should be (\d+)$/, (status) => {
      expect(response.status).toBe(Number(status));
    });
    and(/^the response should contain message "(.*)"$/, (msg) => {
      expect(response.body.message).toBe(msg);
    });
  });

  test("Client adds a product to favorites", ({ given, when, then, and }) => {
    givenLoggedIn(given);
    given(/^a product with ID (\d+) exists$/, (id) => {});
    when(/^I add product (\d+) to my favorites$/, async (id) => {
      mockQuery.mockResolvedValueOnce([{}, []]);
      response = await request(app).post(`/api/favorites/${id}`);
    });
    then(/^the response status should be (\d+)$/, (status) => {
      expect(response.status).toBe(Number(status));
    });
    and(/^the response should contain message "(.*)"$/, (msg) => {
      expect(response.body.message).toBe(msg);
    });
  });

  test("Client retrieves favorite products", ({ given, when, then }) => {
    givenLoggedIn(given);
    given("I have products in my favorites", () => {
      const favs = [{ id: 10, name: "FavProd" }];
      mockQuery.mockResolvedValueOnce([favs, []]);
    });
    when("I request my favorite products", async () => {
      response = await request(app).get("/api/favorites");
    });
    then("I should receive a list of favorite products", () => {
      expect(response.status).toBe(200);
      expect(response.body.favorites).toHaveLength(1);
    });
  });

  test("Client removes a product from favorites", ({ given, when, then }) => {
    givenLoggedIn(given);
    given(/^product (\d+) is in my favorites$/, (id) => {});
    when(/^I remove product (\d+) from my favorites$/, async (id) => {
      mockQuery.mockResolvedValueOnce([{}, []]);
      response = await request(app).delete(`/api/favorites/${id}`);
    });
    then(/^the response should indicate "(.*)"$/, (msg) => {
      expect(response.body.message).toBe(msg);
    });
  });

  test("Client retrieves their orders", ({ given, when, then }) => {
    givenLoggedIn(given);
    given("I have placed orders", () => {
      mockQuery
        .mockResolvedValueOnce([[{ id: 100 }], []])
        .mockResolvedValueOnce([[{ order_id: 100 }], []]);
    });
    when("I request my orders", async () => {
      response = await request(app).get("/api/my_orders");
    });
    then("I should receive a list of my orders with items", () => {
      expect(response.status).toBe(200);
      expect(response.body.orders).toHaveLength(1);
      expect(response.body.orders[0].items).toHaveLength(1);
    });
  });
});
