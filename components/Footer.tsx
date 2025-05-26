'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Operators = {
  id: number;
  key: string;
  name: string;
  idName: string;
  imageID: string;
  hover: string;
  aktiflik: number;
};

type Footer = {
  id: number;
  key: string;
  content: string;
};

const Footer = () => {
  const [operators, setOperators] = useState<Operators[]>([]);
  const [footer, setFooter] = useState<Footer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logoPath, setLogoPath] = useState('/logo/logo.png');

  useEffect(() => {
    Promise.all([
      fetch('/api/table/operators').then((res) => res.json()),
      fetch('/api/table/footer').then((res) => res.json()),
    ])
      .then(([operatorsData, footerData]) => {
        setOperators(operatorsData.filter((op: Operators) => op.aktiflik === 1));
        setFooter(footerData);
        setIsLoading(false); // Veri yüklendiğinde loading durumunu kapat
      })
      .catch((err) => {
        console.error('Veri alınamadı:', err);
        setIsLoading(false); // Hata olsa bile yüklemeyi kapat
      });

    // Sunucudan logo yolunu al
    fetch('/api/logo-path')
      .then((res) => res.json())
      .then((data) => {
        if (data.filePath) {
          setLogoPath(data.filePath);
        }
      })
      .catch((err) => console.error('Logo yolu alınamadı:', err));
  }, []);

  // key'e göre içeriği al
  const getContent = (key: string) => {
    return footer.find((item) => item.key === key)?.content || 'Yükleniyor...';
  };
  
  function DevMessage() {
    const messages = ["https://linktr.ee/tDiff0", "MADE BY tDiff"];
    const [index, setIndex] = useState(0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % messages.length);
      }, 10000);
      return () => clearInterval(interval);
    }, [messages.length]);
  
    if (process.env.NODE_ENV !== "development") return null;
  
    return (
      <div
        style={{
          display: "none",
        }}
        data-dev-message
      >
        {messages[index]}
      </div>
    );
  }

  if (isLoading) {
    return <div></div>;
  }
  return (
<footer className="bg-[#a9a9a9] text-black py-8 mt-8 px-6 md:px-16 lg:px-28 no-select min-h-[200px]">
  <DevMessage />
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 text-center md:text-left">
    
    {/* Logo ve Ödeme Yöntemleri */}
    <div className="flex flex-col items-center md:items-start">
      <Image
              className="rounded-2xl w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28"
              src={logoPath}
              width={128}
              height={128}
              alt="logo"
              priority
      />
      <div className="flex space-x-4 mt-3">
        <Image src="https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/other-pic/visa.png" width={50} height={50} alt="Visa" />
        <Image src="https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/other-pic/mastercard.png" width={50} height={50} alt="Mastercard" />
      </div>
      <p className="mt-3 text-sm min-h-[20px]">
        © 2025 Tüm Hakları Saklıdır.
      </p>
    </div>

    {/* Hizmetlerimiz */}
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-3">{getContent('footer_title_one')}</h1>
      <div className="flex flex-col space-y-2">
        {operators.map((operator) => (
          <Link key={operator.id} href={`/kontor-yukleme/${operator.idName}`} className="hover:underline">
            {operator.name}
          </Link>
        ))}
      </div>
    </div>

    {/* Yasal */}
    <div>
      <Link href="/yasal" className="hover:underline">
        <h1 className="text-xl md:text-2xl font-bold mb-3">{getContent('footer_title_two')}</h1>
      </Link>
      <div className="flex flex-col space-y-2">
        <Link href="/yasal?section=iptal-ve-iade" className="hover:underline">İptal ve İade Koşulları</Link>
        <Link href="/yasal?section=kvkk" className="hover:underline">KVKK</Link>
        <Link href="/yasal?section=gizlilik-politikasi" className="hover:underline">Gizlilik Politikası</Link>
        <Link href="/yasal?section=kullanici-sozlesmesi" className="hover:underline">Kullanıcı Sözleşmesi</Link>
        <Link href="/yasal?section=ucretler-ve-limitler" className="hover:underline">Ücretler ve Limitler</Link>
      </div>
    </div>

    {/* Şirket Bilgileri */}
    <div>
      <Link href="/pakettlyukle" className="hover:underline">
        <h1 className="text-xl md:text-2xl font-bold mb-3">{getContent('footer_title_three')}</h1>
      </Link>
      <div className="flex flex-col space-y-2">
        <Link href="/pakettlyukle?section=hakkimizda" className="hover:underline">Hakkımızda</Link>
        <Link href="/pakettlyukle?section=iletisim" className="hover:underline">İletişim</Link>
        <Link href="/pakettlyukle?section=e-fatura" className="hover:underline">E-fatura</Link>
        <Link href="/blog" className="hover:underline">Blog</Link>
      </div>
    </div>
  </div>
</footer>
  );
};

export default Footer;
