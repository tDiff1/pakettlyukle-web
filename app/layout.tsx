import { Noto_Sans } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { FaviconUpdater } from "@/components/favicon-updater";
import { Metadata } from "next";
import Script from "next/script";

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
        {/* Google Tag Manager script */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-K3HW27ZP');
            `,
          }}
        />

        {/* Microsoft Clarity */}
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

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17209968145"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17209968145');
            `,
          }}
        />
        <Script
          id="gtag-event"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              gtag('event', 'conversion', {
                'send_to': 'AW-17209968145/IMZ3COmzjd8aEJGMrY5A',
                'value': 1.0,
                'currency': 'TRY'
              });
            `,
          }}
        />
      </head>
      <body
        className={`${notoSans.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        {/* Google Tag Manager noscript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K3HW27ZP"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        <FaviconUpdater />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}