import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { getItem } from "@/lib/db";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Id mancante." }, { status: 400 });
  }

  const item = await getItem(id);

  if (!item || item.type !== "file" || !item.blob_pathname) {
    return NextResponse.json({ error: "File non trovato." }, { status: 404 });
  }

  const result = await get(item.blob_pathname, { access: "private" });

  if (!result || result.statusCode !== 200) {
    return new NextResponse("File non trovato", { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${item.name.replace(/"/g, "")}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-cache",
    },
  });
}
