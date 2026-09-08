import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/require-auth.js";

const router = Router();

function validationError(res, message) {
  return res.status(400).json({ error: { code: "VALIDATION_ERROR", message } });
}

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { isRead } = req.query;
    const conditions = [];
    const params = [];

    if (isRead !== undefined) {
      if (isRead !== "true" && isRead !== "false") {
        return validationError(res, "isRead must be true or false.");
      }
      params.push(isRead === "true");
      conditions.push(`is_read = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await pool.query(
      `SELECT id, name, phone, email, message, is_read, created_at
       FROM contact_messages ${where} ORDER BY created_at DESC`,
      params
    );

    res.json({ items: rows.map(mapRow), total: rows.length });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const { isRead } = req.body ?? {};
    if (typeof isRead !== "boolean") {
      return validationError(res, "isRead must be a boolean.");
    }

    const { rows } = await pool.query(
      `UPDATE contact_messages SET is_read = $1 WHERE id = $2
       RETURNING id, name, phone, email, message, is_read, created_at`,
      [isRead, req.params.id]
    );

    const updated = rows[0];
    if (!updated) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Message not found." } });
    }

    res.json(mapRow(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
