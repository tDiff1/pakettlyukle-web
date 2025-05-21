import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type PacketUpdateInput = {
  key?: string;
  packet_title?: string;
  packet_content?: string;
  heryone_dk?: number;
  heryone_sms?: number;
  heryone_int?: number;
  price?: number;
};

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const packetId = parseInt(id, 10);
    if (isNaN(packetId)) {
      return NextResponse.json(
        { error: "Geçersiz paket ID." },
        { status: 400 }
      );
    }

    const {
      key,
      packet_title,
      packet_content,
      heryone_dk,
      heryone_sms,
      heryone_int,
      price,
    } = body;

    if (heryone_dk !== undefined && !Number.isInteger(Number(heryone_dk))) {
      return NextResponse.json({ error: "Heryöne dakika tam sayı olmalı" }, { status: 400 });
    }
    if (heryone_sms !== undefined && !Number.isInteger(Number(heryone_sms))) {
      return NextResponse.json({ error: "Heryöne SMS tam sayı olmalı" }, { status: 400 });
    }
    if (heryone_int !== undefined && !Number.isInteger(Number(heryone_int))) {
      return NextResponse.json({ error: "Heryöne internet tam sayı olmalı" }, { status: 400 });
    }
    if (price !== undefined && !Number.isInteger(Number(price))) {
      return NextResponse.json({ error: "Fiyat tam sayı olmalı" }, { status: 400 });
    }

    const updateData: PacketUpdateInput = {};
    if (key !== undefined) updateData.key = key;
    if (packet_title !== undefined) updateData.packet_title = packet_title;
    if (packet_content !== undefined) updateData.packet_content = packet_content;
    if (heryone_dk !== undefined) updateData.heryone_dk = Number(heryone_dk);
    if (heryone_sms !== undefined) updateData.heryone_sms = Number(heryone_sms);
    if (heryone_int !== undefined) updateData.heryone_int = Number(heryone_int);
    if (price !== undefined) updateData.price = Number(price);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Güncellenecek veri sağlanmadı." },
        { status: 400 }
      );
    }

    const updated = await prisma.packets.update({
      where: { id: packetId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Güncelleme hatası:", error.message);
      return NextResponse.json(
        { error: "Güncelleme hatası: " + error.message },
        { status: 500 }
      );
    }
    console.error("Bilinmeyen güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Bilinmeyen güncelleme hatası oluştu." },
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
    const packetId = parseInt(id, 10);

    if (isNaN(packetId)) {
      return NextResponse.json(
        { error: "Geçersiz paket ID." },
        { status: 400 }
      );
    }

    await prisma.packets.delete({
      where: { id: packetId },
    });

    return NextResponse.json(
      { message: `Paket ${packetId} silindi.` },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Silme hatası:", error.message);
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
