import { Metadata } from "next";
import "@/app/globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ operator: string }>;
}): Promise<Metadata> {
  const { operator } = await params; // params'ı asenkron çöz
  const baseUrl = "https://pakettlyukle.com";

  try {
    const res = await fetch(`${baseUrl}/api/table/operatorsadd`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return data; 
  } catch (error) {
    console.error("Operatör alınamadı:", error);
  }

  const formattedOperatorName =
    typeof operator === "string"
      ? operator.charAt(0).toUpperCase() + operator.slice(1).toLowerCase()
      : "Operatör";

  return {
    title: `Kontör Yükleme - ${formattedOperatorName}`,
    description: `${formattedOperatorName} ile avantajlı bol paketlerle internet, konuşma ve SMS fırsatlarını keşfedin. Hemen yükleyin!`,
    metadataBase: new URL("https://pakettlyukle.com"),
    openGraph: {
      title: `Kontör Yükleme - ${formattedOperatorName}`,
      description: `${formattedOperatorName} ile avantajlı bol paketlerle internet, konuşma ve SMS fırsatlarını keşfedin. Hemen yükleyin!`,
      url: `https://pakettlyukle.com/kontor-yukleme/${operator}`,
      siteName: "Pakettlyukle",
      locale: "tr_TR",
      type: "website",
      images: [
        {
          url: `https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${operator}_logo.png`,
          width: 1000,
          height: 360,
          alt: `Pakettlyukle ${formattedOperatorName} Kontör Yükleme`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Kontör Yükleme - ${formattedOperatorName}`,
      description: `${formattedOperatorName} ile avantajlı bol paketlerle internet, konuşma ve SMS fırsatlarını keşfedin. Hemen yükleyin!`,
      images: [
        `https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${operator}_logo.png`,
      ],
    },
    robots: "index, follow",
    alternates: {
      canonical: `/kontor-yukleme/${operator}`,
    },
  };
}

export default function KontorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
