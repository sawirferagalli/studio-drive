import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const parentId = body.parentId ? String(body.parentId) : null;

  if (!name) {
    return NextResponse.json(
      { error: "Il nome della cartella è obbligatorio." },
      { status: 400 }
    );
  }

  const rows = await sql`
    INSERT INTO items (parent_id, type, name)
    VALUES (${parentId}, 'folder', ${name})
    RETURNING id
  `;

  return NextResponse.json({ id: rows[0].id });
}
