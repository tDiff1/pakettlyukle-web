import { Noto_Sans } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { FaviconUpdater } from "@/components/favicon-updater";
import { Metadata } from "next";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  let logoUrl = "https://pakettlyukle.com/logo/logo.png"; // fallback

  try {
    // Blob API'den resmi çek
    const res = await fetch("https://pakettlyukle.com/api/logo-path", {
      next: { revalidate: 60 }, // ISR için
    });
    const data = await res.json();
    if (data?.filePath) {
      logoUrl = data.filePath; // örn: https://vercel.com/...
    }
  } catch (error) {
    console.error("Logo alınamadı:", error);
  }

  return {
    title: {
      template: "%s | Pakettlyukle",
      default: "Pakettlyukle",
    },
    description:
      "Kredi kartı ile Turkcell Vodafone Türk Telekom TL paket yükle",
    metadataBase: new URL("https://pakettlyukle.com"),
    openGraph: {
      title: "Pakettlyukle",
      description:
        "Kredi kartı ile Turkcell Vodafone Türk Telekom TL paket yükle",
      url: "https://pakettlyukle.com",
      siteName: "Pakettlyukle",
      locale: "tr_TR",
      type: "website",
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: "Pakettlyukle Açıklayıcı Görsel",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Pakettlyukle",
      description:
        "Kredi kartı ile Turkcell Vodafone Türk Telekom TL paket yükle",
      images: [logoUrl],
    },
    robots: "index, follow",
    alternates: {
      canonical: "/",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <FaviconUpdater />
      <body
        className={`${notoSans.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
