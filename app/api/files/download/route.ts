import { NextRequest, NextResponse } from "next/server";
import { getItem } from "@/lib/db";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Id mancante." }, { status: 400 });
  }

  const item = await getItem(id);

  if (!item || item.type !== "file" || !item.blob_url) {
    return NextResponse.json({ error: "File non trovato." }, { status: 404 });
  }

  const blobResponse = await fetch(item.blob_url, {
    headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
    },
  });

  if (!blobResponse.ok || !blobResponse.body) {
    return new NextResponse("File non trovato", { status: 404 });
  }

  return new NextResponse(blobResponse.body, {
    headers: {
      "Content-Type":
        blobResponse.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${item.name.replace(/"/g, "")}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
