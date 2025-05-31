import { Noto_Sans } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Analytics } from "@vercel/analytics/next";
import { FaviconUpdater } from "@/components/favicon-updater";
import { Metadata } from "next";
import Script from "next/script"; // Clarity için eklendi

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  let logoUrl = "https://pakettlyukle.com/logo/logo.png"; // fallback

  try {
    const res = await fetch("https://pakettlyukle.com/api/logo-path", {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data?.filePath) {
      logoUrl = data.filePath;
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
      <head>
        {/* Microsoft Clarity Script */}
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "rs2g0cyb10");`,
          }}
        />
      </head>
      <body
        className={`${notoSans.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <FaviconUpdater />
        <LayoutWrapper>{children}</LayoutWrapper>
        <Analytics />
      </body>
    </html>
  );
}
