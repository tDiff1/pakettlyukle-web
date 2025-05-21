// app/api/sms-recipients/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Listeyi getir
export async function GET() {
  try {
    const recipients = await prisma.smsRecipient.findMany({
      select: { id: true, phone: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(recipients);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// POST: Numara ekle
export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Geçersiz numara" }, { status: 400 });
    }

    // Aynı numara varsa engelle
    const existing = await prisma.smsRecipient.findUnique({
      where: { phone },
    });

    if (existing) {
      return NextResponse.json({ error: "Zaten kayıtlı" }, { status: 409 });
    }

    const newRecipient = await prisma.smsRecipient.create({
      data: { phone },
    });

    return NextResponse.json(newRecipient, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
