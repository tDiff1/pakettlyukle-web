import React from "react";
import "../globals.css";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  let logoUrl = "https://pakettlyukle.com/logo/logo.png"; // Fallback görsel

  try {
    const res = await fetch("https://pakettlyukle.com/api/logo-path", {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data?.filePath) {
      logoUrl = data.filePath;
    }
  } catch (error) {
    console.error("Logo metadata alınamadı:", error);
  }

  return {
    title: "İletişim",
    description:
      "İletişim sayfası: Sorularınız için bizimle hemen iletişime geçin. Telefon, e-posta ve form ile destek alın.",
    metadataBase: new URL("https://pakettlyukle.com/iletisim"),
    openGraph: {
      title: "İletişim",
      description:
        "İletişim sayfası: Sorularınız için bizimle hemen iletişime geçin. Telefon, e-posta ve form ile destek alın.",
      url: "https://pakettlyukle.com/iletisim",
      siteName: "Pakettlyukle",
      locale: "tr_TR",
      type: "website",
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: "Pakettlyukle İletişim Görseli",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "İletişim",
      description:
        "İletişim sayfası: Sorularınız için bizimle hemen iletişime geçin. Telefon, e-posta ve form ile destek alın.",
      images: [logoUrl],
    },
    robots: "index, follow",
    alternates: {
      canonical: "/iletisim",
    },
  };
}

export default function IletisimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
