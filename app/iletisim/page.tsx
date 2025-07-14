"use client";

import React, { useState, useEffect } from "react";

function formatTimeLeft(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours} saat ${minutes} dakika sonra deneyin.`;
  if (minutes > 0) return `${minutes} dakika sonra deneyin.`;
  return `${seconds} saniye sonra deneyin.`;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "", // sadece 10 hane girilecek (0 hariç)
    loadedNumber: "",   // sadece 10 hane girilecek (0 hariç)
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [showTimeoutPopup, setShowTimeoutPopup] = useState(false);
  const [timeLeftMsg, setTimeLeftMsg] = useState("");

  // Form gönderim sonrası localStorage anahtarı
  const TIMEOUT_KEY = "contact_form_timeout";

  // Form gönderim kontrolü
  useEffect(() => {
    const timeoutTimestamp = localStorage.getItem(TIMEOUT_KEY);
    if (timeoutTimestamp) {
      const now = Date.now();
      const expiry = parseInt(timeoutTimestamp, 10);
      if (expiry > now) {
        // Süre kaldıysa popup göster
        const diff = expiry - now;
        setTimeLeftMsg(formatTimeLeft(diff));
        setShowTimeoutPopup(true);
      } else {
        // Süre geçmişse kaldır
        localStorage.removeItem(TIMEOUT_KEY);
      }
    }
  }, []);

  // Input değişimi, 0 olmadan sadece 10 hane
  const handlePhoneChange = (field: "contactNumber" | "loadedNumber", value: string) => {
    // Sadece rakam al, 10 haneye kes
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, [field]: digits }));
  };

  // Diğer input değişimi
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return; // Çoklu submit engelle

    // Timeout varsa gönderme
    const timeoutTimestamp = localStorage.getItem(TIMEOUT_KEY);
    if (timeoutTimestamp) {
      const now = Date.now();
      const expiry = parseInt(timeoutTimestamp, 10);
      if (expiry > now) {
        const diff = expiry - now;
        setTimeLeftMsg(formatTimeLeft(diff));
        setShowTimeoutPopup(true);
        return;
      } else {
        localStorage.removeItem(TIMEOUT_KEY);
      }
    }

    // Validasyonlar
    if (formData.fullName.trim().length < 3) {
      alert("Ad Soyad en az 3 harf olmalıdır.");
      return;
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      alert("Geçerli bir e-posta adresi giriniz.");
      return;
    }

    if (formData.contactNumber.length !== 10) {
      alert("Lütfen geçerli bir iletişim numarası giriniz (başında 0 olmadan 10 haneli).");
      return;
    }

    if (formData.loadedNumber.length !== 10) {
      alert("Lütfen geçerli bir yükleme yapılan numara giriniz (başında 0 olmadan 10 haneli).");
      return;
    }

    if (formData.message.trim().length < 10) {
      alert("Lütfen sorununuzu daha detaylı açıklayın (min 10 karakter).");
      return;
    }

    setLoading(true);

    try {
      // contactPhone ve loadedNumber başına 0 ekleniyor, SMS gönderimi backend tarafında 0 kontrolü var, gerekirse orada da ayarla
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          contactPhone: "0" + formData.contactNumber,
          loadedNumber: "0" + formData.loadedNumber,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Başarılı gönderim sonrası 2 saat timeout ayarla
        const expireAt = Date.now() + 2 * 60 * 60 * 1000; // 2 saat ms cinsinden
        localStorage.setItem(TIMEOUT_KEY, expireAt.toString());

        setShowTimeoutPopup(true);
        setTimeLeftMsg("Form başarıyla gönderildi. 2 saat içinde tekrar gönderim yapamazsınız.");

        setFormData({
          fullName: "",
          email: "",
          contactNumber: "",
          loadedNumber: "",
          message: "",
        });
      } else {
        alert("Gönderim sırasında hata oluştu: " + data.error);
      }
    } catch (error) {
      alert("Sunucu hatası. Lütfen tekrar deneyiniz.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Popup component
const Popup = ({
  message,
  onClose,
  isSuccess = false,
}: {
  message: string;
  onClose: () => void;
  isSuccess?: boolean;
}) => (
  <div
    className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-30 backdrop-blur-md transition-opacity duration-300"
    onClick={onClose}
  >
    <div
      className={`bg-white rounded-xl p-6 max-w-sm w-full shadow-lg text-center transform transition-transform duration-300 ease-out
      ${isSuccess ? "border-green-500 border-2" : "border-red-500 border-2"}`}
      onClick={(e) => e.stopPropagation()}
      style={{ animation: "popupFadeIn 0.3s ease forwards" }}
    >
      <p className={`mb-6 text-lg ${isSuccess ? "text-green-600" : "text-red-600"}`}>
        {message}
      </p>
      <button
        className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        onClick={onClose}
      >
        Anladım
      </button>
    </div>

    <style jsx>{`
      @keyframes popupFadeIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `}</style>
  </div>
);


  return (
    <>
      {showTimeoutPopup && (
        <Popup
          message={timeLeftMsg}
          onClose={() => setShowTimeoutPopup(false)}
          isSuccess={timeLeftMsg.startsWith("Form başarıyla")}
        />
      )}

      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
            İletişim Formu
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Ad Soyad */}
            <div className="col-span-1">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Ad Soyad
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                minLength={3}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Adınızı ve soyadınızı girin"
              />
            </div>

            {/* E-posta (Opsiyonel) */}
            <div className="col-span-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-posta (Opsiyonel)
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="ornek@mail.com"
              />
            </div>

            {/* Size Ulaşabileceğimiz Numara */}
            <div className="col-span-1 relative">
              <label
                htmlFor="contactNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Size Ulaşabileceğimiz Numara
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-100 text-gray-600 select-none">
                  0
                </span>
                <input
                  type="tel"
                  name="contactNumber"
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    handlePhoneChange("contactNumber", e.target.value)
                  }
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="5XXXXXXXXX"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-r-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Yükleme Yapılan Numara */}
            <div className="col-span-1 relative">
              <label
                htmlFor="loadedNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Yükleme Yapılan Numara
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-100 text-gray-600 select-none">
                  0
                </span>
                <input
                  type="tel"
                  name="loadedNumber"
                  id="loadedNumber"
                  value={formData.loadedNumber}
                  onChange={(e) =>
                    handlePhoneChange("loadedNumber", e.target.value)
                  }
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="5XXXXXXXXX"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-r-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Detaylı Açıklama */}
            <div className="col-span-1 md:col-span-2">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Detaylı Açıklama
              </label>
              <textarea
                name="message"
                id="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Sorununuzu detaylıca yazınız..."
              />
            </div>

            {/* Gönder Butonu */}
            <div className="col-span-1 md:col-span-2 text-center">
              <button
                type="submit"
                disabled={loading}
                className="inline-block bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-md"
              >
                {loading ? "Gönderiliyor..." : "Gönder"}
              </button>
            </div>
          </form>

          {/* İletişim Bilgileri */}
          <div className="mt-12 border-t pt-6 text-center text-sm text-gray-500 space-y-2">
            <p>
              <strong>Telefon:</strong>{" "}
              <a
                href="tel:+908503095571"
                className="text-blue-600 hover:underline"
              >
                +90 850 309 55 71
              </a>
            </p>
            <p>
              <strong>E-posta:</strong>{" "}
              <a
                href="mailto:destek@ttelekom.com.tr"
                className="text-blue-600 hover:underline"
              >
                destek@ttelekom.com.tr
              </a>
            </p>
            <p>
              <strong>Adres:</strong> İzmir, Türkiye
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
