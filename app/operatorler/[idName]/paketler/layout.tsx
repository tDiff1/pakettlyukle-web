import { Metadata } from "next";
import "@/app/globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ idName: string }>;
}): Promise<Metadata> {
  const { idName } = await params; // params'ı asenkron çöz
  const baseUrl = "https://pakettlyukle.com";

  try {
    const res = await fetch(`${baseUrl}/api/table/operatorsadd`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return data; // veya başka bir işlem
  } catch (error) {
    console.error("Operatör alınamadı:", error);
  }

  const formattedIdName =
    typeof idName === "string"
      ? idName.charAt(0).toUpperCase() + idName.slice(1).toLowerCase()
      : "Operatör";

  return {
    title: `${formattedIdName} Paketleri`,
    description: `${formattedIdName} ile avantajlı bol paketlerle internet, konuşma ve SMS fırsatlarını keşfedin. Hemen yükleyin!`,
    metadataBase: new URL("https://pakettlyukle.com"),
    openGraph: {
      title: `${formattedIdName} Paketleri`,
      description: `${formattedIdName} ile avantajlı bol paketlerle internet, konuşma ve SMS fırsatlarını keşfedin. Hemen yükleyin!`,
      url: `https://pakettlyukle.com/operatorler/${idName}`,
      siteName: "Pakettlyukle",
      locale: "tr_TR",
      type: "website",
      images: [
        {
          url: `https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${idName}_logo.png`,
          width: 1000,
          height: 360,
          alt: `Pakettlyukle ${formattedIdName} Paketleri`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${formattedIdName} Paketleri`,
      description: `${formattedIdName} ile avantajlı bol paketlerle internet, konuşma ve SMS fırsatlarını keşfedin. Hemen yükleyin!`,
      images: [
        `https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${idName}_logo.png`,
      ],
    },
    robots: "index, follow",
    alternates: {
      canonical: `/operatorler/${idName}`,
    },
  };
}

export default function PacketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
