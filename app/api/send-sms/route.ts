import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phones, message } = await request.json();

    if (!phones || !message) {
      return NextResponse.json(
        { error: "Telefon numaraları ve mesaj gerekli" },
        { status: 400 }
      );
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
        ${phones
          .map(
            (phone: string) => `
        <msg><![CDATA[${message}]]></msg>
        <no>${phone}</no>
        `
          )
          .join("")}
      </body>
    </mainbody>`;

    const response = await fetch("https://api.netgsm.com.tr/sms/send/xml", {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
      },
      body: xml,
    });

    const resultText = await response.text();
    if (
      resultText.startsWith("00") ||
      resultText.includes("17377215342605050417149344")
    ) {
      return NextResponse.json(
        { success: true, jobid: resultText },
        { status: 200 }
      );
    } else {
      console.error("NetGSM API Hatası:", resultText);
      return NextResponse.json(
        { error: "NetGSM başarısız: " + resultText },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("SMS gönderim hatası:", error.message);
    } else {
      console.error("SMS gönderiminde bilinmeyen bir hata oluştu");
    }
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
