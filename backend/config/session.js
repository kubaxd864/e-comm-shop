import MySQLStoreInit from "express-mysql-session";
import session from "express-session";
import { pool } from "./db.js";

const MySQLStore = MySQLStoreInit(session);
const defaultSessionMaxAge = 60 * 60 * 1000;
const rememberMeMaxAge = 24 * 60 * 60 * 1000;
const sessionStore = new MySQLStore(
  {
    expiration: Number(24 * 60 * 60 * 1000),
    createDatabaseTable: true,
    schema: {
      tableName: "sessions",
      columnNames: {
        session_id: "session_id",
        expires: "expires",
        data: "data",
      },
    },
  },
  pool,
);

const sessionMiddleware = session({
  key: "sid",
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: defaultSessionMaxAge,
    domain: undefined,
  },
});

export { sessionMiddleware, rememberMeMaxAge, defaultSessionMaxAge };
