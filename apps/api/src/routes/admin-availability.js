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
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    reason: row.reason,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function handleDbError(err, res, next) {
  if (err.code === "23P01") {
    return res.status(409).json({
      error: { code: "AVAILABILITY_CONFLICT", message: "This time range overlaps with another availability window." },
    });
  }
  if (err.code === "23514") {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid availability data." } });
  }
  next(err);
}

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const conditions = [];
    const params = [];

    if (dateFrom) {
      if (typeof dateFrom !== "string" || isNaN(Date.parse(dateFrom))) {
        return validationError(res, "Invalid dateFrom.");
      }
      params.push(dateFrom);
      conditions.push(`ends_at > $${params.length}`);
    }

    if (dateTo) {
      if (typeof dateTo !== "string" || isNaN(Date.parse(dateTo))) {
        return validationError(res, "Invalid dateTo.");
      }
      params.push(dateTo);
      conditions.push(`starts_at < $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await pool.query(
      `SELECT id, starts_at, ends_at, reason, created_by, created_at, updated_at
       FROM availability_windows ${where} ORDER BY starts_at ASC`,
      params
    );

    res.json({ items: rows.map(mapRow), total: rows.length });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { startsAt, endsAt, reason } = req.body ?? {};

    if (typeof startsAt !== "string" || isNaN(Date.parse(startsAt))) {
      return validationError(res, "startsAt must be a valid date.");
    }
    if (typeof endsAt !== "string" || isNaN(Date.parse(endsAt))) {
      return validationError(res, "endsAt must be a valid date.");
    }
    if (reason !== undefined && reason !== null && typeof reason !== "string") {
      return validationError(res, "reason must be a string.");
    }

    const startsAtDate = new Date(startsAt);
    const endsAtDate = new Date(endsAt);
    if (endsAtDate <= startsAtDate) {
      return validationError(res, "endsAt must be later than startsAt.");
    }

    const { rows } = await pool.query(
      `INSERT INTO availability_windows (starts_at, ends_at, reason, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, starts_at, ends_at, reason, created_by, created_at, updated_at`,
      [startsAtDate.toISOString(), endsAtDate.toISOString(), reason || null, req.adminUser.id]
    );

    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    handleDbError(err, res, next);
  }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingResult = await pool.query(
      "SELECT starts_at, ends_at FROM availability_windows WHERE id = $1",
      [id]
    );
    const existing = existingResult.rows[0];
    if (!existing) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Availability window not found." } });
    }

    const { startsAt, endsAt, reason } = req.body ?? {};

    if (startsAt !== undefined && (typeof startsAt !== "string" || isNaN(Date.parse(startsAt)))) {
      return validationError(res, "startsAt must be a valid date.");
    }
    if (endsAt !== undefined && (typeof endsAt !== "string" || isNaN(Date.parse(endsAt)))) {
      return validationError(res, "endsAt must be a valid date.");
    }
    if (reason !== undefined && reason !== null && typeof reason !== "string") {
      return validationError(res, "reason must be a string.");
    }

    const newStartsAt = startsAt !== undefined ? new Date(startsAt) : new Date(existing.starts_at);
    const newEndsAt = endsAt !== undefined ? new Date(endsAt) : new Date(existing.ends_at);
    if (newEndsAt <= newStartsAt) {
      return validationError(res, "endsAt must be later than startsAt.");
    }

    const updates = [];
    const params = [];

    if (startsAt !== undefined) {
      params.push(newStartsAt.toISOString());
      updates.push(`starts_at = $${params.length}`);
    }
    if (endsAt !== undefined) {
      params.push(newEndsAt.toISOString());
      updates.push(`ends_at = $${params.length}`);
    }
    if (reason !== undefined) {
      params.push(reason || null);
      updates.push(`reason = $${params.length}`);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = now()`);
      params.push(id);
      await pool.query(`UPDATE availability_windows SET ${updates.join(", ")} WHERE id = $${params.length}`, params);
    }

    const { rows } = await pool.query(
      "SELECT id, starts_at, ends_at, reason, created_by, created_at, updated_at FROM availability_windows WHERE id = $1",
      [id]
    );
    res.json(mapRow(rows[0]));
  } catch (err) {
    handleDbError(err, res, next);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM availability_windows WHERE id = $1", [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Availability window not found." } });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
