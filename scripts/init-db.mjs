import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  console.error(
    "DATABASE_URL non trovata. Esegui prima: vercel env pull"
  );
  process.exit(1);
}

const sql = neon(connectionString);

const cartelleIniziali = ["Rieco", "Pescara Calcio", "One Group", "Galasso"];

async function main() {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      parent_id UUID REFERENCES items(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('folder', 'file')),
      name TEXT NOT NULL,
      blob_url TEXT,
      blob_pathname TEXT,
      size BIGINT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS items_parent_id_idx ON items (parent_id)`;

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM items`;

  if (count === 0) {
    for (const nome of cartelleIniziali) {
      await sql`INSERT INTO items (parent_id, type, name) VALUES (NULL, 'folder', ${nome})`;
    }
    console.log("Cartelle iniziali create:", cartelleIniziali.join(", "));
  } else {
    console.log("Il database ha già dei dati, nessuna cartella iniziale aggiunta.");
  }

  console.log("Database pronto.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
