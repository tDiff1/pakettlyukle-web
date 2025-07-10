import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3,
  delay: number = 1000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
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
      musteriNo,
      operator,
      paket,
      paketid,
      tutar: amount,
      saat,
      tarih,
      cardNumber,
      cardHolder,
      expiry,
      cvv,
    } = body;

    const API_URL =
      process.env.EFIXPAY_BASE_URL || "https://vpos.efixfatura.com.tr/api";


      console.log("DOMAIN:", process.env.DOMAIN);

    if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16) {
      throw new Error("Geçersiz kart numarası");
    }
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      throw new Error("Geçersiz CVV");
    }
    if (!expiry || !/^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiry)) {
      throw new Error("Geçersiz son kullanma tarihi");
    }

    const [month, year] = expiry.split("/");
    const expiryDate = `20${year}${month}`;

    const clientOrderId = `ORDER-${Date.now()}-${musteriNo.replace(/\s/g, "")}`;
    const payment = await prisma.payment.create({
      data: {
        musteriNumber: cardHolder || null,
        musteriNo,
        operator,
        paket,
        paketid,
        tutar: parseFloat(amount),
        saat,
        tarih,
        onayDurumu: false,
        gonderimDurumu: "",
        clientOrderId,
      },
    });

    const tokenRes = await fetchWithRetry(`${API_URL}/auth/merchant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: process.env.EFIXPAY_API_KEY,
        apiSecret:
          process.env.EFIXPAY_SECRET_KEY,
      }),
    });
    if (!tokenRes.ok) {
      throw new Error(`Token alınamadı: ${await tokenRes.text()}`);
    }
    const tokenData = await tokenRes.json();
    const token = tokenData.token;

    const detailRes = await fetchWithRetry(
      `${API_URL}/transactions/add-transactions-detail`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientOrderId,
          totalAmount: amount,
        successUrl: `${process.env.DOMAIN}/api/payments/callback`,
        cancelUrl: `${process.env.DOMAIN}/api/payments/callback`,
        declineUrl: `${process.env.DOMAIN}/api/payments/callback`,
        // successUrl: `http://localhost:3000/api/payments/callback`,
        // cancelUrl: `http://localhost:3000/api/payments/callback`,
        // declineUrl: `http://localhost:3000/api/payments/callback`,
        }),
      }
    );
    if (!detailRes.ok) {
      throw new Error(`İşlem detayı eklenemedi: ${await detailRes.text()}`);
    }

    const startRes = await fetchWithRetry(`${API_URL}/transactions/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount,
        language: "TR",
        successUrl: `${process.env.DOMAIN}/api/payments/callback`,
        cancelUrl: `${process.env.DOMAIN}/api/payments/callback`,
        declineUrl: `${process.env.DOMAIN}/api/payments/callback`,
        // successUrl: `http://localhost:3000/api/payments/callback`,
        // cancelUrl: `http://localhost:3000/api/payments/callback`,
        // declineUrl: `http://localhost:3000/api/payments/callback`,
        clientOrderId,
        currency: "TRY",
        Cvv: cvv,
        Pan: cardNumber.replace(/\s/g, ""),
        ExpiryDate: expiryDate,
        CardOwner: cardHolder,
        InstallmentCount: 1,
        merchantId: "20250120",
        subMerchantId: "20250120",
      }),
    });
    const startData = await startRes.json();
    console.log(
      "Checkout API Yanıtı:",
      startData,
      "HTTP Durumu:",
      startRes.status
    );

    if (startRes.ok && startData.url3ds) {
      return NextResponse.json(
        {
          success: true,
          payment,
          data: {
            id: payment.id,
            status: "Pending",
            transactionId: startData.transactionId,
            url3ds: startData.url3ds,
            actionUrl: startData.actionUrl,
          },
        },
        { status: 201 }
      );
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          onayDurumu: false,
          gonderimDurumu: "Reddedildi",
        },
      });
      return NextResponse.json(
        {
          success: false,
          payment,
          data: {
            id: payment.id,
            status: "Failed",
            message: startData.message || "Ödeme başlatılamadı",
          },
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("POST hata:", error);
    return NextResponse.json(
      { success: false, error: "Ödeme işlemi başarısız. Hata: " + error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const id = parseInt((await params).id, 10);
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
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
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
