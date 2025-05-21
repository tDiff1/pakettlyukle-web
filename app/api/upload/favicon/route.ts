import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Dosya yok" }, { status: 400 });
  }

  // En son favicon'u bul
  const existingBlobs = await list({ prefix: "pakettlyukle/favicon/favicon-" });

  const oldFavicon = existingBlobs.blobs
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];

  // Yeni favicon'u yükle
  const timestamp = Date.now();
  const blobPath = `pakettlyukle/favicon/favicon-${timestamp}.ico`;

  try {
    const newBlob = await put(blobPath, file, {
      access: "public",
    });

    // Eski favicon'u sil (varsa)
    if (oldFavicon) {
      await fetch(oldFavicon.url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_BLOB_READ_WRITE_TOKEN ?? ""}`,
        },
      });
    }

    return NextResponse.json({ filePath: newBlob.url });
  } catch (error) {
    console.error("Favicon yükleme hatası:", error);
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });
  }
}
