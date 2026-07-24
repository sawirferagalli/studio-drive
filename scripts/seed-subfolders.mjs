import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  console.error("DATABASE_URL non trovata. Esegui prima: vercel env pull");
  process.exit(1);
}

const sql = neon(connectionString);

const sottocartelle = ["Amministrativa", "Tecnica"];

async function main() {
  const cartelle = await sql`
    SELECT id, name FROM items WHERE type = 'folder' AND parent_id IS NULL
  `;

  for (const cartella of cartelle) {
    const esistenti = await sql`
      SELECT name FROM items WHERE parent_id = ${cartella.id} AND type = 'folder'
    `;
    const nomiEsistenti = esistenti.map((r) => r.name);

    for (const nome of sottocartelle) {
      if (!nomiEsistenti.includes(nome)) {
        await sql`
          INSERT INTO items (parent_id, type, name)
          VALUES (${cartella.id}, 'folder', ${nome})
        `;
        console.log(`Creata "${nome}" dentro "${cartella.name}"`);
      } else {
        console.log(`"${nome}" già presente dentro "${cartella.name}", saltata`);
      }
    }
  }

  console.log("Fatto.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
