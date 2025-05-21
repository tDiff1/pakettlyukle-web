// app/api/upload/logo/route.ts
import { NextResponse } from "next/server";
import { put, del, list } from "@vercel/blob";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }

  const timestamp = Date.now();
  const blobName = `pakettlyukle/logo/logo-${timestamp}.png`;

  // Önceki logoları sil
  const { blobs } = await list({ prefix: "pakettlyukle/logo/" });
  await Promise.all(
    blobs.map((blob) => del(blob.url).catch(() => {})) // hata olsa bile devam
  );

  // Yeni logoyu yükle
  const blob = await put(blobName, file, {
    access: "public",
  });

  return NextResponse.json({ filePath: blob.url });
}
