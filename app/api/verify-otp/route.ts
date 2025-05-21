import {  NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { phone, otp } = await req.json();
  const code = otp;

  const normalizedPhone = phone.replace(/^\+90/, "").replace(/^90/, "");

  // console.log("Gelen phone:", normalizedPhone);
  // console.log("Gelen code:", code);

  const record = await prisma.otpCode.findFirst({
    where: {
      phone: normalizedPhone,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!record) {
    console.log("Veritabanında kayıt bulunamadı.");
    return NextResponse.json({ error: "OTP bulunamadı" }, { status: 401 });
  }

  // console.log("Veritabanındaki kod:", record.code);

  if (record.code !== code.trim()) {
    console.log("Kod eşleşmedi.");
    return NextResponse.json({ error: "Kod hatalı" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
