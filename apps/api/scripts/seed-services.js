import pg from "pg";
import { config } from "../src/config.js";

// Mirrors apps/web/src/content/services.js slugs/titles. Duration is a provisional placeholder.
const SERVICES = [
  { slug: "rhinoplasty", name: "Burun Estetiği (Rhinoplasty)" },
  { slug: "breast-augmentation", name: "Meme Büyütme" },
  { slug: "liposuction", name: "Liposuction" },
  { slug: "facelift", name: "Yüz Germe (Facelift)" },
  { slug: "tummy-tuck", name: "Karın Germe (Tummy Tuck)" },
  { slug: "blepharoplasty", name: "Göz Kapağı Estetiği" },
];

const PROVISIONAL_DURATION_MINUTES = 30;

async function run() {
  const client = new pg.Client({ connectionString: config.databaseUrl });
  await client.connect();

  try {
    for (const [index, service] of SERVICES.entries()) {
      const result = await client.query(
        `INSERT INTO services (slug, name, duration_minutes, display_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO NOTHING
         RETURNING id`,
        [service.slug, service.name, PROVISIONAL_DURATION_MINUTES, index]
      );
      console.log(
        result.rows.length ? `Created: ${service.slug}` : `Skipped (already exists): ${service.slug}`
      );
    }
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error(`Seeding failed: ${err.message}`);
  process.exit(1);
});
