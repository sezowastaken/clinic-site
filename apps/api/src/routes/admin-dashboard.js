import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/require-auth.js";

const router = Router();

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

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const boundsResult = await pool.query(`
      SELECT
        date_trunc('day', now() AT TIME ZONE 'Europe/Istanbul') AT TIME ZONE 'Europe/Istanbul' AS day_start,
        (date_trunc('day', now() AT TIME ZONE 'Europe/Istanbul') + interval '1 day') AT TIME ZONE 'Europe/Istanbul' AS day_end,
        date_trunc('week', now() AT TIME ZONE 'Europe/Istanbul') AT TIME ZONE 'Europe/Istanbul' AS week_start,
        (date_trunc('week', now() AT TIME ZONE 'Europe/Istanbul') + interval '7 days') AT TIME ZONE 'Europe/Istanbul' AS week_end
    `);
    const { day_start, day_end, week_start, week_end } = boundsResult.rows[0];

    const [todayCount, pendingCount, weekCount, nextAppointment, todayAppointments, latestPendingRequests] =
      await Promise.all([
        pool.query(
          `SELECT COUNT(*)::int AS count FROM appointments
           WHERE starts_at >= $1 AND starts_at < $2 AND status IN ('pending', 'confirmed')`,
          [day_start, day_end]
        ),
        pool.query(
          `SELECT COUNT(*)::int AS count FROM appointments WHERE source = 'website' AND status = 'pending'`
        ),
        pool.query(
          `SELECT COUNT(*)::int AS count FROM appointments
           WHERE starts_at >= $1 AND starts_at < $2 AND status NOT IN ('cancelled', 'rejected')`,
          [week_start, week_end]
        ),
        pool.query(
          `${BASE_SELECT} WHERE a.status = 'confirmed' AND a.starts_at > now() ORDER BY a.starts_at ASC LIMIT 1`
        ),
        pool.query(
          `${BASE_SELECT} WHERE a.starts_at >= $1 AND a.starts_at < $2 ORDER BY a.starts_at ASC`,
          [day_start, day_end]
        ),
        pool.query(
          `${BASE_SELECT} WHERE a.source = 'website' AND a.status = 'pending' ORDER BY a.created_at DESC LIMIT 5`
        ),
      ]);

    res.json({
      todayAppointmentCount: todayCount.rows[0].count,
      pendingWebsiteRequestCount: pendingCount.rows[0].count,
      currentWeekAppointmentCount: weekCount.rows[0].count,
      nextAppointment: nextAppointment.rows[0] ? mapRow(nextAppointment.rows[0]) : null,
      todayAppointments: todayAppointments.rows.map(mapRow),
      latestPendingRequests: latestPendingRequests.rows.map(mapRow),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
