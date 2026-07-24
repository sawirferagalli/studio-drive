import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { sql } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rows = await sql`SELECT * FROM items WHERE id = ${params.id}`;
  const item = rows[0];

  if (!item) {
    return NextResponse.json(
      { error: "Elemento non trovato." },
      { status: 404 }
    );
  }

  if (item.type === "file" && item.blob_pathname) {
    try {
      await del(item.blob_pathname);
    } catch {
      // Il file potrebbe essere già stato rimosso dallo storage.
    }
  }

  await sql`DELETE FROM items WHERE id = ${params.id}`;

  return NextResponse.json({ ok: true });
}
