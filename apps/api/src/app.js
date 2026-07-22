import express from "express";
import { pool } from "./db.js";
import authRouter from "./routes/auth.js";
import adminAppointmentsRouter from "./routes/admin-appointments.js";
import adminAvailabilityRouter from "./routes/admin-availability.js";
import adminDashboardRouter from "./routes/admin-dashboard.js";
import publicBookingRouter from "./routes/public-booking.js";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/api/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok", database: "ok" });
    } catch {
      res.status(503).json({ status: "error", database: "error" });
    }
  });

  app.use("/api/auth", authRouter);
  app.use("/api/admin/appointments", adminAppointmentsRouter);
  app.use("/api/admin/availability", adminAvailabilityRouter);
  app.use("/api/admin/dashboard", adminDashboardRouter);
  app.use("/api/public", publicBookingRouter);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Unexpected server error." } });
  });

  return app;
}
