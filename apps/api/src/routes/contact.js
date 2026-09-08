import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const attemptsByIp = new Map();

const MAX_NAME_LENGTH = 200;
const MAX_PHONE_LENGTH = 30;
const MAX_EMAIL_LENGTH = 255;
const MAX_MESSAGE_LENGTH = 4000;

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (attemptsByIp.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    attemptsByIp.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  attemptsByIp.set(ip, timestamps);
  return false;
}

function validationError(res, message) {
  return res.status(400).json({ error: { code: "VALIDATION_ERROR", message } });
}

router.post("/", async (req, res, next) => {
  try {
    if (isRateLimited(req.ip)) {
      return res.status(429).json({
        error: { code: "TOO_MANY_ATTEMPTS", message: "Too many attempts. Please try again later." },
      });
    }

    const { name, phone, email, message } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
      return validationError(res, "name is required.");
    }
    if (name.trim().length > MAX_NAME_LENGTH) {
      return validationError(res, "name is too long.");
    }
    if (typeof phone !== "string" || !phone.trim()) {
      return validationError(res, "phone is required.");
    }
    if (phone.trim().length > MAX_PHONE_LENGTH) {
      return validationError(res, "phone is too long.");
    }
    if (email !== undefined && email !== null && email !== "") {
      if (typeof email !== "string" || email.length > MAX_EMAIL_LENGTH) {
        return validationError(res, "email is invalid.");
      }
    }
    if (message !== undefined && message !== null && message !== "") {
      if (typeof message !== "string" || message.length > MAX_MESSAGE_LENGTH) {
        return validationError(res, "message is too long.");
      }
    }

    await pool.query(
      `INSERT INTO contact_messages (name, phone, email, message) VALUES ($1, $2, $3, $4)`,
      [name.trim(), phone.trim(), email || null, message || null]
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
