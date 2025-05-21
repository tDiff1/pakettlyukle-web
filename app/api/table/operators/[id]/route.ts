import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { del } from "@vercel/blob";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { aktiflik } = await req.json();

    const operatorId = parseInt(id, 10);
    if (isNaN(operatorId)) {
      return NextResponse.json(
        { error: "Geçersiz operatör ID." },
        { status: 400 }
      );
    }

    const aktiflikValue = Number(aktiflik);
    if (
      !Number.isInteger(aktiflikValue) ||
      ![0, 1, 2].includes(aktiflikValue)
    ) {
      return NextResponse.json(
        {
          error:
            "Geçersiz aktiflik değeri. 0 (Pasif), 1 (Aktif) veya 2 (Çıkarılmış) olmalı.",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.operators.update({
      where: { id: operatorId },
      data: { aktiflik: aktiflikValue },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Güncelleme sırasında hata oluştu." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const operatorId = parseInt(id, 10);
    if (isNaN(operatorId)) {
      return NextResponse.json(
        { error: "Geçersiz operatör ID." },
        { status: 400 }
      );
    }

    const operator = await prisma.operators.findUnique({
      where: { id: operatorId },
    });
    if (!operator) {
      return NextResponse.json(
        { error: "Operatör bulunamadı." },
        { status: 404 }
      );
    }

    // Delete the image from Vercel Blob using the filename
    if (operator.imageID) {
      try {
        const imageUrl = `https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${operator.imageID}`;
        await del(imageUrl);
      } catch (error) {
        console.warn("Resim silinirken hata oluştu:", error);
      }
    }

    await prisma.operators.delete({
      where: { id: operatorId },
    });

    return NextResponse.json({ message: "Operatör başarıyla silindi." });
  } catch (error) {
    console.error("Silme hatası:", error);
    return NextResponse.json(
      { error: "Silme sırasında hata oluştu." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
