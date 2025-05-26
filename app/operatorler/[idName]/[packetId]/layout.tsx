import { Metadata } from "next";
import "@/app/globals.css";
import slugify from "slugify";

interface Packet {
  key: string;
  packet_title: string;
  packet_content: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ idName: string; packetId: string }>;
}): Promise<Metadata> {
  const { idName, packetId } = await params; // params'ı asenkron çöz
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://pakettlyukle.com";
  let packet: Packet | null = null;

  try {
    const res = await fetch(`${baseUrl}/api/table/packets`, { next: { revalidate: 60 } });
    const packetsData = await res.json();
    packet = packetsData.find(
      (p: Packet) =>
        p.key === idName &&
        slugify(p.packet_title, { lower: true, strict: true }) === packetId.toLowerCase()
    );
  } catch (error) {
    console.error("Paket alınamadı:", error);
  }

  const formattedIdName =
    typeof idName === "string"
      ? idName.charAt(0).toUpperCase() + idName.slice(1).toLowerCase()
      : "Operatör";

  return {
    title: packet?.packet_title ? `${formattedIdName} - ${packet.packet_title}` : "Paket Yükleme",
    description: packet?.packet_content || "Kredi kartı ile Turkcell Vodafone Türk Telekom TL paket yükle",
    metadataBase: new URL("https://pakettlyukle.com"),
    openGraph: {
      title: packet?.packet_title ? `${formattedIdName} - ${packet.packet_title}` : "Paket Yükleme",
      description: packet?.packet_content || "Kredi kartı ile Turkcell Vodafone Türk Telekom TL paket yükle",
      url: `https://pakettlyukle.com/kontor-yukleme/${idName}/${packetId}`,
      siteName: "Pakettlyukle",
      locale: "tr_TR",
      type: "website",
      images: [
        {
          url: `https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${idName}_logo.png`,
          width: 1000,
          height: 360,
          alt: `Pakettlyukle ${formattedIdName} paket yükleme`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: packet?.packet_title ? `${formattedIdName} - ${packet.packet_title}` : "Paket Yükleme",
      description: packet?.packet_content || "Kredi kartı ile Turkcell Vodafone Türk Telekom TL paket yükle",
      images: [`https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${idName}_logo.png`],
    },
    robots: "index, follow",
    alternates: {
      canonical: `/kontor-yukleme/${idName}/${packetId}`,
    },
  };
}

export default function PacketLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}