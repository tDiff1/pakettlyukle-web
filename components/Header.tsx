'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const Header = () => {
  const pathname = usePathname() || '/';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href={'/'}>
            <Image
              className="rounded-3xl w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36"
              src='/logo/pktyukle-by.png'
              width={140}
              height={140}
              alt='logo'
              priority
            />
          </Link>
        </div>

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
          className={`fixed top-0 left-0 h-full w-3/4 max-w-[300px] bg-white shadow-lg transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out sm:hidden z-50`}
        >
          <button
            className="absolute top-4 right-4 p-2 text-gray-800 hover:bg-gray-200 rounded-md"
            onClick={() => setMenuOpen(false)}
          >
            <X size={28} />
          </button>

          <nav className="flex flex-col mt-16 p-5 gap-6">
          <Link
              className={`text-lg p-2 ${pathname === '/' ? 'font-semibold text-gray-800 border-b-2 border-gray-800' : 'text-gray-600 hover:text-gray-800'}`}
              href='/'
              onClick={() => setMenuOpen(false)}
            >
              Kontör Yükleme
            </Link>
            <Link
              className={`text-lg p-2 ${pathname === '/blog' ? 'font-semibold text-gray-800 border-b-2 border-gray-800' : 'text-gray-600 hover:text-gray-800'}`}
              href='/blog'
              onClick={() => setMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              className={`text-lg p-2 ${pathname === '/kurumsal' ? 'font-semibold text-gray-800 border-b-2 border-gray-800' : 'text-gray-600 hover:text-gray-800'}`}
              href='/kurumsal'
              onClick={() => setMenuOpen(false)}
            >
              Kurumsal
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
                ${pathname === '/'
                    ? 'text-gray-800 font-semibold border-b-4 border-gray-800 transition-all duration-300 ease-in-out transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:scale-105 transition-all duration-300'}`}
                href='/'
                onClick={() => setMenuOpen(false)}
              >
                Kontör Yükleme
              </Link>
            </p>
            <p className="relative w-full sm:w-auto text-center">
              <Link
                className={`block p-2 sm:p-3 text-base sm:text-lg lg:text-xl 
                ${pathname === '/blog'
                    ? 'text-gray-800 font-semibold border-b-4 border-gray-800 transition-all duration-300 ease-in-out transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:scale-105 transition-all duration-300'}`}
                href='/blog'
                onClick={() => setMenuOpen(false)}
              >
                Blog
              </Link>
            </p>
            <p className="relative w-full sm:w-auto text-center">
              <Link
                className={`block p-2 sm:p-3 text-base sm:text-lg lg:text-xl 
                ${pathname === '/kurumsal'
                    ? 'text-gray-800 font-semibold border-b-4 border-gray-800 transition-all duration-300 ease-in-out transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:scale-105 transition-all duration-300'}`}
                href='/kurumsal'
                onClick={() => setMenuOpen(false)}
              >
                Kurumsal
              </Link>
            </p>
          </div>
        </nav>
        
        {/* bos div */}
        <div className={`w-full sm:w-auto hidden sm:block pl-48`}></div>
      </div>
    </header>
  )
}

export default Header