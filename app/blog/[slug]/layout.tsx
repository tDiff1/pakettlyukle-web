import { Metadata } from "next";
import "@/app/globals.css";

interface Blog {
  blog_title: string;
  blog_description: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params; // params'ı asenkron çöz
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://pakettlyukle.com"; // Ortam değişkeni veya varsayılan URL
  let logoUrl = "https://pakettlyukle.com/logo/logo.png";
  let blog: Blog | null = null;

  try {
    const res = await fetch(`${baseUrl}/api/blogs/slug/${slug}`, { next: { revalidate: 60 } });
    const data = await res.json();
    if (res.ok) blog = data;
  } catch (error) {
    console.error("Blog alınamadı:", error);
  }

  try {
    const res = await fetch(`${baseUrl}/api/logo-path`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data?.filePath) logoUrl = data.filePath;
  } catch (error) {
    console.error("Logo alınamadı:", error);
  }

  return {
    title: blog?.blog_title || "Blog",
    description: blog?.blog_description || "Kredi kartı ile Turkcell Vodafone Türk Telekom TL paket yükle",
    metadataBase: new URL("https://pakettlyukle.com/blog"),
    openGraph: {
      title: blog?.blog_title || "Pakettlyukle",
      description: blog?.blog_description || "Kredi kartı ile Turkcell Vodafone Türk Telekom TL paket yükle",
      url: `https://pakettlyukle.com/blog/${slug}`,
      siteName: "Pakettlyukle",
      locale: "tr_TR",
      type: "website",
      images: [{ url: logoUrl, width: 1200, height: 630, alt: "Pakettlyukle Açıklayıcı Görsel" }],
    },
    twitter: {
      card: "summary_large_image",
      title: blog?.blog_title || "Pakettlyukle",
      description: blog?.blog_description || "Kredi kartı ile Turkcell Vodafone Türk Telekom TL paket yükle",
      images: [logoUrl],
    },
    robots: "index, follow",
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}