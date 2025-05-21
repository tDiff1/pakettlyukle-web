// app/api/table/[table]/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ table: string; id: string }> }
) {
  const { table, id } = await context.params;
  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Geçersiz ID." }, { status: 400 });
  }

  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Geçerli bir 'content' girin." }, { status: 400 });
    }

    let updatedEntry;

    switch (table) {
      case "header":
        updatedEntry = await prisma.header.update({
          where: { id: numericId },
          data: { content },
        });
        break;
      case "footer":
        updatedEntry = await prisma.footer.update({
          where: { id: numericId },
          data: { content },
        });
        break;
      case "home":
        updatedEntry = await prisma.home.update({
          where: { id: numericId },
          data: { content },
        });
        break;
      case "siteinfo":
        updatedEntry = await prisma.siteInfo.update({
          where: { id: numericId },
          data: { content },
        });
        break;
      case "yasal":
        updatedEntry = await prisma.yasal.update({
          where: { id: numericId },
          data: { content },
        });
        break;
      default:
        return NextResponse.json({ error: "Geçersiz tablo adı." }, { status: 400 });
    }

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
