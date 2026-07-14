import { Router } from "express";
import { pool } from "../db.js";
import { config } from "../config.js";
import { verifyPassword } from "../utils/password.js";
import { generateSessionToken, hashSessionToken } from "../utils/session-token.js";
import { parseCookies, serializeCookie } from "../utils/cookies.js";
import { requireAuth } from "../middleware/require-auth.js";

const router = Router();

const GENERIC_LOGIN_ERROR = "Invalid email or password.";

function cookieOptions({ clear = false } = {}) {
  const ttlMs = config.sessionTtlDays * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    sameSite: "Lax",
    secure: config.nodeEnv === "production",
    path: "/",
    maxAge: clear ? 0 : Math.floor(ttlMs / 1000),
    expires: clear ? new Date(0) : new Date(Date.now() + ttlMs),
  };
}

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res
        .status(400)
        .json({ error: { code: "VALIDATION_ERROR", message: "Email and password are required." } });
    }

    const { rows } = await pool.query(
      "SELECT id, password_hash, is_active FROM admin_users WHERE email = $1",
      [email]
    );
    const user = rows[0];

    if (!user || !user.is_active || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: GENERIC_LOGIN_ERROR } });
    }

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const ttlMs = config.sessionTtlDays * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + ttlMs);

    await pool.query(
      "INSERT INTO sessions (admin_user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
      [user.id, tokenHash, expiresAt]
    );

    res.setHeader("Set-Cookie", serializeCookie(config.sessionCookieName, token, cookieOptions()));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[config.sessionCookieName];

    if (token) {
      const tokenHash = hashSessionToken(token);
      await pool.query(
        "UPDATE sessions SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL",
        [tokenHash]
      );
    }

    res.setHeader("Set-Cookie", serializeCookie(config.sessionCookieName, "", cookieOptions({ clear: true })));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, (req, res) => {
  const { id, name, email, role } = req.adminUser;
  res.json({ user: { id, name, email, role } });
});

export default router;
