import express from "express";
import { pool } from "./db.js";

export function createApp() {
  const app = express();

  app.get("/api/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok", database: "ok" });
    } catch {
      res.status(503).json({ status: "error", database: "error" });
    }
  });

  return app;
}
