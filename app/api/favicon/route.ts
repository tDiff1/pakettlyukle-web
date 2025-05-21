// app/api/favicon/route.ts
import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "pakettlyukle/favicon/favicon" });

    if (!blobs.length) {
      return NextResponse.json({ url: "/favicon.ico" }); // fallback
    }

    // En güncel favicon'u (yüklenme tarihine göre) bul
    const latest = blobs.sort((a, b) => {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    })[0];

    return NextResponse.json({ url: latest.url });
  } catch (error) {
    console.error("Favicon blob okunamadı:", error);
    return NextResponse.json({ url: "/favicon.ico" });
  }
}
