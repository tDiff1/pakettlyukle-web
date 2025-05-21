import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const packets = await prisma.packets.findMany();
    return NextResponse.json(packets, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Veri alınamadı" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      key,
      packet_title,
      packet_content,
      heryone_dk,
      heryone_sms,
      heryone_int,
      price,
    } = body;

    if (!key) {
      return NextResponse.json(
        { error: "Operatör anahtarı zorunludur." },
        { status: 400 }
      );
    }


    if (heryone_dk !== undefined && !Number.isInteger(Number(heryone_dk))) {
      return NextResponse.json(
        { error: "Heryöne dakika tam sayı olmalı" },
        { status: 400 }
      );
    }
    if (heryone_sms !== undefined && !Number.isInteger(Number(heryone_sms))) {
      return NextResponse.json(
        { error: "Heryöne SMS tam sayı olmalı" },
        { status: 400 }
      );
    }
    if (heryone_int !== undefined && !Number.isInteger(Number(heryone_int))) {
      return NextResponse.json(
        { error: "Heryöne internet tam sayı olmalı" },
        { status: 400 }
      );
    }
    if (price !== undefined && !Number.isInteger(Number(price))) {
      return NextResponse.json(
        { error: "Fiyat tam sayı olmalı" },
        { status: 400 }
      );
    }

    const newPacket = await prisma.packets.create({
      data: {
        key,
        packet_title: packet_title || "",
        packet_content: packet_content || "",
        heryone_dk: heryone_dk !== undefined ? Number(heryone_dk) : 0,
        heryone_sms: heryone_sms !== undefined ? Number(heryone_sms) : 0,
        heryone_int: heryone_int !== undefined ? Number(heryone_int) : 0,
        price: price !== undefined ? Number(price) : 0,
      },
    });

    return NextResponse.json(newPacket, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Ekleme hatası:", error);
      return NextResponse.json(
        { error: "Ekleme hatası: " + error.message },
        { status: 500 }
      );
    }
    console.error("Bilinmeyen ekleme hatası:", error);
    return NextResponse.json(
      { error: "Bilinmeyen ekleme hatası oluştu." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Operatör anahtarı zorunludur." },
        { status: 400 }
      );
    }

    const deleteResult = await prisma.packets.deleteMany({
      where: { key },
    });

    return NextResponse.json(
      { message: `${deleteResult.count} paket silindi.` },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Silme hatası:", error);
      return NextResponse.json(
        { error: "Silme hatası: " + error.message },
        { status: 500 }
      );
    }
    console.error("Bilinmeyen silme hatası:", error);
    return NextResponse.json(
      { error: "Bilinmeyen silme hatası oluştu." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
