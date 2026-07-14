import { pool } from "../db.js";
import { config } from "../config.js";
import { parseCookies } from "../utils/cookies.js";
import { hashSessionToken } from "../utils/session-token.js";

function unauthenticated(res) {
  return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required." } });
}

export async function requireAuth(req, res, next) {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[config.sessionCookieName];
    if (!token) return unauthenticated(res);

    const tokenHash = hashSessionToken(token);
    const { rows } = await pool.query(
      `SELECT s.id AS session_id, u.id, u.name, u.email, u.role, u.is_active
       FROM sessions s
       JOIN admin_users u ON u.id = s.admin_user_id
       WHERE s.token_hash = $1
         AND s.revoked_at IS NULL
         AND s.expires_at > now()`,
      [tokenHash]
    );
    const session = rows[0];

    if (!session || !session.is_active) return unauthenticated(res);

    await pool.query("UPDATE sessions SET last_used_at = now() WHERE id = $1", [session.session_id]);

    req.adminUser = { id: session.id, name: session.name, email: session.email, role: session.role };
    next();
  } catch (err) {
    next(err);
  }
}
