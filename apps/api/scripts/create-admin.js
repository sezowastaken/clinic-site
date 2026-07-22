import pg from "pg";
import { config } from "../src/config.js";
import { hashPassword } from "../src/utils/password.js";

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

async function run() {
  const args = parseArgs();
  const name = args.name || process.env.ADMIN_NAME;
  const email = args.email || process.env.ADMIN_EMAIL;
  const username = args.username || process.env.ADMIN_USERNAME || null;
  const password = args.password || process.env.ADMIN_PASSWORD;
  const role = args.role || process.env.ADMIN_ROLE || "assistant";

  if (!name || !email || !password) {
    console.error(
      "Usage: npm run create-admin -- --name=... --email=... --password=... [--username=...] [--role=assistant|admin]"
    );
    process.exit(1);
  }

  if (!["assistant", "admin"].includes(role)) {
    console.error(`Invalid role: ${role}. Must be "assistant" or "admin".`);
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: config.databaseUrl });
  await client.connect();

  try {
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username ? username.toLowerCase() : null;

    const existingEmail = await client.query(
      "SELECT id FROM admin_users WHERE LOWER(email) = $1",
      [normalizedEmail]
    );
    if (existingEmail.rows.length > 0) {
      console.error(`An admin user with email "${email}" already exists.`);
      process.exit(1);
    }

    if (normalizedUsername) {
      const existingUsername = await client.query(
        "SELECT id FROM admin_users WHERE LOWER(username) = $1",
        [normalizedUsername]
      );
      if (existingUsername.rows.length > 0) {
        console.error(`An admin user with username "${username}" already exists.`);
        process.exit(1);
      }
    }

    const passwordHash = hashPassword(password);
    const result = await client.query(
      `INSERT INTO admin_users (name, email, username, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name, normalizedEmail, normalizedUsername, passwordHash, role]
    );

    console.log(`Admin user created: ${email} (id: ${result.rows[0].id}, role: ${role})`);
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error(`Failed to create admin user: ${err.message}`);
  process.exit(1);
});
