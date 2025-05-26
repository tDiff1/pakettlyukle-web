import { Metadata } from "next";
import "@/app/globals.css";

export async function generateMetadata(): Promise<Metadata> {

  return {
    title: "Operatör Paketleri",
    description: "Turkcell, Vodafone, Türk Telekom ile avantajlı internet, konuşma ve SMS paketlerini keşfedin. Hemen yükleyin!",
    metadataBase: new URL("https://pakettlyukle.com"),
    openGraph: {
      title: "Operatör Paketleri",
      description: "Turkcell, Vodafone, Türk Telekom ile avantajlı internet, konuşma ve SMS paketlerini keşfedin. Hemen yükleyin!",
      url: "https://pakettlyukle.com/operatorler",
      siteName: "Pakettlyukle",
      locale: "tr_TR",
      type: "website",
      images: [
        {
          url: "https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/logo.png",
          width: 1000,
          height: 360,
          alt: "Pakettlyukle Operatör Paketleri",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Operatör Paketleri",
      description: "Turkcell, Vodafone, Türk Telekom ile avantajlı internet, konuşma ve SMS paketlerini keşfedin. Hemen yükleyin!",
      images: ["https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/logo.png"],
    },
    robots: "index, follow",
    alternates: {
      canonical: "/operatorler",
    },
  };
}

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}