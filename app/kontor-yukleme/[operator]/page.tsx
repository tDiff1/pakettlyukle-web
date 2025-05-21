import Demo from "./demo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ operator: string }>;
}) {
  const { operator } = await params;

  return {
    title: `Kontör yükleme - ${operator}`,
    description: `Pakettlyukle ${operator} kontör yükleme, GSM TL ve paket yükleme platformu.`,
    openGraph: {
      title: `Kontör yükleme - ${operator}`,
      description: `Pakettlyukle ${operator} kontör yükleme, GSM TL ve paket yükleme platformu.`,
      url: `https://pakettlyukle.com/kontor-yukleme/${operator}`,
      siteName: "Pakettlyukle",
      locale: "tr_TR",
      type: "website",
      images: [
        {
          url: `https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${operator}_logo.png`, // public klasörüne koyduğun görselin yolu
          width: 1000,
          height: 360,
          alt: `Pakettlyukle ${operator} kontör yükleme`,
        },
      ],
    },
    robots: "index, follow",
    alternates: {
      canonical: `/kontor-yukleme/${operator}`,
    },
  };
}

const Page = () => {
  return (
    <div>
      <Demo />
    </div>
  );
};

export default Page;
