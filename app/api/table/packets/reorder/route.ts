import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const { packets } = await req.json();

    if (
      !Array.isArray(packets) ||
      packets.some((p) => !p.id || typeof p.sort_order !== "number")
    ) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      packets.map(({ id, sort_order }) =>
        prisma.packets.update({
          where: { id },
          data: { sort_order },
        })
      )
    );

    return NextResponse.json(
      { message: "Sıralama güncellendi" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sıralama güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Sıralama güncellenemedi" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
