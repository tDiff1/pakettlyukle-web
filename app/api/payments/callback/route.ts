import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

async function sendSmsToPhones(msgContent: string, phones: string[]) {
  if (phones.length === 0) {
    console.log("SMS gönderilecek telefon yok.");
    return;
  }

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

  console.log("SMS gönderilecek numaralar:", phones);
  console.log("SMS içeriği:", msgContent);

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
    console.log("NetGSM API yanıtı:", text);

    if (!text.startsWith("00")) {
      console.error("NetGSM API Hatası:", text);
    } else {
      console.log("SMS başarıyla gönderildi:", phones.join(", "));
    }
  } catch (e) {
    console.error("SMS gönderim hatası:", e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("STATUS");
    let clientOrderId =
      searchParams.get("clientOrderId") ||
      searchParams.get("orderId") ||
      searchParams.get("transactionId");
    const data = searchParams.get("data");

    console.log("Callback GET parametreleri - STATUS:", status, "clientOrderId:", clientOrderId);

    if (!clientOrderId && data) {
      const decodedData = decodeURIComponent(data);
      const orderMatch = decodedData.match(/ORDER-\d+-\d+/);
      clientOrderId = orderMatch ? orderMatch[0] : null;
      console.log("Decoded data içinden clientOrderId bulundu:", clientOrderId);
    }

    if (!status) {
      console.error("Eksik status parametresi");
      return NextResponse.json(
        { success: false, error: "Eksik status parametresi" },
        { status: 400 }
      );
    }

    let payment = null;
    if (clientOrderId) {
      payment = await prisma.payment.findFirst({
        where: { clientOrderId },
      });
      console.log("ClientOrderId ile payment bulundu mu?", !!payment);
    }

    if (!payment) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      payment = await prisma.payment.findFirst({
        where: {
          onayDurumu: false,
          gonderimDurumu: "",
          createdAt: { gte: tenMinutesAgo },
        },
        orderBy: { createdAt: "desc" },
      });
      console.log("ClientOrderId yoksa son 10 dakikadan ödeme kaydı bulundu mu?", !!payment);
    }

    let redirectUrl = `${process.env.DOMAIN}/cancel`;

    if (payment) {
      let updatedPayment;

      const musteriPhoneRaw = payment.musteriNo.replace(/\s/g, "");
      const musteriPhone = musteriPhoneRaw.startsWith("0")
        ? `90${musteriPhoneRaw.slice(1)}`
        : `90${musteriPhoneRaw}`;

      console.log("Müşteri telefonu formatlandı:", musteriPhone);

      const recipients = await prisma.smsRecipient.findMany({
        select: { phone: true },
      });
      const adminPhones = recipients.map((r) => {
        const p = r.phone.replace(/\s/g, "");
        return p.startsWith("0") ? `90${p.slice(1)}` : `90${p}`;
      });
      console.log("Admin telefonları:", adminPhones);

      if (status.toUpperCase() === "SUCCESS") {
        updatedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            onayDurumu: true,
            gonderimDurumu: "Beklemede",
          },
        });

        const adminSmsContent = `Yeni ödeme: ${updatedPayment.musteriNo} numaralı müşteri,
Paket: ${updatedPayment.paket},
Tutar: ${updatedPayment.tutar} TRY,
Sipariş no: ${updatedPayment.clientOrderId || ""},
Tarih: ${updatedPayment.tarih} ${updatedPayment.saat}`.slice(0, 160);

          const musteriSmsContent = `Paketiniz (${updatedPayment.paket}) ${updatedPayment.tutar} TL talebiniz alınmıştır. Sabırınız için teşekkür ederiz.`;

        console.log("Admin SMS gönderiliyor...");
        await sendSmsToPhones(adminSmsContent, adminPhones);
        console.log("Müşteri SMS gönderiliyor...");
        await sendSmsToPhones(musteriSmsContent, [musteriPhone]);

        redirectUrl = `${process.env.DOMAIN}/success?paket=${encodeURIComponent(
          updatedPayment.paket
        )}&tutar=${updatedPayment.tutar}&musteriNo=${encodeURIComponent(
          updatedPayment.musteriNo
        )}&order=${encodeURIComponent(updatedPayment.clientOrderId || "")}`;
      } else if (["CANCEL", "ERROR"].includes(status.toUpperCase())) {
        updatedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            onayDurumu: false,
            gonderimDurumu: "Reddedildi",
          },
        });

        const adminSmsContent = `Ödeme iptal edildi: ${updatedPayment.musteriNo} numaralı müşteri,
Paket: ${updatedPayment.paket},
Tutar: ${updatedPayment.tutar} TRY,
Sipariş no: ${updatedPayment.clientOrderId || ""},
Tarih: ${updatedPayment.tarih} ${updatedPayment.saat}`.slice(0, 160);

        const musteriSmsContent = `Paketiniz başarıyla iptal olmuştur. Tekrar yüklemek isterseniz: ${process.env.DOMAIN}`;



        console.log("Admin SMS gönderiliyor...");
        await sendSmsToPhones(adminSmsContent, adminPhones);
        console.log("Müşteri SMS gönderiliyor...");
        await sendSmsToPhones(musteriSmsContent, [musteriPhone]);

        redirectUrl = `${process.env.DOMAIN}/cancel?paket=${encodeURIComponent(
          updatedPayment.paket
        )}&tutar=${updatedPayment.tutar}&musteriNo=${encodeURIComponent(
          updatedPayment.musteriNo
        )}&order=${encodeURIComponent(updatedPayment.clientOrderId || "")}`;
      } else if (status.toUpperCase() === "DECLINE") {
        updatedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            onayDurumu: false,
            gonderimDurumu: "Reddedildi",
          },
        });

        const adminSmsContent = `Ödeme reddedildi: ${updatedPayment.musteriNo} numaralı müşteri,
Paket: ${updatedPayment.paket},
Tutar: ${updatedPayment.tutar} TRY,
Sipariş no: ${updatedPayment.clientOrderId || ""},
Tarih: ${updatedPayment.tarih} ${updatedPayment.saat}`.slice(0, 160);

        const musteriSmsContent = `Yüklemeniz başarısız olmuştur. Lütfen tekrar deneyiniz.\nSite: ${process.env.DOMAIN}`;


        console.log("Admin SMS gönderiliyor...");
        await sendSmsToPhones(adminSmsContent, adminPhones);
        console.log("Müşteri SMS gönderiliyor...");
        await sendSmsToPhones(musteriSmsContent, [musteriPhone]);

        redirectUrl = `${process.env.DOMAIN}/decline?paket=${encodeURIComponent(
          updatedPayment.paket
        )}&tutar=${updatedPayment.tutar}&musteriNo=${encodeURIComponent(
          updatedPayment.musteriNo
        )}&order=${encodeURIComponent(updatedPayment.clientOrderId || "")}`;
      } else {
        console.log("Bilinmeyen status değeri:", status);
      }
    } else {
      console.log("Ödeme kaydı bulunamadı, status:", status);

      if (status.toUpperCase() === "SUCCESS") redirectUrl = `${process.env.DOMAIN}/success`;
      else if (["ERROR", "CANCEL"].includes(status.toUpperCase()))
        redirectUrl = `${process.env.DOMAIN}/cancel`;
      else if (status.toUpperCase() === "DECLINE")
        redirectUrl = `${process.env.DOMAIN}/decline`;
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Callback GET hata:", error);
    return NextResponse.redirect(`${process.env.DOMAIN}/cancel`);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientOrderId, status } = body;

    console.log("Callback POST parametreleri - status:", status, "clientOrderId:", clientOrderId);

    if (!clientOrderId || !status) {
      console.error("Eksik parametreler POST");
      return NextResponse.json(
        { success: false, error: "Eksik parametreler" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: { clientOrderId },
    });

    if (!payment) {
      console.error("Ödeme kaydı bulunamadı POST");
      return NextResponse.json(
        { success: false, error: "Ödeme kaydı bulunamadı" },
        { status: 404 }
      );
    }

    let redirectUrl = `${process.env.DOMAIN}/cancel`;
    let updatedPayment;

    const musteriPhoneRaw = payment.musteriNo.replace(/\s/g, "");
    const musteriPhone = musteriPhoneRaw.startsWith("0")
      ? `90${musteriPhoneRaw.slice(1)}`
      : `90${musteriPhoneRaw}`;

    console.log("POST Müşteri telefonu formatlandı:", musteriPhone);

    const recipients = await prisma.smsRecipient.findMany({
      select: { phone: true },
    });
    const adminPhones = recipients.map((r) => {
      const p = r.phone.replace(/\s/g, "");
      return p.startsWith("0") ? `90${p.slice(1)}` : `90${p}`;
    });

    console.log("POST Admin telefonları:", adminPhones);

    if (status.toUpperCase() === "SUCCESS") {
      updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          onayDurumu: true,
          gonderimDurumu: "Beklemede",
        },
      });

      const adminSmsContent = `Yeni ödeme: ${updatedPayment.musteriNo} numaralı müşteri,
Paket: ${updatedPayment.paket},
Tutar: ${updatedPayment.tutar} TRY,
Sipariş no: ${updatedPayment.clientOrderId || ""},
Tarih: ${updatedPayment.tarih} ${updatedPayment.saat}`.slice(0, 160);

const musteriSmsContent = `Paketiniz (${updatedPayment.paket}) ${updatedPayment.tutar} TL talebiniz alınmıştır. Sabırınız için teşekkür ederiz.`;


      console.log("POST Admin SMS gönderiliyor...");
      await sendSmsToPhones(adminSmsContent, adminPhones);
      console.log("POST Müşteri SMS gönderiliyor...");
      await sendSmsToPhones(musteriSmsContent, [musteriPhone]);

      redirectUrl = `${process.env.DOMAIN}/success?paket=${encodeURIComponent(
        updatedPayment.paket
      )}&tutar=${updatedPayment.tutar}&musteriNo=${encodeURIComponent(
        updatedPayment.musteriNo
      )}&order=${encodeURIComponent(updatedPayment.clientOrderId || "")}`;
    } else if (["CANCEL", "ERROR"].includes(status.toUpperCase())) {
      updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          onayDurumu: false,
          gonderimDurumu: "Reddedildi",
        },
      });

      const adminSmsContent = `Ödeme iptal edildi: ${updatedPayment.musteriNo} numaralı müşteri,
Paket: ${updatedPayment.paket},
Tutar: ${updatedPayment.tutar} TRY,
Sipariş no: ${updatedPayment.clientOrderId || ""},
Tarih: ${updatedPayment.tarih} ${updatedPayment.saat}`.slice(0, 160);

const musteriSmsContent = `Paketiniz başarıyla iptal olmuştur. Tekrar yüklemek isterseniz: ${process.env.DOMAIN}`;

      console.log("POST Admin SMS gönderiliyor...");
      await sendSmsToPhones(adminSmsContent, adminPhones);
      console.log("POST Müşteri SMS gönderiliyor...");
      await sendSmsToPhones(musteriSmsContent, [musteriPhone]);

      redirectUrl = `${process.env.DOMAIN}/cancel?paket=${encodeURIComponent(
        updatedPayment.paket
      )}&tutar=${updatedPayment.tutar}&musteriNo=${encodeURIComponent(
        updatedPayment.musteriNo
      )}&order=${encodeURIComponent(updatedPayment.clientOrderId || "")}`;
    } else if (status.toUpperCase() === "DECLINE") {
      updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          onayDurumu: false,
          gonderimDurumu: "Reddedildi",
        },
      });

      const adminSmsContent = `Ödeme reddedildi: ${updatedPayment.musteriNo} numaralı müşteri,
Paket: ${updatedPayment.paket},
Tutar: ${updatedPayment.tutar} TRY,
Sipariş no: ${updatedPayment.clientOrderId || ""},
Tarih: ${updatedPayment.tarih} ${updatedPayment.saat}`.slice(0, 160);

const musteriSmsContent = `Yüklemeniz başarısız olmuştur. Lütfen tekrar deneyiniz.\nSite: ${process.env.DOMAIN}`;


      console.log("POST Admin SMS gönderiliyor...");
      await sendSmsToPhones(adminSmsContent, adminPhones);
      console.log("POST Müşteri SMS gönderiliyor...");
      await sendSmsToPhones(musteriSmsContent, [musteriPhone]);

      redirectUrl = `${process.env.DOMAIN}/decline?paket=${encodeURIComponent(
        updatedPayment.paket
      )}&tutar=${updatedPayment.tutar}&musteriNo=${encodeURIComponent(
        updatedPayment.musteriNo
      )}&order=${encodeURIComponent(updatedPayment.clientOrderId || "")}`;
    } else {
      console.log("POST Bilinmeyen status değeri:", status);
    }

    return NextResponse.json({ success: true, redirectUrl }, { status: 200 });
  } catch (error) {
    console.error("Callback POST hata:", error);
    return NextResponse.json(
      { success: false, error: "İşlem sırasında bir hata oluştu" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
