import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function sendSmsToPhones(msgContent: string, phones: string[]) {
  if (phones.length === 0) return;

  if (
    !process.env.NETGSM_USERCODE ||
    !process.env.NETGSM_PASSWORD ||
    !process.env.NETGSM_MSGHEADER
  ) {
    console.error(
      "Net GSM kimlik bilgileri eksik: USERCODE, PASSWORD veya MSGHEADER tanımlı değil."
    );
    return;
  }

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
      <msg><![CDATA[${msgContent}]]></msg>
      ${phones.map((phone) => `<no>${phone}</no>`).join("")}
    </body>
  </mainbody>`;

  try {
    const res = await fetch("https://api.netgsm.com.tr/sms/send/xml", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xml,
    });
    const text = await res.text();
    if (!text.startsWith("00")) {
      console.error("NetGSM API Hatası:", text);
    } else {
      console.log("SMS gönderildi:", phones.join(", "));
    }
  } catch (e) {
    console.error("SMS gönderim hatası:", e);
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
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

    // Müşteri telefonunu normalize et
    const musteriPhoneRaw = updated.musteriNo.replace(/\s/g, "");
    const musteriPhone = musteriPhoneRaw.startsWith("0")
      ? `90${musteriPhoneRaw.slice(1)}`
      : `90${musteriPhoneRaw}`;

    // SMS içeriği
    let musteriSmsContent = "";
    if (body.gonderimDurumu === "Gönderildi") {
      musteriSmsContent = `Paketiniz (${updated.paket}) ${updated.tutar} TL karşılığında hattınıza başarıyla yüklenmiştir. Teşekkür ederiz.`;
    } else if (body.gonderimDurumu === "İade Edildi") {
      musteriSmsContent = `Paketiniz iptal edilmiştir. Vergi borçlarınızı ve faturalı/faturasız durumunuzu kontrol ediniz. Lütfen tekrar deneyiniz.`;
    }

    // SMS gönder
    if (musteriSmsContent) {
      await sendSmsToPhones(musteriSmsContent, [musteriPhone]);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Ödeme güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Ödeme güncellenemedi. Hata: " + error },
      { status: 500 }
    );
  }
}
