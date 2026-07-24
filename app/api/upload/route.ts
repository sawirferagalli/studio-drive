import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  const parentIdRaw = form.get("parentId");
  const parentId = parentIdRaw ? String(parentIdRaw) : null;

  if (!file) {
    return NextResponse.json(
      { error: "Nessun file ricevuto." },
      { status: 400 }
    );
  }

  const blob = await put(file.name, file, {
    access: "private",
    addRandomSuffix: true,
  });

  const rows = await sql`
    INSERT INTO items (parent_id, type, name, blob_url, blob_pathname, size)
    VALUES (${parentId}, 'file', ${file.name}, ${blob.url}, ${blob.pathname}, ${file.size})
    RETURNING id
  `;

  return NextResponse.json({ id: rows[0].id });
}
