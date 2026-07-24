import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  throw new Error(
    "Variabile DATABASE_URL non trovata. Collega il database Postgres al progetto Vercel (vercel integration add neon)."
  );
}

export const sql = neon(connectionString);

export type Item = {
  id: string;
  parent_id: string | null;
  type: "folder" | "file";
  name: string;
  blob_url: string | null;
  blob_pathname: string | null;
  size: number | null;
  created_at: string;
};

export async function getChildren(parentId: string | null): Promise<Item[]> {
  if (parentId === null) {
    return (await sql`
      SELECT * FROM items WHERE parent_id IS NULL ORDER BY type DESC, name ASC
    `) as Item[];
  }
  return (await sql`
    SELECT * FROM items WHERE parent_id = ${parentId} ORDER BY type DESC, name ASC
  `) as Item[];
}

export async function getItem(id: string): Promise<Item | null> {
  const rows = (await sql`SELECT * FROM items WHERE id = ${id}`) as Item[];
  return rows[0] ?? null;
}

export async function getBreadcrumb(
  id: string
): Promise<{ id: string; name: string }[]> {
  const rows = (await sql`
    WITH RECURSIVE ancestors AS (
      SELECT id, parent_id, name, 0 AS depth FROM items WHERE id = ${id}
      UNION ALL
      SELECT i.id, i.parent_id, i.name, a.depth + 1
      FROM items i
      JOIN ancestors a ON i.id = a.parent_id
    )
    SELECT id, name FROM ancestors ORDER BY depth DESC
  `) as { id: string; name: string }[];
  return rows;
}
