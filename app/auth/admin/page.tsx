"use client";
import React, { useState, useEffect } from "react";
import FaviconUploader from "@/components/FaviconUploader";
import LogoUploader from "@/components/LogoUploader";
import PageEdit from "@/components/PageEdit";
import OperatorsEdit from "@/components/OperatorsEdit";
import OperatorsPackets from "@/components/OperatorsPackets";
import PaymentsPage from "@/components/PaymentsPage";
import BlogeEditPage from "@/components/BlogEditPage";
import SmsRecipientsManager from "@/components/SmsRecipientsManager";

type AdminInfo = {
  id: number;
  user_name: string;
  phone: string;
};

const pages = [
  "Ana Sayfa",
  "Sayfa Düzenleme",
  "Operator Düzenleme",
  "Paket Düzenleme",
  "Blog Düzenleme",
  "Satışlar",
];

const AdminPage = () => {
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [activePage, setActivePage] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);
  const [data, setData] = useState<AdminInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transitionClass, setTransitionClass] = useState("opacity-0 translate-y-5");
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Hamburger menü durumu

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const authTimestamp = localStorage.getItem("authTimestamp");
    const savedPage = localStorage.getItem("activePage");

    if (authToken && authTimestamp) {
      const timeElapsed = Date.now() - parseInt(authTimestamp, 10);
      const thirtyMinutes = 120 * 60 * 1000;
      if (timeElapsed < thirtyMinutes) {
        setIsAuthenticated(true);
        const user = localStorage.getItem("authenticatedUser");
        setAuthenticatedUser(user);
        setIsOtpSent(true);
        setTimeLeft(thirtyMinutes - timeElapsed);
      } else {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authTimestamp");
        localStorage.removeItem("authenticatedUser");
        setIsAuthenticated(false);
        setIsOtpSent(false);
      }
    }

    if (savedPage) {
      setActivePage(parseInt(savedPage, 10));
    }

    fetch("/api/table/admininfo")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Veri alınamadı:", err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("activePage", activePage.toString());
  }, [activePage]);

  useEffect(() => {
    setTransitionClass("opacity-0 translate-y-5");
    const timeout = setTimeout(() => {
      setTransitionClass("opacity-100 translate-y-0");
    }, 100);
    return () => clearTimeout(timeout);
  }, [activePage]);

  useEffect(() => {
    if (isAuthenticated && timeLeft !== null) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1000) {
            clearInterval(timer);
            localStorage.removeItem("authToken");
            localStorage.removeItem("authTimestamp");
            localStorage.removeItem("authenticatedUser");
            setIsAuthenticated(false);
            setIsOtpSent(false);
            setAuthenticatedUser(null);
            return null;
          }
          return prev - 1000;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated, timeLeft]);

  const formatTimeLeft = (ms: number | null) => {
    if (ms === null) return "00:00:00";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^5\d{9}$/.test(phone)) {
      setError("Telefon numarası 5xxxxxxxxx formatında olmalı!");
      return;
    }

    const user = data.find((admin) => admin.phone === phone);
    if (!user) {
      setError("Telefon numarası sistemde kayıtlı değil!");
      return;
    }

    try {
      const response = await fetch("/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();
      if (response.ok) {
        setIsOtpSent(true);
        setAuthenticatedUser(user.user_name);
      } else {
        setError(result.error || "SMS gönderimi başarısız.");
      }
    } catch (err) {
      console.error("[handlePhoneSubmit] SMS gönderim hatası:", err);
      setError("SMS gönderimi başarısız. Lütfen tekrar deneyin.");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedOtp = otpCode.trim();
    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError("OTP 6 haneli bir sayı olmalı!");
      return;
    }

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: trimmedOtp }),
      });

      const result = await response.json();
      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("authTimestamp", Date.now().toString());
        localStorage.setItem("authenticatedUser", authenticatedUser || "");
        setTimeLeft(120 * 60 * 1000);
      } else {
        setError(result.error || "Hatalı OTP kodu!");
      }
    } catch (err) {
      console.error("OTP doğrulama hatası:", err);
      setError("OTP doğrulama başarısız. Lütfen tekrar deneyin.");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen pt-10 relative">
        <div className="absolute top-4 right-4 md:right-13 text-lg font-semibold text-red-500">
          Kalan Süre: {formatTimeLeft(timeLeft)}
        </div>
        <div className="flex flex-col md:flex-row w-full h-auto md:h-[1100px]">
          {/* Hamburger Menü Butonu (Mobil için) */}
          <div className="md:hidden flex items-center justify-between p-4 bg-gray-100">
            <h1 className="text-xl font-semibold">Hoş Geldin {authenticatedUser}</h1>
            <button onClick={toggleMenu} className="text-2xl">
              {isMenuOpen ? "✖" : "☰"}
            </button>
          </div>
          {/* Menü (Mobil: Hamburger, Masaüstü: Sidebar) */}
          <div
            className={`${
              isMenuOpen ? "block" : "hidden"
            } md:block w-full md:w-1/5 bg-gray-100 md:bg-transparent p-4 md:ml-5 space-y-3 md:flex-col md:items-center md:justify-center transition-all`}
          >
            <h1 className="hidden md:block text-3xl bg-gray-100 p-5 font-semibold mb-6 rounded-3xl">
              Hoş Geldin {authenticatedUser}
            </h1>
            {pages.map((pageName, index) => (
              <button
                key={index}
                className={`w-full text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded-3xl py-4 px-6 text-center ${
                  activePage === index ? "ring-2 ring-black" : ""
                }`}
                onClick={() => {
                  setActivePage(index);
                  setIsMenuOpen(false); // Mobil menüyü kapat
                }}
              >
                {pageName}
              </button>
            ))}
          </div>
          <div
            className={`bg-white w-full md:w-3/4 rounded-3xl shadow-lg p-5 md:ml-5 transition-all duration-500 ease-in-out ${transitionClass} overflow-y-auto max-h-[1000px]`}
          >
            {activePage === 0 && (
              <div>
                <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-5 mt-10">
                  <LogoUploader />
                  <FaviconUploader />
                </div>
                <div className="mt-10">
                  <SmsRecipientsManager />
                </div>
              </div>
            )}
            {activePage === 1 && <PageEdit />}
            {activePage === 2 && <OperatorsEdit />}
            {activePage === 3 && <OperatorsPackets />}
            {activePage === 4 && <BlogeEditPage />}
            {activePage === 5 && <PaymentsPage />}
          </div>
        </div>
      </div>
    );
  }


return (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
    {!isOtpSent ? (
      <form
        onSubmit={handlePhoneSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Telefon Numaranızı Giriniz
        </h2>
        <input
          type="text"
          value={phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ''); // Sadece sayıları tut
            setPhone(value);
          }}
          placeholder="Telefon numaranızı giriniz (5xxxxxxxxx)"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          inputMode="numeric" // Mobil cihazlarda sayısal klavyeyi teşvik eder
          maxLength={10} // 10 haneli telefon numarası için sınır
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300"
        >
          Doğrulama Kodu Gönder
        </button>
      </form>
    ) : (
      <form
        onSubmit={handleOtpSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          SMS Doğrulama Kodunu Giriniz
        </h2>
        <input
          type="text"
          value={otpCode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ''); // Sadece sayıları tut
            setOtpCode(value);
          }}
          placeholder="6 haneli kodu giriniz"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          inputMode="numeric" // Mobil cihazlarda sayısal klavyeyi teşvik eder
          maxLength={6} // 6 haneli OTP için sınır
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300"
        >
          Kodu Doğrula
        </button>
      </form>
    )}
  </div>
);
};

export default AdminPage;