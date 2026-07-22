import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLOT_ALIGN_MS = 30 * 60 * 1000;
const MAX_RANGE_DAYS = 62;
const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000; // Europe/Istanbul is a fixed UTC+3 offset (no DST since 2016).

function validationError(res, message) {
  return res.status(400).json({ error: { code: "VALIDATION_ERROR", message } });
}

function slotUnavailable(res) {
  return res.status(409).json({
    error: { code: "SLOT_UNAVAILABLE", message: "The selected time slot is no longer available." },
  });
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function istanbulDateAndLabel(date) {
  const shifted = new Date(date.getTime() + ISTANBUL_OFFSET_MS);
  const dateKey = `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
  const label = `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`;
  return { dateKey, label };
}

router.get("/availability", async (req, res, next) => {
  try {
    const { serviceSlug, dateFrom, dateTo } = req.query;

    if (typeof serviceSlug !== "string" || !serviceSlug.trim()) {
      return validationError(res, "serviceSlug is required.");
    }
    if (typeof dateFrom !== "string" || !DATE_RE.test(dateFrom)) {
      return validationError(res, "dateFrom must be in YYYY-MM-DD format.");
    }
    if (typeof dateTo !== "string" || !DATE_RE.test(dateTo)) {
      return validationError(res, "dateTo must be in YYYY-MM-DD format.");
    }

    const fromDate = new Date(`${dateFrom}T00:00:00Z`);
    const toDate = new Date(`${dateTo}T00:00:00Z`);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return validationError(res, "Invalid date.");
    }
    if (toDate < fromDate) {
      return validationError(res, "dateTo must not be before dateFrom.");
    }
    const rangeDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
    if (rangeDays > MAX_RANGE_DAYS) {
      return validationError(res, `Date range must not exceed ${MAX_RANGE_DAYS} days.`);
    }

    const serviceResult = await pool.query(
      "SELECT slug, name, duration_minutes FROM services WHERE slug = $1 AND is_active = true",
      [serviceSlug]
    );
    const service = serviceResult.rows[0];
    if (!service) return validationError(res, "Unknown or inactive serviceSlug.");

    const boundsResult = await pool.query(
      `SELECT
         ($1::date)::timestamp AT TIME ZONE 'Europe/Istanbul' AS range_start,
         (($2::date + interval '1 day'))::timestamp AT TIME ZONE 'Europe/Istanbul' AS range_end`,
      [dateFrom, dateTo]
    );
    const rangeStartMs = new Date(boundsResult.rows[0].range_start).getTime();
    const rangeEndMs = new Date(boundsResult.rows[0].range_end).getTime();

    const [windowsResult, busyResult] = await Promise.all([
      pool.query(
        `SELECT starts_at, ends_at FROM availability_windows
         WHERE ends_at > $1 AND starts_at < $2 ORDER BY starts_at ASC`,
        [new Date(rangeStartMs).toISOString(), new Date(rangeEndMs).toISOString()]
      ),
      pool.query(
        `SELECT starts_at, ends_at FROM appointments
         WHERE status IN ('pending', 'confirmed') AND ends_at > $1 AND starts_at < $2`,
        [new Date(rangeStartMs).toISOString(), new Date(rangeEndMs).toISOString()]
      ),
    ]);

    const durationMs = service.duration_minutes * 60000;
    const nowMs = Date.now();
    const busyRanges = busyResult.rows.map((r) => ({
      startsAtMs: new Date(r.starts_at).getTime(),
      endsAtMs: new Date(r.ends_at).getTime(),
    }));

    const slotsByDate = new Map();

    for (const w of windowsResult.rows) {
      const windowStartMs = new Date(w.starts_at).getTime();
      const windowEndMs = new Date(w.ends_at).getTime();
      const hardEndMs = Math.min(windowEndMs, rangeEndMs);
      const alignBase = Math.max(windowStartMs, rangeStartMs);
      let slotStartMs = Math.ceil(alignBase / SLOT_ALIGN_MS) * SLOT_ALIGN_MS;

      while (slotStartMs + durationMs <= hardEndMs) {
        const slotEndMs = slotStartMs + durationMs;
        const isFuture = slotStartMs > nowMs;
        const overlapsBusy = busyRanges.some((b) => slotStartMs < b.endsAtMs && slotEndMs > b.startsAtMs);

        if (isFuture && !overlapsBusy) {
          const startsAtDate = new Date(slotStartMs);
          const { dateKey, label } = istanbulDateAndLabel(startsAtDate);
          if (!slotsByDate.has(dateKey)) slotsByDate.set(dateKey, []);
          slotsByDate.get(dateKey).push({
            startsAt: startsAtDate.toISOString(),
            endsAt: new Date(slotEndMs).toISOString(),
            label,
          });
        }

        slotStartMs += SLOT_ALIGN_MS;
      }
    }

    const days = [];
    for (let d = new Date(fromDate); d <= toDate; d = new Date(d.getTime() + 86400000)) {
      const dateKey = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
      const slots = (slotsByDate.get(dateKey) || []).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
      days.push({ date: dateKey, slots });
    }

    res.json({
      service: { slug: service.slug, name: service.name, durationMinutes: service.duration_minutes },
      days,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/appointment-requests", async (req, res, next) => {
  try {
    const { patientName, phone, email, serviceSlug, startsAt, patientNote, kvkkConsent } = req.body ?? {};

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
    if (patientNote !== undefined && patientNote !== null && typeof patientNote !== "string") {
      return validationError(res, "patientNote must be a string.");
    }
    if (kvkkConsent !== true) {
      return validationError(res, "KVKK consent is required.");
    }

    const startsAtDate = new Date(startsAt);
    if (startsAtDate.getTime() <= Date.now()) {
      return validationError(res, "startsAt must be in the future.");
    }
    if (startsAtDate.getTime() % SLOT_ALIGN_MS !== 0) {
      return slotUnavailable(res);
    }

    const serviceResult = await pool.query(
      "SELECT id, duration_minutes FROM services WHERE slug = $1 AND is_active = true",
      [serviceSlug]
    );
    const service = serviceResult.rows[0];
    if (!service) return validationError(res, "Unknown or inactive serviceSlug.");

    const endsAtDate = new Date(startsAtDate.getTime() + service.duration_minutes * 60000);

    const fitsWindowResult = await pool.query(
      "SELECT 1 FROM availability_windows WHERE starts_at <= $1 AND ends_at >= $2 LIMIT 1",
      [startsAtDate.toISOString(), endsAtDate.toISOString()]
    );
    if (fitsWindowResult.rows.length === 0) return slotUnavailable(res);

    const overlapResult = await pool.query(
      `SELECT 1 FROM appointments
       WHERE status IN ('pending', 'confirmed') AND starts_at < $2 AND ends_at > $1 LIMIT 1`,
      [startsAtDate.toISOString(), endsAtDate.toISOString()]
    );
    if (overlapResult.rows.length > 0) return slotUnavailable(res);

    const { rows } = await pool.query(
      `INSERT INTO appointments
        (patient_name, phone, email, service_id, starts_at, ends_at, status, source, patient_note, internal_note, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'website', $7, NULL, NULL)
       RETURNING id, status`,
      [
        patientName.trim(),
        phone.trim(),
        email || null,
        service.id,
        startsAtDate.toISOString(),
        endsAtDate.toISOString(),
        patientNote || null,
      ]
    );

    res.status(201).json({ id: rows[0].id, status: rows[0].status });
  } catch (err) {
    if (err.code === "23P01") return slotUnavailable(res);
    next(err);
  }
});

export default router;
