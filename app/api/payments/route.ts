import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

// Yeniden deneme fonksiyonu
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3,
  delay: number = 1000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 saniye timeout
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(
        `Deneme ${i + 1} başarısız, ${delay}ms sonra tekrar deniyor...`,
        error
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Tüm denemeler başarısız");
}

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(payments, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { success: false, error: "Veri alınamadı." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Yeni ödemeyi kaydet
    const payment = await prisma.payment.create({
      data: {
        musteriNo: body.musteriNo,
        operator: body.operator,
        paket: body.paket,
        paketid: body.paketid,
        tutar: parseFloat(body.tutar),
        saat: body.saat,
        tarih: body.tarih,
        onayDurumu: body.onayDurumu ?? true,
        gonderimDurumu: body.gonderimDurumu ?? "Beklemede",
      },
    });

    // SmsRecipient tablosundan telefon numaralarını al
    const recipients = await prisma.smsRecipient.findMany({
      select: { id: true, phone: true },
    });

    const phones = recipients.map((r) => {
      let phone = r.phone.replace(/\s/g, "");
      if (!phone.startsWith("90")) {
        phone = phone.startsWith("0") ? `90${phone.slice(1)}` : `90${phone}`;
      }
      return phone;
    });

    // SMS mesajını oluştur
    const message = `Yeni ödeme: ${payment.musteriNo} numaralı müşteri,\nPaket ismi: ${payment.paket},\nPaket tutarı: ${payment.tutar},\nSatın alma tarihi: ${payment.tarih} ${payment.saat}`;

    if (phones.length > 0) {
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
        <msg><![CDATA[${message}]]></msg>
        ${phones.map((phone) => `<no>${phone}</no>`).join("")}
      </body>
    </mainbody>`;

        const response = await fetchWithRetry(
          "https://api.netgsm.com.tr/sms/send/xml",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/xml",
            },
            body: xml,
          }
        );

        const resultText = await response.text();
        if (!resultText.startsWith("00")) {
          console.error("NetGSM API Hatası:", resultText);
        }
      } catch (smsError) {
        console.error("SMS gönderim hatası:", smsError);
      }
    }

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { success: false, error: "Bir hata oluştu." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

interface RouteContext {
  params: Promise<{ id: string }>; // params'ı Promise olarak tanımla
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