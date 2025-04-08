import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    await prisma.packets.createMany({
      data: [
        { key: "turk-telekom", packet_title: "⭐Dijital 8 Avantajlı ⭐", packet_content: "HER YÖNE 8 GB+ 750 DK+ 250 SMS", kupur: "605", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 8000 },
        { key: "turk-telekom", packet_title: "⭐Dijital 12  Avantajlı ⭐", packet_content: "HER YÖNE 12GB+ 750 DK+ 250 SMS", kupur: "610", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 12000 },
        { key: "turk-telekom", packet_title: "⭐Dijital 20  Avantajlı ⭐", packet_content: "HER YÖNE 20 GB+ 750 DK+ 250 SMS", kupur: "615", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 20000 },
        { key: "turk-telekom", packet_title: "⭐Dijital 30  Avantajlı ⭐", packet_content: "HER YÖNE 30 GB+ 750 DK+ 250 SMS", kupur: "625", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 30000 },
        { key: "turk-telekom", packet_title: "⭐Mobil Yaşa 3 ⭐", packet_content: "3 GB  İnternet  1000 DK 250 SMS", kupur: "635", heryone_dk: 1000, yd_dk: 0, heryone_sms: 100, heryone_int: 3000 },
        { key: "turk-telekom", packet_title: "⭐Mobil Yaşa 5 ⭐", packet_content: "5 GB  İnternet  1000 DK 250 SMS", kupur: "640", heryone_dk: 1000, yd_dk: 0, heryone_sms: 100, heryone_int: 5000 },
        { key: "turk-telekom", packet_title: "⭐Mobil Yaşa 9 ⭐", packet_content: "9 GB  İnternet  1000 DK 250 SMS", kupur: "645", heryone_dk: 1000, yd_dk: 0, heryone_sms: 100, heryone_int: 9000 },
        { key: "turk-telekom", packet_title: "⭐Mobil Yaşa 12 ⭐", packet_content: "12 GB  İnternet  1000 DK 250 SMS", kupur: "650", heryone_dk: 1000, yd_dk: 0, heryone_sms: 100, heryone_int: 12000 },
        { key: "turk-telekom", packet_title: "⭐Mobil Yaşa 18 ⭐", packet_content: "18 GB  İnternet  1000 DK 250 SMS", kupur: "655", heryone_dk: 1000, yd_dk: 0, heryone_sms: 100, heryone_int: 18000 },
        { key: "turk-telekom", packet_title: "⭐Mobil Yaşa 20 ⭐", packet_content: "20 GB  İnternet  1000 DK 250 SMS", kupur: "660", heryone_dk: 1000, yd_dk: 0, heryone_sms: 100, heryone_int: 20000 },
        { key: "turk-telekom", packet_title: "⭐Mobil Yaşa 25 ⭐", packet_content: "25 GB  İnternet  1000 DK 250 SMS", kupur: "665", heryone_dk: 1000, yd_dk: 0, heryone_sms: 100, heryone_int: 25000 },
        { key: "turk-telekom", packet_title: "⭐Mobil Yaşa 30 ⭐", packet_content: "30 GB  İnternet  1000 DK 250 SMS", kupur: "670", heryone_dk: 1000, yd_dk: 0, heryone_sms: 100, heryone_int: 30000 },
        { key: "turk-telekom", packet_title: "⭐Mobil Yaşa 40 ⭐", packet_content: "40 GB  İnternet  1000 DK 250 SMS", kupur: "675", heryone_dk: 1000, yd_dk: 0, heryone_sms: 250, heryone_int: 40000 },
        { key: "turk-telekom", packet_title: "⭐Yeni Süper 3 Ay 20 GB ⭐", packet_content: "3 Aylık 20GB +İnternet  3000 DK", kupur: "700", heryone_dk: 3000, yd_dk: 0, heryone_sms: 100, heryone_int: 20000 },
        { key: "turk-telekom", packet_title: "⭐Yeni Süper 3 Ay 30 GB⭐", packet_content: "Uzun Dönemli Paket Yeni Süper 3 Ay Paketi     30 GB  İnternet      6000 DK 5000 SMS", kupur: "705", heryone_dk: 6000, yd_dk: 0, heryone_sms: 100, heryone_int: 30000 },
        { key: "turk-telekom", packet_title: "⭐Yeni Süper 3 Ay 50 GB ⭐", packet_content: "3 Ay 50 GB  İnternet      6000 DK 5000 SMS", kupur: "710", heryone_dk: 6000, yd_dk: 0, heryone_sms: 100, heryone_int: 50000 },
        { key: "turk-telekom", packet_title: "⭐Yeni Süper 6 Ay  50 GB ⭐", packet_content: "6 Ay  50 GB  İnternet  12000 DK 10000 SMS", kupur: "715", heryone_dk: 12000, yd_dk: 0, heryone_sms: 100, heryone_int: 50000 },
        { key: "turk-telekom", packet_title: "⭐Kısa Dönemli 1 GB ⭐", packet_content: "5 günlük paket Ücretsiz BiP ve YaaY Kısa Dönemli Paketler 1 GB  İnternet  100 DK 100 SMS", kupur: "1793", heryone_dk: 0, yd_dk: 0, heryone_sms: 0, heryone_int: 0 },
        { key: "turk-telekom", packet_title: "⭐Kısa Dönemli 3 GB ⭐", packet_content: "5 günlük Ücretsiz BiP ve YaaY Kısa Dönemli Paketler 3 GB  İnternet  100 DK 100 SMS", kupur: "1794", heryone_dk: 0, yd_dk: 0, heryone_sms: 0, heryone_int: 0 },
        { key: "turk-telekom", packet_title: "⭐Kısa Dönemli 5 GB ⭐", packet_content: "10  günlük Ücretsiz BiP ve YaaY Kısa Dönemli Paketler 5 GB  İnternet  250 DK 250 SMS", kupur: "1795", heryone_dk: 0, yd_dk: 0, heryone_sms: 0, heryone_int: 0 },
        { key: "turk-telekom", packet_title: "⭐Kısa Dönemli 8 GB ⭐", packet_content: "Ücretsiz BiP ve YaaY Kısa Dönemli Paketler 8 GB  İnternet  250 DK 250 SMS", kupur: "1796", heryone_dk: 0, yd_dk: 0, heryone_sms: 0, heryone_int: 0 },
        { key: "turk-telekom", packet_title: "⭐Geniş 12 Ay 100 GB Paketi⭐", packet_content: "", kupur: "1817", heryone_dk: 0, yd_dk: 0, heryone_sms: 0, heryone_int: 0 },
        { key: "turk-telekom", packet_title: "⭐Dijital 48 GB  Avantajlı ⭐", packet_content: "", kupur: "2997", heryone_dk: 750, yd_dk: 0, heryone_sms: 250, heryone_int: 48000 },
        { key: "turk-telekom", packet_title: "⭐Dijital 36GB  Avantajlı ⭐", packet_content: "", kupur: "37333", heryone_dk: 750, yd_dk: 0, heryone_sms: 250, heryone_int: 36000 },
        { key: "turk-telekom", packet_title: "⭐Dijital 24GB  Avantajlı ⭐", packet_content: "", kupur: "37533", heryone_dk: 750, yd_dk: 0, heryone_sms: 250, heryone_int: 24000 },
      ]
    });

    return NextResponse.json({ message: "Veriler eklendi!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Veri eklenemedi", details: error }, { status: 500 });
  }
}