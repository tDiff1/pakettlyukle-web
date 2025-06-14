import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("STATUS");
    let clientOrderId = searchParams.get("clientOrderId") || searchParams.get("orderId") || searchParams.get("transactionId");
    const data = searchParams.get("data");

    if (!clientOrderId && data) {
      const decodedData = decodeURIComponent(data);
      const orderMatch = decodedData.match(/ORDER-\d+-\d+/);
      clientOrderId = orderMatch ? orderMatch[0] : null;
    }

    // console.log(`Callback Parametreleri: status=${status}, clientOrderId=${clientOrderId}, URL: ${req.nextUrl.href}`);

    if (!status) {
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
      if (payment) {
        // console.log(`Fallback ile ödeme bulundu: paymentId=${payment.id}, clientOrderId=${clientOrderId}`);
      } else {
        console.log(`Fallback ile ödeme bulunamadı: status=${status}, clientOrderId=${clientOrderId}`);
      }
    }

    // let redirectUrl = `http://localhost:3000/cancel`;
    let redirectUrl = `${process.env.DOMAIN || 'http://localhost:3000'}/cancel`;

    if (payment) {
      let updatedPayment;
      if (status === "SUCCESS") {
        updatedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            onayDurumu: true,
            gonderimDurumu: "Beklemede",
          },
        });

        const smsContent = `Yeni ödeme: ${updatedPayment.musteriNo} numaralı müşteri,\nPaket: ${updatedPayment.paket},\nTutar: ${updatedPayment.tutar},\nSipariş numarası: ${updatedPayment.clientOrderId || ''}\nTarih: ${updatedPayment.tarih} ${updatedPayment.saat} B023`.slice(0, 160);

        const recipients = await prisma.smsRecipient.findMany({
          select: { id: true, phone: true },
        });
        const phones = recipients.map((r) => {
          const phone = r.phone.replace(/\s/g, "");
          return phone.startsWith("0") ? `90${phone.slice(1)}` : `90${phone}`;
        });

        if (phones.length > 0) {
          if (!process.env.NETGSM_USERCODE || !process.env.NETGSM_PASSWORD || !process.env.NETGSM_MSGHEADER) {
            console.error("Net GSM kimlik bilgileri eksik: USERCODE, PASSWORD veya MSGHEADER tanımlı değil.");
          } else {
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
              // console.log(`Net GSM SMS Gönderim Sonucu: ${resultText}, Gönderilen Numaralar: ${phones.join(", ")}`);

              if (!resultText.startsWith("00")) {
                console.error("NetGSM API Hatası:", resultText);
              } else {
                console.log("SMS gönderimi başarılı!");
              }
            } catch (smsError) {
              console.error("Net GSM SMS Gönderim Hatası:", smsError);
            }
          }
        } else {
          console.log("SMS gönderilecek telefon numarası bulunamadı.");
        }

        redirectUrl = `${process.env.DOMAIN || 'http://localhost:3000'}/success?paket=${encodeURIComponent(updatedPayment.paket)}&tutar=${updatedPayment.tutar}&musteriNo=${encodeURIComponent(updatedPayment.musteriNo)}&order=${encodeURIComponent(updatedPayment.clientOrderId || '')}`;
      } else if (status === "CANCEL" || status === "ERROR") {
        updatedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            onayDurumu: false,
            gonderimDurumu: "Reddedildi",
          },
        });

        const smsContent = `Ödeme iptal edildi: ${updatedPayment.musteriNo} numaralı müşteri,\nPaket: ${updatedPayment.paket},\nTutar: ${updatedPayment.tutar} TRY,\nSipariş numarası: ${updatedPayment.clientOrderId || ''}\nTarih: ${updatedPayment.tarih} ${updatedPayment.saat}`.slice(0, 160);

        const recipients = await prisma.smsRecipient.findMany({
          select: { id: true, phone: true },
        });
        const phones = recipients.map((r) => {
          const phone = r.phone.replace(/\s/g, "");
          return phone.startsWith("0") ? `90${phone.slice(1)}` : `90${phone}`;
        });

        if (phones.length > 0) {
          if (!process.env.NETGSM_USERCODE || !process.env.NETGSM_PASSWORD || !process.env.NETGSM_MSGHEADER) {
            console.error("Net GSM kimlik bilgileri eksik: USERCODE, PASSWORD veya MSGHEADER tanımlı değil.");
          } else {
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
              //console.log(`Net GSM SMS Gönderim Sonucu: ${resultText}, Gönderilen Numaralar: ${phones.join(", ")}`);

              if (!resultText.startsWith("00")) {
                console.error("NetGSM API Hatası:", resultText);
              } else {
                console.log("SMS gönderimi başarılı!");
              }
            } catch (smsError) {
              console.error("Net GSM SMS Gönderim Hatası:", smsError);
            }
          }
        } else {
          console.log("SMS gönderilecek telefon numarası bulunamadı.");
        }

        redirectUrl = `${process.env.DOMAIN || 'http://localhost:3000'}/cancel?paket=${encodeURIComponent(updatedPayment.paket)}&tutar=${updatedPayment.tutar}&musteriNo=${encodeURIComponent(updatedPayment.musteriNo)}&order=${encodeURIComponent(updatedPayment.clientOrderId || '')}`;
      } else if (status === "DECLINE") {
        updatedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            onayDurumu: false,
            gonderimDurumu: "Reddedildi",
          },
        });
        redirectUrl = `${process.env.DOMAIN || 'http://localhost:3000'}/decline?paket=${encodeURIComponent(updatedPayment.paket)}&tutar=${updatedPayment.tutar}&musteriNo=${encodeURIComponent(updatedPayment.musteriNo)}&order=${encodeURIComponent(updatedPayment.clientOrderId || '')}`;
      }
    } else {
      console.log(`Ödeme kaydı bulunamadı: clientOrderId=${clientOrderId}, data=${data}, status=${status}`);
      if (status === "SUCCESS") {
        redirectUrl = `${process.env.DOMAIN || 'http://localhost:3000'}/success`;
      } else if (status === "ERROR" || status === "CANCEL") {
        redirectUrl = `${process.env.DOMAIN || 'http://localhost:3000'}/cancel`;
      } else if (status === "DECLINE") {
        redirectUrl = `${process.env.DOMAIN || 'http://localhost:3000'}/decline`;
      }
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Callback GET hata:", error);
    return NextResponse.redirect(`${process.env.DOMAIN || 'http://localhost:3000'}/cancel`);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientOrderId, status } = body;

    console.log(`POST Callback: clientOrderId=${clientOrderId}, status=${status}`);

    if (!clientOrderId || !status) {
      return NextResponse.json(
        { success: false, error: "Eksik parametreler" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: { clientOrderId },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Ödeme kaydı bulunamadı" },
        { status: 404 }
      );
    }

    let redirectUrl = `${process.env.DOMAIN || 'http://localhost:3000'}/cancel`;
    let updatedPayment;

    if (status === "Success") {
      updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          onayDurumu: true,
          gonderimDurumu: "Beklemede",
        },
      });

      const smsContent = `Yeni ödeme: ${updatedPayment.musteriNo} numaralı müşteri,\nPaket: ${updatedPayment.paket},\nTutar: ${updatedPayment.tutar} TRY,\nSipariş numarası: ${updatedPayment.clientOrderId || ''}\nTarih: ${updatedPayment.tarih} ${updatedPayment.saat} B023`.slice(0, 160);

      const recipients = await prisma.smsRecipient.findMany({
        select: { id: true, phone: true },
      });
      const phones = recipients.map((r) => {
        const phone = r.phone.replace(/\s/g, "");
        return phone.startsWith("0") ? `90${phone.slice(1)}` : `90${phone}`;
      });

      if (phones.length > 0) {
        if (!process.env.NETGSM_USERCODE || !process.env.NETGSM_PASSWORD || !process.env.NETGSM_MSGHEADER) {
          console.error("Net GSM kimlik bilgileri eksik: USERCODE, PASSWORD veya MSGHEADER tanımlı değil.");
        } else {
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
            //console.log(`Net GSM SMS Gönderim Sonucu: ${resultText}, Gönderilen Numaralar: ${phones.join(", ")}`);

            if (!resultText.startsWith("00")) {
              console.error("NetGSM API Hatası:", resultText);
            } else {
              console.log("SMS gönderimi başarılı!");
            }
          } catch (smsError) {
            console.error("Net GSM SMS Gönderim Hatası:", smsError);
          }
        }
      } else {
        console.log("SMS gönderilecek telefon numarası bulunamadı.");
      }

      redirectUrl = `${process.env.DOMAIN || 'http://localhost:3000'}/success?paket=${encodeURIComponent(updatedPayment.paket)}&tutar=${updatedPayment.tutar}&musteriNo=${encodeURIComponent(updatedPayment.musteriNo)}&order=${encodeURIComponent(updatedPayment.clientOrderId || '')}`;
    } else if (status === "Cancel" || status === "Decline") {
      updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          onayDurumu: false,
          gonderimDurumu: "Reddedildi",
        },
      });

      const smsContent = `Ödeme iptal edildi: ${updatedPayment.musteriNo} numaralı müşteri,\nPaket: ${updatedPayment.paket},\nTutar: ${updatedPayment.tutar} TRY,\nSipariş numarası: ${updatedPayment.clientOrderId || ''}\nTarih: ${updatedPayment.tarih} ${updatedPayment.saat}`.slice(0, 160);

      const recipients = await prisma.smsRecipient.findMany({
        select: { id: true, phone: true },
      });
      const phones = recipients.map((r) => {
        const phone = r.phone.replace(/\s/g, "");
        return phone.startsWith("0") ? `90${phone.slice(1)}` : `90${phone}`;
      });

      if (phones.length > 0) {
        if (!process.env.NETGSM_USERCODE || !process.env.NETGSM_PASSWORD || !process.env.NETGSM_MSGHEADER) {
          console.error("Net GSM kimlik bilgileri eksik: USERCODE, PASSWORD veya MSGHEADER tanımlı değil.");
        } else {
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
            //console.log(`Net GSM SMS Gönderim Sonucu: ${resultText}, Gönderilen Numaralar: ${phones.join(", ")}`);

            if (!resultText.startsWith("00")) {
              console.error("NetGSM API Hatası:", resultText);
            } else {
              console.log("SMS gönderimi başarılı!");
            }
          } catch (smsError) {
            console.error("Net GSM SMS Gönderim Hatası:", smsError);
          }
        }
      } else {
        console.log("SMS gönderilecek telefon numarası bulunamadı.");
      }

      redirectUrl = `${process.env.DOMAIN || 'http://localhost:3000'}/cancel?paket=${encodeURIComponent(updatedPayment.paket)}&tutar=${updatedPayment.tutar}&musteriNo=${encodeURIComponent(updatedPayment.musteriNo)}&order=${encodeURIComponent(updatedPayment.clientOrderId || '')}`;
    }

    return NextResponse.json(
      { success: true, redirectUrl },
      { status: 200 }
    );
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