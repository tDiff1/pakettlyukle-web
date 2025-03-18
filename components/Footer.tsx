import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { operatorler } from '../app/tools/operatorler';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className='bg-[#a9a9a9] text-black py-8 mt-8 px-6 md:px-16 lg:px-28 no-select'>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center md:text-left">
        {/* Logo ve Ödeme Yöntemleri */}
        <div className="flex flex-col items-center md:items-start">
          <Image
            className="rounded-3xl w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36"
            src="/logo/pktyukle-by.png"
            width={140}
            height={140}
            alt="logo"
            priority
          />
          <div className="flex space-x-4 mt-3">
            <Image src="/visa.png" width={64} height={64} alt="Visa" />
            <Image src="/mastercard.png" width={64} height={64} alt="Mastercard" />
          </div>
          <p className="mt-3 text-sm">© {new Date().getFullYear()} Tüm Hakları Saklıdır | <a href="https://linktr.ee/tDiff0" className="hover:underline" target="_blank">Made by tDiff</a></p>
        </div>

        {/* Hizmetlerimiz */}
        <div>
          <h1 className='text-xl md:text-2xl font-bold mb-3'>Hizmetlerimiz</h1>
          <div className="flex flex-col space-y-2">
            {operatorler.map((operator) => (
              <Link key={operator.id} href={`/kontor-yukleme/${operator.idName}`} className="hover:underline">
                {operator.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Yasal */}
        <div>
          <Link href='/yasal' className="hover:underline"><h1 className='text-xl md:text-2xl font-bold mb-3'>Yasal</h1></Link>
          
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
          <Link href='/pakettlyukle' className="hover:underline"><h1 className='text-xl md:text-2xl font-bold mb-3'>PAKET TL YÜKLE</h1></Link>
          <div className="flex flex-col space-y-2">
            <Link href="/pakettlyukle?section=hakkimizda" className="hover:underline">Hakkımızda</Link>
            <Link href="/pakettlyukle?section=iletisim" className="hover:underline">İletişim</Link>
            <Link href="/pakettlyukle?section=e-fatura" className="hover:underline">E-fatura</Link>
            <Link href="/blog" className="hover:underline">Blog</Link>
          </div>
        </div>

        {/* Sosyal Medya */}
        <div>
          <h1 className='text-xl md:text-2xl font-bold mb-3'>Sosyal Medya</h1>
          <div className="flex space-x-4 justify-center md:justify-start">
            <a href="#" className="text-xl hover:text-gray-600"><FaFacebookF /></a>
            <a href="#" className="text-xl hover:text-gray-600"><FaInstagram /></a>
            <a href="#" className="text-xl hover:text-gray-600"><FaTwitter /></a>
            <a href="#" className="text-xl hover:text-gray-600"><FaYoutube /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
