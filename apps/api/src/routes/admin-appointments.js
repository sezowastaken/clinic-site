import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/require-auth.js";

const STATUSES = ["pending", "confirmed", "completed", "cancelled", "rejected", "no_show"];
const SOURCES = ["website", "phone", "whatsapp", "email", "instagram", "referral", "other"];

const BASE_SELECT = `
  SELECT
    a.id, a.patient_name, a.phone, a.email,
    a.starts_at, a.ends_at, a.status, a.source,
    a.patient_note, a.internal_note,
    a.created_by, a.created_at, a.updated_at, a.cancelled_at,
    s.id AS service_id, s.slug AS service_slug, s.name AS service_name
  FROM appointments a
  JOIN services s ON s.id = a.service_id
`;

const router = Router();

function validationError(res, message) {
  return res.status(400).json({ error: { code: "VALIDATION_ERROR", message } });
}

function mapRow(row) {
  return {
    id: row.id,
    patientName: row.patient_name,
    phone: row.phone,
    email: row.email,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    source: row.source,
    patientNote: row.patient_note,
    internalNote: row.internal_note,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    cancelledAt: row.cancelled_at,
    service: {
      id: row.service_id,
      slug: row.service_slug,
      name: row.service_name,
    },
  };
}

async function fetchById(id) {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE a.id = $1`, [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}

function handleDbError(err, res, next) {
  if (err.code === "23P01") {
    return res.status(409).json({
      error: { code: "APPOINTMENT_CONFLICT", message: "This time slot overlaps with another appointment." },
    });
  }
  if (err.code === "23514" || err.code === "23503") {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid appointment data." } });
  }
  next(err);
}

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { dateFrom, dateTo, status, source, search } = req.query;
    const conditions = [];
    const params = [];

    if (dateFrom) {
      if (typeof dateFrom !== "string" || isNaN(Date.parse(dateFrom))) {
        return validationError(res, "Invalid dateFrom.");
      }
      params.push(dateFrom);
      conditions.push(`a.starts_at >= $${params.length}`);
    }

    if (dateTo) {
      if (typeof dateTo !== "string" || isNaN(Date.parse(dateTo))) {
        return validationError(res, "Invalid dateTo.");
      }
      params.push(dateTo);
      conditions.push(`a.starts_at <= $${params.length}`);
    }

    if (status) {
      if (!STATUSES.includes(status)) return validationError(res, "Invalid status.");
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }

    if (source) {
      if (!SOURCES.includes(source)) return validationError(res, "Invalid source.");
      params.push(source);
      conditions.push(`a.source = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      conditions.push(`(a.patient_name ILIKE $${idx} OR a.phone ILIKE $${idx})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await pool.query(`${BASE_SELECT} ${where} ORDER BY a.starts_at ASC`, params);
    const items = rows.map(mapRow);

    res.json({ items, total: items.length });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const appointment = await fetchById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Appointment not found." } });
    }
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const {
      patientName,
      phone,
      email,
      serviceSlug,
      startsAt,
      durationMinutes,
      source,
      status,
      patientNote,
      internalNote,
    } = req.body ?? {};

    if (typeof patientName !== "string" || !patientName.trim()) {
      return validationError(res, "patientName is required.");
    }
    if (typeof phone !== "string" || !phone.trim()) {
      return validationError(res, "phone is required.");
    }
    if (email !== undefined && email !== null && email !== "" && typeof email !== "string") {
      return validationError(res, "email must be a string.");
    }
    if (typeof serviceSlug !== "string" || !serviceSlug.trim()) {
      return validationError(res, "serviceSlug is required.");
    }
    if (typeof startsAt !== "string" || isNaN(Date.parse(startsAt))) {
      return validationError(res, "startsAt must be a valid date.");
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      return validationError(res, "durationMinutes must be a positive integer.");
    }
    if (!SOURCES.includes(source)) {
      return validationError(res, "Invalid source.");
    }
    const finalStatus = status ?? "confirmed";
    if (!STATUSES.includes(finalStatus)) {
      return validationError(res, "Invalid status.");
    }

    const serviceResult = await pool.query("SELECT id FROM services WHERE slug = $1", [serviceSlug]);
    const service = serviceResult.rows[0];
    if (!service) return validationError(res, "Unknown serviceSlug.");

    const startsAtDate = new Date(startsAt);
    const endsAtDate = new Date(startsAtDate.getTime() + durationMinutes * 60000);

    const { rows } = await pool.query(
      `INSERT INTO appointments
        (patient_name, phone, email, service_id, starts_at, ends_at, status, source, patient_note, internal_note, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        patientName.trim(),
        phone.trim(),
        email || null,
        service.id,
        startsAtDate.toISOString(),
        endsAtDate.toISOString(),
        finalStatus,
        source,
        patientNote || null,
        internalNote || null,
        req.adminUser.id,
      ]
    );

    const created = await fetchById(rows[0].id);
    res.status(201).json(created);
  } catch (err) {
    handleDbError(err, res, next);
  }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingResult = await pool.query(
      "SELECT starts_at, ends_at, service_id FROM appointments WHERE id = $1",
      [id]
    );
    const existing = existingResult.rows[0];
    if (!existing) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Appointment not found." } });
    }

    const {
      patientName,
      phone,
      email,
      serviceSlug,
      startsAt,
      durationMinutes,
      status,
      source,
      patientNote,
      internalNote,
    } = req.body ?? {};

    const updates = [];
    const params = [];

    if (patientName !== undefined) {
      if (typeof patientName !== "string" || !patientName.trim()) {
        return validationError(res, "patientName must be a non-empty string.");
      }
      params.push(patientName.trim());
      updates.push(`patient_name = $${params.length}`);
    }

    if (phone !== undefined) {
      if (typeof phone !== "string" || !phone.trim()) {
        return validationError(res, "phone must be a non-empty string.");
      }
      params.push(phone.trim());
      updates.push(`phone = $${params.length}`);
    }

    if (email !== undefined) {
      if (email !== null && typeof email !== "string") {
        return validationError(res, "email must be a string.");
      }
      params.push(email || null);
      updates.push(`email = $${params.length}`);
    }

    if (serviceSlug !== undefined) {
      if (typeof serviceSlug !== "string" || !serviceSlug.trim()) {
        return validationError(res, "serviceSlug must be a non-empty string.");
      }
      const serviceResult = await pool.query("SELECT id FROM services WHERE slug = $1", [serviceSlug]);
      const service = serviceResult.rows[0];
      if (!service) return validationError(res, "Unknown serviceSlug.");
      params.push(service.id);
      updates.push(`service_id = $${params.length}`);
    }

    if (startsAt !== undefined && (typeof startsAt !== "string" || isNaN(Date.parse(startsAt)))) {
      return validationError(res, "startsAt must be a valid date.");
    }
    if (durationMinutes !== undefined && (!Number.isInteger(durationMinutes) || durationMinutes <= 0)) {
      return validationError(res, "durationMinutes must be a positive integer.");
    }

    if (startsAt !== undefined || durationMinutes !== undefined) {
      const newStartsAt = startsAt !== undefined ? new Date(startsAt) : new Date(existing.starts_at);
      const currentDurationMs = new Date(existing.ends_at).getTime() - new Date(existing.starts_at).getTime();
      const durationMs = durationMinutes !== undefined ? durationMinutes * 60000 : currentDurationMs;
      const newEndsAt = new Date(newStartsAt.getTime() + durationMs);

      params.push(newStartsAt.toISOString());
      updates.push(`starts_at = $${params.length}`);
      params.push(newEndsAt.toISOString());
      updates.push(`ends_at = $${params.length}`);
    }

    if (status !== undefined) {
      if (!STATUSES.includes(status)) return validationError(res, "Invalid status.");
      params.push(status);
      updates.push(`status = $${params.length}`);
    }

    if (source !== undefined) {
      if (!SOURCES.includes(source)) return validationError(res, "Invalid source.");
      params.push(source);
      updates.push(`source = $${params.length}`);
    }

    if (patientNote !== undefined) {
      params.push(patientNote || null);
      updates.push(`patient_note = $${params.length}`);
    }

    if (internalNote !== undefined) {
      params.push(internalNote || null);
      updates.push(`internal_note = $${params.length}`);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = now()`);
      params.push(id);
      await pool.query(`UPDATE appointments SET ${updates.join(", ")} WHERE id = $${params.length}`, params);
    }

    const updated = await fetchById(id);
    res.json(updated);
  } catch (err) {
    handleDbError(err, res, next);
  }
});

export default router;
