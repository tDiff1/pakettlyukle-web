// app/components/ClientHeader.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

type Content = {
  id: number;
  key: string;
  content: string;
};

export default function ClientHeader() {
  const pathname = usePathname() || '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/table/header')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Veri alınamadı:', err);
        setIsLoading(false);
      });
  }, []);

  const getContent = (key: string) => {
    return data.find((item) => item.key === key)?.content || 'Yükleniyor...';
  };

  function DevMessage() {
    const messages = ['https://linktr.ee/tDiff0', 'MADE BY tDiff'];
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % messages.length);
      }, 10000);
      return () => clearInterval(interval);
    }, [messages.length]);

    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <div style={{ display: 'none' }} data-dev-message>
        {messages[index]}
      </div>
    );
  }

  if (isLoading) {
    return <div></div>;
  }

  return (
    <>
      <DevMessage />
      {/* Hamburger Menu Button - Mobilde Görünecek */}
      <button
        className="sm:hidden p-2 rounded-md text-gray-800 hover:bg-gray-200 transition-all"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Menü - Mobilde Yandan Gelecek */}
      <div
        className={`fixed top-0 left-0 h-full w-3/4 max-w-[300px] bg-white shadow-lg transform ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out sm:hidden z-50`}
      >
        <button
          className="absolute top-4 right-4 p-2 text-gray-800 hover:bg-gray-200 rounded-md"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <X size={28} />
        </button>

        <nav className="flex flex-col mt-16 p-5 gap-6">
          <Link
            className={`text-lg p-2 ${
              pathname === '/' ? 'font-semibold text-gray-800 border-b-2 border-gray-800' : 'text-gray-600 hover:text-gray-800'
            }`}
            href="/"
            onClick={() => setMenuOpen(false)}
          >
            {getContent('header_title_one')}
          </Link>
          <Link
            className={`text-lg p-2 ${
              pathname === '/blog' ? 'font-semibold text-gray-800 border-b-2 border-gray-800' : 'text-gray-600 hover:text-gray-800'
            }`}
            href="/blog"
            onClick={() => setMenuOpen(false)}
          >
            {getContent('header_title_two')}
          </Link>
        </nav>
      </div>

      {/* Overlay - Menü Açıldığında Arkayı Kapatır */}
      {menuOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Menü - Büyük Ekranlarda Normal Görünüm */}
      <nav className={`hidden w-full sm:w-auto lg:w-1/2 max-w-4xl relative lg:left-5 ${menuOpen ? 'block' : 'hidden'} sm:block`}>
        <div className="flex flex-col sm:flex-row items-center justify-around gap-2 sm:gap-6 lg:gap-8 bg-white shadow-md rounded-3xl p-4 sm:p-5 ml-auto">
          <p className="relative w-full sm:w-auto text-center">
            <Link
              className={`block p-2 sm:p-3 text-base sm:text-lg lg:text-xl 
                ${
                  pathname === '/'
                    ? 'text-gray-800 font-semibold border-b-4 border-gray-800 transition-all duration-300 ease-in-out transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:scale-105 transition-all duration-300'
                }`}
              href="/"
              onClick={() => setMenuOpen(false)}
            >
              {getContent('header_title_one')}
            </Link>
          </p>
          <p className="relative w-full sm:w-auto text-center">
            <Link
              className={`block p-2 sm:p-3 text-base sm:text-lg lg:text-xl 
                ${
                  pathname === '/blog'
                    ? 'text-gray-800 font-semibold border-b-4 border-gray-800 transition-all duration-300 ease-in-out transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:scale-105 transition-all duration-300'
                }`}
              href="/blog"
              onClick={() => setMenuOpen(false)}
            >
              {getContent('header_title_two')}
            </Link>
          </p>
        </div>
      </nav>

      {/* Boş div */}
      <div className="w-full sm:w-auto hidden sm:block pl-48"></div>
    </>
  );
}