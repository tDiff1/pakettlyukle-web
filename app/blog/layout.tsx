import React from "react";
import "../globals.css";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  let logoUrl = "https://pakettlyukle.com/logo/logo.png"; // Fallback

  try {
    const res = await fetch("https://pakettlyukle.com/api/logo-path", {
      next: { revalidate: 60 }, // isteği önbelleğe almak istersen
    });

    const data = await res.json();
    if (data?.filePath) {
      logoUrl = data.filePath;
    }
  } catch (error) {
    console.error("Logo metadata alınamadı:", error);
  }

  return {
    title: "Blog",
    description: "Kredi kartı ile Turkcell Vodafone Türk Telekom TL paket yükle",
    metadataBase: new URL("https://pakettlyukle.com/blog"),
    openGraph: {
      title: "Pakettlyukle",
      description: "Kredi kartı ile Turkcell Vodafone Türk Telekom TL paket yükle",
      url: "https://pakettlyukle.com/blog",
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
      description: "Kredi kartı ile Turkcell Vodafone Türk Telekom TL paket yükle",
      images: [logoUrl],
    },
    robots: "index, follow",
    alternates: {
      canonical: "/",
    },
  };
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}
