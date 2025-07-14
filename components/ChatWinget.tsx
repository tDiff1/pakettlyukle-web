"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, X } from "lucide-react";

const messages = [
  "Sorun mu yaşıyorsunuz? Bizimle iletişime geçin!",
  "Her türlü sorunuz için buradayız!",
  "Destek ekibimiz size yardımcı olmaya hazır.",
  "Hızlı cevap almak için iletişime geçin!",
];

export default function FloatingContactWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isMessageVisible, setIsMessageVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) return; // Açıkken mesaj geçişi durur

    if (isMessageVisible) {
      timeoutRef.current = setTimeout(() => {
        setIsMessageVisible(false);
      }, 15000);
    } else {
      timeoutRef.current = setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setIsMessageVisible(true);
      }, 500);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isMessageVisible, isOpen, currentMessageIndex]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-1 max-w-[300px]">
      {isOpen && (
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 w-full relative overflow-hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>

          <p className="text-gray-800 font-semibold text-base mb-4">
            Sorun mu yaşıyorsunuz? Bizimle iletişime geçin!
          </p>

          <button
            onClick={() => router.push("/iletisim")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
          >
            İletişim Sayfasına Git
          </button>
        </div>
      )}

      {!isOpen && (
        <>
          {/* Mesaj kutusu - butonun hemen üstünde ve ortalanmış */}
          <div
            key={currentMessageIndex}
            className={`bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-md text-gray-800 font-semibold text-sm max-w-[300px] whitespace-normal break-words relative transition-opacity duration-700 ${
              isMessageVisible ? "opacity-100" : "opacity-0"
            }`}
            style={{ minWidth: "220px", marginRight: "8px" }} // Sağdan biraz boşluk
          >
            {messages[currentMessageIndex]}
          </div>

          {/* İletişim butonu sağ alt köşede */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="İletişim widget'ını aç"
            title="İletişim widget'ını aç"
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
}
