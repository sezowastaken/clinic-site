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
  const password = args.password || process.env.ADMIN_PASSWORD;
  const role = args.role || process.env.ADMIN_ROLE || "assistant";

  if (!name || !email || !password) {
    console.error(
      "Usage: npm run create-admin -- --name=... --email=... --password=... [--role=assistant|admin]"
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
    const existing = await client.query("SELECT id FROM admin_users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      console.error(`An admin user with email "${email}" already exists.`);
      process.exit(1);
    }

    const passwordHash = hashPassword(password);
    const result = await client.query(
      `INSERT INTO admin_users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [name, email, passwordHash, role]
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
