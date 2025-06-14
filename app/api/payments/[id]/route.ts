import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteContext {
  params: Promise<{ id: string }>; // params Promise olarak tanımlı
}


export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10); // ✅ string → number dönüşümü
    if (isNaN(id)) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        onayDurumu: body.onayDurumu,
        gonderimDurumu: body.gonderimDurumu,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Ödeme güncellenemedi. Hata: " + error },
      { status: 500 }
    );
  }
}



export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const resolvedParams = await params; // Promise'ı çöz
    const id = parseInt(resolvedParams.id, 10); // id'yi al
    if (isNaN(id)) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    }

    await prisma.smsRecipient.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Silme hatası:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}