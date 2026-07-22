import pg from "pg";
import { config } from "../src/config.js";
import { hashPassword } from "../src/utils/password.js";

async function run() {
  const name = process.env.ADMIN_NAME || "";
  const username = process.env.ADMIN_USERNAME || "";
  const email = process.env.ADMIN_EMAIL || "";
  const password = process.env.ADMIN_PASSWORD || "";
  const role = process.env.ADMIN_ROLE || "assistant";

  const requiredCount = [name, email, password].filter(Boolean).length;

  if (requiredCount === 0) {
    console.log("Admin bootstrap: no ADMIN_* variables set, skipping.");
    return;
  }

  if (requiredCount < 3) {
    console.error(
      "Admin bootstrap: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must all be set together."
    );
    process.exit(1);
  }

  if (!["assistant", "admin"].includes(role)) {
    console.error(`Admin bootstrap: invalid ADMIN_ROLE "${role}". Must be "assistant" or "admin".`);
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: config.databaseUrl });
  await client.connect();

  try {
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username ? username.toLowerCase() : null;

    const existing = await client.query(
      "SELECT id FROM admin_users WHERE LOWER(email) = $1 OR ($2::text IS NOT NULL AND LOWER(username) = $2)",
      [normalizedEmail, normalizedUsername]
    );

    if (existing.rows.length > 0) {
      console.log("Admin bootstrap: matching admin user already exists, skipping.");
      return;
    }

    const passwordHash = hashPassword(password);
    const result = await client.query(
      `INSERT INTO admin_users (name, email, username, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name, normalizedEmail, normalizedUsername, passwordHash, role]
    );

    console.log(`Admin bootstrap: created admin user (id: ${result.rows[0].id}, role: ${role}).`);
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error(`Admin bootstrap failed: ${err.message}`);
  process.exit(1);
});
