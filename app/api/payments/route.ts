// app/api/payments/route.ts
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
    const {
      cardNumber,
      cardHolder,
      expiry,
      cvv,
      amount,
      musteriNo,
      operator,
      paket,
      paketid,
      saat,
      tarih,
      onayDurumu,
      gonderimDurumu,
    } = body;

    // 1. Token al
    const tokenRes = await fetchWithRetry(
      `${process.env.EFIXPAY_BASE_URL}/auth/merchant`, // veya doğru endpoint
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: "50d54b52fa7c4284bcfef7409b520763",
          apiSecret: "ad809e9bb8ca4fbf85820668c4b4ae757f39cabc28b5449eaf43d4d93e336a8a",
        }),
      }
    );
    console.log("İstek yapılan URL:", `${process.env.EFIXPAY_BASE_URL}/auth/merchant`);
    console.log("HTTP Durumu:", tokenRes.status);
    const text = await tokenRes.text();
    console.log("API Yanıtı:", text || "Boş yanıt");
    if (!tokenRes.ok)
      throw new Error(
        `API Hatası: ${tokenRes.status} - ${text || "Yanıt yok"}`
      );
      
    const tokenData = await tokenRes.json();

    const token = tokenData.token;

    // 2. İşlem Detayı Ekle
    const clientOrderId = Date.now().toString();
    const detailRes = await fetchWithRetry(
      `${process.env.EFIXPAY_BASE_URL}/transactions/add-transactions-detail`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Token: token,
        },
        body: JSON.stringify({
          clientOrderId,
          totalAmount: amount,
        }),
      }
    );
    if (!detailRes.ok) throw new Error("İşlem detayı eklenemedi");

    // 3. Ödeme Başlat
    const startRes = await fetchWithRetry(
      `${process.env.EFIXPAY_BASE_URL}/transactions/checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Token: token,
        },
        body: JSON.stringify({
          amount,
          language: "TR",
          successUrl: "http://localhost:3000/success",
          cancelUrl: "http://localhost:3000/cancel",
          declineUrl: "http://localhost:3000/decline",
          clientOrderId,
          currency: "TRY",
          Cvv: cvv,
          Pan: cardNumber.replace(/\s/g, ""),
          ExpiryDate: expiry.replace("/", ""),
          CardOwner: cardHolder,
          InstallmentCount: 1,
        }),
      }
    );
    const startData = await startRes.json();
    if (!startRes.ok)
      throw new Error(startData.message || "Ödeme başlatılamadı");

    // 4. Ödeme Kaydet
    const payment = await prisma.payment.create({
      data: {
        musteriNo,
        operator,
        paket,
        paketid,
        tutar: parseFloat(amount),
        saat,
        tarih,
        onayDurumu: onayDurumu ?? true,
        gonderimDurumu: gonderimDurumu ?? "Beklemede",
      },
    });

    // 5. SMS Gönder
    const recipients = await prisma.smsRecipient.findMany({
      select: { id: true, phone: true },
    });
    const phones = recipients.map((r) => {
      const phone = r.phone.replace(/\s/g, "");
      return phone.startsWith("0") ? `90${phone.slice(1)}` : `90${phone}`;
    });

    const message = `Yeni ödeme: ${payment.musteriNo} numaralı müşteri,\nPaket ismi: ${payment.paket},\nPaket tutarı: ${payment.tutar},\nSatın alma tarihi: ${payment.tarih} ${payment.saat}`;
    if (phones.length > 0) {
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

      const smsRes = await fetchWithRetry(
        "https://api.netgsm.com.tr/sms/send/xml",
        {
          method: "POST",
          headers: { "Content-Type": "application/xml" },
          body: xml,
        }
      );
      const resultText = await smsRes.text();
      if (!resultText.startsWith("00")) {
        console.error("NetGSM API Hatası:", resultText);
      }
    }

    return NextResponse.json(
      { success: true, payment, data: startData },
      { status: 201 }
    );
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json(
      { success: false, error: error },
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
