import { Metadata } from "next";
import "@/app/globals.css";

interface SiteInfo {
  key: string;
  content: string;
}

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://pakettlyukle.com";
  let siteTitle: string = "Pakettlyukle";
  let siteDescription: string = "Pakettlyukle ile iptal-iade, KVKK, gizlilik politikası ve kullanıcı sözleşmesi hakkında detaylı bilgi edinin.";

  try {
    const res = await fetch(`${baseUrl}/api/table/siteinfo`, {
      next: { revalidate: 60 },
    });
    const data: SiteInfo[] = await res.json();
    const titleData = data.find((item) => item.key === "site_title")?.content;
    const descriptionData = data.find((item) => item.key === "hakkimizda_description")?.content;
    siteTitle = titleData || "Pakettlyukle";
    siteDescription = descriptionData || siteDescription;
  } catch (error) {
    console.error("Site bilgileri alınamadı:", error);
  }

  return {
    title: `${siteTitle} - Hakkımızda ve Yasal Bilgiler`,
    description: siteDescription,
    metadataBase: new URL("https://pakettlyukle.com"),
    openGraph: {
      title: `${siteTitle} - Hakkımızda ve Yasal Bilgiler`,
      description: siteDescription,
      url: "https://pakettlyukle.com/pakettlyukle",
      siteName: "Pakettlyukle",
      locale: "tr_TR",
      type: "article",
      images: [
        {
          url: "https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/logo.png",
          width: 1000,
          height: 360,
          alt: `${siteTitle} Yasal Bilgiler`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteTitle} - Hakkımızda ve Yasal Bilgiler`,
      description: siteDescription,
      images: ["https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/logo.png"],
    },
    robots: "index, follow",
    alternates: {
      canonical: "/pakettlyukle",
    },
  };
}

export default function PakettlyukleLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}