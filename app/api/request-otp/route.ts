import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  let { phone } = await req.json();
  phone = phone.replace(/^90/, "");

  if (!/^5\d{9}$/.test(phone)) {
    return NextResponse.json(
      { error: "Telefon numarası geçersiz!" },
      { status: 400 }
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Var olan kayıt varsa sil
    await prisma.otpCode.deleteMany({
      where: { phone },
    });

    // Yeni kodu kaydet
    await prisma.otpCode.create({
      data: {
        phone,
        code: otp,
      },
    });

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
        <msg><![CDATA[Doğrulama kodunuz: ${otp}]]></msg>
        <no>90${phone}</no>
      </body>
    </mainbody>`;

    const response = await fetch("https://api.netgsm.com.tr/sms/send/xml", {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
      },
      body: xml,
    });
    // console.log("usercode", process.env.NETGSM_USERCODE);
    // console.log("password", process.env.NETGSM_PASSWORD);
    // console.log("msgheader", process.env.NETGSM_MSGHEADER);
    const resultText = await response.text();
    if (resultText.startsWith("00")) {
      return NextResponse.json({ success: true });
    } else {
      console.error("NetGSM API Error:", resultText);
      return NextResponse.json(
        { error: "NetGSM başarısız: " + resultText },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[request-otp] Hata:", err);
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}
