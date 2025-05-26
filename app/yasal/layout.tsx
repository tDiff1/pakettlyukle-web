import { Metadata } from "next";
import "@/app/globals.css";

export async function generateMetadata(): Promise<Metadata> {

  return {
    title: "Yasal Bilgilendirme - Pakettlyukle",
    description: "Pakettlyukle'nin iptal-iade politikası, KVKK, gizlilik ve kullanıcı sözleşmesi hakkında tüm yasal bilgileri inceleyin.",
    metadataBase: new URL("https://pakettlyukle.com"),
    openGraph: {
      title: "Yasal Bilgilendirme - Pakettlyukle",
      description: "Pakettlyukle'nin iptal-iade politikası, KVKK, gizlilik ve kullanıcı sözleşmesi hakkında tüm yasal bilgileri inceleyin.",
      url: "https://pakettlyukle.com/yasal",
      siteName: "Pakettlyukle",
      locale: "tr_TR",
      type: "article",
      images: [
        {
          url: "https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/logo.png",
          width: 1000,
          height: 360,
          alt: "Pakettlyukle Yasal Bilgilendirme",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Yasal Bilgilendirme - Pakettlyukle",
      description: "Pakettlyukle'nin iptal-iade politikası, KVKK, gizlilik ve kullanıcı sözleşmesi hakkında tüm yasal bilgileri inceleyin.",
      images: ["https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/logo.png"],
    },
    robots: "index, follow",
    alternates: {
      canonical: "/yasal",
    },
  };
}

export default function YasalLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}