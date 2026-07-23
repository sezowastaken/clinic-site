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

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Europe/Istanbul has used a fixed UTC+3 offset with no DST since 2016.
const ISTANBUL_OFFSET = "+03:00";

function istanbulTodayKey() {
  const now = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

function isRealDate(key) {
  const d = new Date(`${key}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === key;
}

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

router.put("/bulk", requireAuth, async (req, res, next) => {
  const { dates, ranges } = req.body ?? {};

  if (!Array.isArray(dates) || dates.length < 1 || dates.length > 62) {
    return validationError(res, "dates must contain 1 to 62 dates.");
  }
  if (new Set(dates).size !== dates.length) {
    return validationError(res, "dates must not contain duplicates.");
  }

  const today = istanbulTodayKey();
  for (const date of dates) {
    if (typeof date !== "string" || !DATE_RE.test(date) || !isRealDate(date)) {
      return validationError(res, "Each date must be a valid YYYY-MM-DD value.");
    }
    if (date < today) {
      return validationError(res, "dates must not be in the past.");
    }
  }

  if (!Array.isArray(ranges)) {
    return validationError(res, "ranges must be an array.");
  }
  if (ranges.length > 6) {
    return validationError(res, "A maximum of 6 ranges per day is allowed.");
  }

  const normalizedRanges = [];
  for (const range of ranges) {
    const start = range?.start;
    const end = range?.end;
    if (typeof start !== "string" || typeof end !== "string" || !TIME_RE.test(start) || !TIME_RE.test(end)) {
      return validationError(res, "Each range must use HH:mm start and end times.");
    }
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    if (startMin % 30 !== 0 || endMin % 30 !== 0) {
      return validationError(res, "Range times must use 30-minute increments.");
    }
    if (startMin >= endMin) {
      return validationError(res, "Range start must be before end.");
    }
    normalizedRanges.push({ start, end, startMin, endMin });
  }

  const sorted = [...normalizedRanges].sort((a, b) => a.startMin - b.startMin);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startMin < sorted[i - 1].endMin) {
      return validationError(res, "ranges must not overlap each other.");
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const date of dates) {
      const dayStart = `${date}T00:00:00${ISTANBUL_OFFSET}`;
      const dayEnd = `${date}T24:00:00${ISTANBUL_OFFSET}`;
      await client.query(
        "DELETE FROM availability_windows WHERE starts_at >= $1 AND starts_at < $2",
        [dayStart, dayEnd]
      );

      for (const range of normalizedRanges) {
        await client.query(
          `INSERT INTO availability_windows (starts_at, ends_at, reason, created_by)
           VALUES ($1, $2, NULL, $3)`,
          [`${date}T${range.start}:00${ISTANBUL_OFFSET}`, `${date}T${range.end}:00${ISTANBUL_OFFSET}`, req.adminUser.id]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ updatedDates: dates.length, createdWindows: dates.length * normalizedRanges.length });
  } catch (err) {
    await client.query("ROLLBACK");
    handleDbError(err, res, next);
  } finally {
    client.release();
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
