// app/api/logo-path/route.ts
import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "pakettlyukle/logo/" });

    if (!blobs.length) {
      return NextResponse.json({ filePath: "/logo/logo.png" }); // fallback
    }

    // "logo-<timestamp>.png" adına göre sıralayıp en yenisini bul
    const latest = blobs
      .filter(blob => blob.pathname.includes("logo-"))
      .sort((a, b) => {
        const aTime = parseInt(a.pathname.split("logo-")[1]);
        const bTime = parseInt(b.pathname.split("logo-")[1]);
        return bTime - aTime;
      })[0];

    return NextResponse.json({ filePath: latest.url });
  } catch (error) {
    console.error("Logo blob listelenemedi:", error);
    return NextResponse.json({ filePath: "/logo/logo.png" });
  }
}
