import { NextRequest, NextResponse } from "next/server"; // NextRequest'i ekleyin
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteContext {
  params: Promise<{ id: string }>; // params'ı Promise olarak tanımla
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const resolvedParams = await params; // Promise'ı çöz
    const id = parseInt(resolvedParams.id, 10); // id'yi al
    if (isNaN(id)) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    }

    await prisma.smsRecipient.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Numara silindi" });
  } catch (error) {
    console.error("Silme hatası:", error);
    return NextResponse.json({ error: "Silme işlemi başarısız" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}