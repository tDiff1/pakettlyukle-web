import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { name, contactPhone, loadedNumber, email, message } = body;

  // Validation
  if (
    !name || name.trim().length < 3 ||
    !contactPhone || !/^\d{11}$/.test(contactPhone) ||
    !loadedNumber || !/^\d{11}$/.test(loadedNumber) ||
    !message || message.trim().length < 3
  ) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  // SMS içeriği dinamik ve sade
  let smsContent = `Ad: ${name}\nİletişim Numarası: ${contactPhone}\nYükleme Yapılan Telefon Numarası: ${loadedNumber}\nMesaj: ${message}`;
  if (email && email.trim() !== "") {
    smsContent += `\nE-posta: ${email}`;
  }

  // Sms gönderilecek numaraları veritabanından alıyoruz
  const recipients = await prisma.smsRecipient.findMany({
    select: { phone: true },
  });

  const phones = recipients.map((r) => {
    const phone = r.phone.replace(/\s/g, "");
    return phone.startsWith("0") ? `90${phone.slice(1)}` : `90${phone}`;
  });

  if (phones.length === 0) {
    console.log("SMS gönderilecek numara bulunamadı.");
    return NextResponse.json({ error: "Telefon numarası yok" }, { status: 404 });
  }

  if (!process.env.NETGSM_USERCODE || !process.env.NETGSM_PASSWORD || !process.env.NETGSM_MSGHEADER) {
    console.error("Net GSM kimlik bilgileri eksik");
    return NextResponse.json({ error: "NetGSM bilgileri eksik" }, { status: 500 });
  }

  try {
    const xml = `<?xml version="1.0"?>
      <mainbody>
        <header>
          <usercode>${process.env.NETGSM_USERCODE}</usercode>
          <password>${process.env.NETGSM_PASSWORD}</password>
          <startdate></startdate>
          <stopdate></stopdate>
          <type>1:n</type>
          <msgheader>${process.env.NETGSM_MSGHEADER}</msgheader>
        </header>
        <body>
          <msg><![CDATA[${smsContent}]]></msg>
          ${phones.map((phone) => `<no>${phone}</no>`).join("")}
        </body>
      </mainbody>`;

    const smsRes = await fetch("https://api.netgsm.com.tr/sms/send/xml", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xml,
    });

    const resultText = await smsRes.text();

    if (!resultText.startsWith("00")) {
      console.error("NetGSM API Hatası:", resultText);
      return NextResponse.json({ error: "NetGSM gönderim hatası" }, { status: 500 });
    }

    console.log("SMS gönderildi:", resultText);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SMS gönderim hatası:", error);
    return NextResponse.json({ error: "SMS gönderim hatası" }, { status: 500 });
  }
}
