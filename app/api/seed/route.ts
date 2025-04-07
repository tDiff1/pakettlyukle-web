import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    await prisma.packets.createMany({
      data: [
        { key: "vodafone", packet_title: "⭐Tüm Dünya 1 Saat⭐", packet_content: "1 Saat Tüm Dünya Arama Paketi", kupur: "26", heryone_dk: 0, yd_dk: 60, heryone_sms: 0, heryone_int: 0 },
        { key: "vodafone", packet_title: "⭐Tüm Dünya 2 Saat⭐", packet_content: "2 Saat Tüm Dünya Arama Paketi", kupur: "27", heryone_dk: 0, yd_dk: 120, heryone_sms: 0, heryone_int: 0 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 12⭐", packet_content: "12GB, 750 DK, 1000 SMS, 28 Gün Geçerli, Vergi Dahil", kupur: "110", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 12288 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 7⭐", packet_content: "7GB, 750DK, 1000SMS, 28 Gün Geçerli", kupur: "130", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 7168 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 10⭐", packet_content: "10GB, 750DK, 1000SMS, 28 Gün Geçerli", kupur: "131", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 10240 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 15⭐", packet_content: "15GB, 750DK, 1000SMS, 28 Gün Geçerli", kupur: "133", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 15340 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 5⭐", packet_content: "5GB, 750DK, 1000SMS, 28 Gün Geçerli", kupur: "147", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 5120 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 25⭐", packet_content: "25GB, 750DK, 1000SMS, 28 Gün Geçerli", kupur: "1000", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 25600 },
        { key: "vodafone", packet_title: "Haftalık 500 DK", packet_content: "Haftalık 500 DK Konuşma Paketi", kupur: "4780", heryone_dk: 500, yd_dk: 0, heryone_sms: 0, heryone_int: 0 },
        { key: "vodafone", packet_title: "84TL Telsiz Kul, Ücr, Paketi 2GB", packet_content: "14 gün geçerli 2 GB internet ve 56 TL telsiz kullanım ücreti ", kupur: "7353", heryone_dk: 0, yd_dk: 0, heryone_sms: 0, heryone_int: 2048 },
        { key: "vodafone", packet_title: "126TL Telsiz Kul, Ücr, Paketi 3GB", packet_content: "14 gün geçerli 3 GB internet ve 126 TL telsiz kullanım ücreti ", kupur: "7354", heryone_dk: 0, yd_dk: 0, heryone_sms: 0, heryone_int: 3072 },
        { key: "vodafone", packet_title: "168TL Telsiz Kul, Ücr, Paketi 4GB", packet_content: "14 gün geçerli 4 GB internet ve 168 TL telsiz kullanım ücreti ", kupur: "7355", heryone_dk: 0, yd_dk: 0, heryone_sms: 0, heryone_int: 4096 },
        { key: "vodafone", packet_title: "42TL Telsiz Kul, Ücr, Paketi 1GB", packet_content: "14 gün geçerli 1 GB internet ve 42 TL telsiz kullanım ücreti ", kupur: "8703", heryone_dk: 0, yd_dk: 0, heryone_sms: 0, heryone_int: 1024 },
        { key: "vodafone", packet_title: "Yurt Dışı Kolay Paket", packet_content: "2GB,200DK, 1000SMS, 28 Gün Geçerli, Vergi Dahil", kupur: "14179", heryone_dk: 2000, yd_dk: 0, heryone_sms: 100, heryone_int: 2048 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 3 Ay 45⭐", packet_content: "45GB, Heryöne 5000DK, 1000SMS, 3 ay geçerli, Vergi Dahil", kupur: "13478", heryone_dk: 5000, yd_dk: 0, heryone_sms: 100, heryone_int: 46080 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 3 Ay 30⭐", packet_content: "30GB, Heryöne 5000DK, 1000SMS, 3 ay geçerli, Vergi Dahil", kupur: "14180", heryone_dk: 5000, yd_dk: 0, heryone_sms: 100, heryone_int: 30720 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 6 Ay 60⭐", packet_content: "60GB, Heryöne 10000DK, 5000SMS, 6 ay geçerli, Vergi Dahil", kupur: "14181", heryone_dk: 10000, yd_dk: 0, heryone_sms: 5000, heryone_int: 61440 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 30", packet_content: "30GB, 750DK, 1000SMS, 28 Gün Geçerli", kupur: "14697", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 30720 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 60⭐", packet_content: "60GB, 750DK, 1000SMS, 28 Gün Geçerli", kupur: "14698", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 61440 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 3⭐", packet_content: "3GB, 750DK, 1000SMS, 28 Gün Geçerli", kupur: "14699", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 3072 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 1500 DK⭐", packet_content: "1500 DK içerik konuşma olarak kullanılır, 250 SMS içerir ve devlete ödenmesi gereken Telsiz Kullanım Ücreti dahildir,", kupur: "14919", heryone_dk: 1500, yd_dk: 0, heryone_sms: 100, heryone_int: 0 },
        { key: "vodafone", packet_title: "⭐Kolay Paket 3000 DK⭐", packet_content: "3000 DK içerik konuşma olarak kullanılır, 500 SMS içerir ve devlete ödenmesi gereken Telsiz Kullanım Ücreti dahildir,", kupur: "14920", heryone_dk: 3000, yd_dk: 0, heryone_sms: 100, heryone_int: 0 },
        { key: "vodafone", packet_title: "⭐40GB,750DK,250SMS⭐", packet_content: "Tam Senlik 40 GB, 750 DK, 250 SMS, 28 Gün geçerli, Vergi Dahil", kupur: "14969", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 40960 },
        { key: "vodafone", packet_title: "⭐20GB,750DK,250SMS⭐", packet_content: "Tam Senlik 20 GB, 750 DK, 250 SMS, 28 Gün geçerli, Vergi Dahil", kupur: "15128", heryone_dk: 750, yd_dk: 0, heryone_sms: 100, heryone_int: 20480 },
      ]
    });

    return NextResponse.json({ message: "Veriler eklendi!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Veri eklenemedi", details: error }, { status: 500 });
  }
}