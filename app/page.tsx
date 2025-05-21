"use client";

import Image from "next/image";
import "react-multi-carousel/lib/styles.css";
import MyCarousel from "@/app/tools/op-carusel/operators";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "./loading";

type Content = {
  id: number;
  key: string;
  content: string;
};

type Faq = {
  id: number;
  key: string;
  question: string;
  answer: string;
};

type Operators = {
  id: number;
  key: string;
  name: string;
  idName: string;
  imageID: string;
  hover: string;
  aktiflik: number;
};

export default function Home() {
  const [data, setData] = useState<Content[]>([]);
  const [operators, setOperators] = useState<Operators[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   fetch("/api/table/home")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setData(data);
  //       setIsLoading(false); // Veri yüklendiğinde loading durumunu kapat
  //     })
  //     .catch((err) => {
  //       console.error("Veri alınamadı:", err)
  //       setIsLoading(false); // Hata olsa bile yüklemeyi kapat
  //     });
  // }, []);

  // useEffect(() => {
  //   fetch("/api/table/faq")
  //     .then((res) => res.json())
  //     .then((data) => setFaqs(data)) // Gelen veriyi doğru şekilde state'e kaydediyoruz
  //     .catch((err) => console.error("Veri alınamadı:", err));
  // }, []);

  // useEffect(() => {
  //   fetch("/api/table/operators")
  //     .then((res) => res.json())
  //     .then((data) => setOperators(data))
  //     .catch((err) => console.error("Veri alınamadı:", err));
  // }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/table/home").then((res) => res.json()),
      fetch("/api/table/faq").then((res) => res.json()),
      fetch("/api/table/operators").then((res) => res.json()),
    ])
      .then(([homeData, faqData, operatorsData]) => {
        setData(homeData);
        setFaqs(faqData);
        setOperators(
          operatorsData.filter((op: Operators) => op.aktiflik === 1)
        );
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Veri alınamadı:", err);
        setIsLoading(false); // Hata olsa bile yüklenmeyi kapat
      });
  }, []);

  // key'e göre içeriği al
  const getContent = (key: string) => {
    return data.find((item) => item.key === key)?.content || "Yükleniyor...";
  };

  // Şu anda açık olan sorunun index'ini tutan state
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Soruyu tıkladığında hangi index'in açılacağını belirler
  const toggleQuestion = (index: number) => {
    // Eğer tıklanan soru zaten açıksa, onu kapat
    setOpenIndex(openIndex === index ? null : index);
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
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden transition-all duration-300">
      <DevMessage />
      <div className="flex flex-col items-center p-2 sm:p-4 md:p-10 no-select m h-auto ">
        {/* Masaüstü ve Tablet */}
        <div className="hidden md:block">
          {/* Ana İçerik */}
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-3xl shadow-md w-full max-w-4xl flex flex-col sm:flex-row items-center justify-start gap-4 sm:gap-6">
            {/* Masaüstü için Tower Görseli */}
            <div className="flex-shrink-0 w-[60px] h-[60px]">
              <Image
                src="https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/other-pic/tower.png"
                width={60}
                height={60}
                alt="tower logo"
              />
            </div>

            <div className="text-center relative lg:left-14 sm:text-left min-h-[100px]">
              <h2
                id="home_title"
                className="text-lg sm:text-xl md:text-2xl font-semibold leading-tight break-words"
              >
                {getContent("paket_title")}
              </h2>
              <hr className="my-2 sm:my-3 border-gray-400" />
              <p
                id="home_content"
                className="font-bold text-center text-xs sm:text-sm md:text-base leading-snug break-words"
              >
                {getContent("paket_explanation")}
              </p>
            </div>
          </div>

          {/* Adım Listesi */}
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-3xl shadow-md my-4 sm:my-6 md:my-10 w-full max-w-4xl">
            <h2 className="text-2xl font-semibold text-center">
              {getContent("step_title")}
            </h2>
            <hr className=" w-1/2 mx-auto my-2 sm:my-3 border-gray-400 pb-2" />
            <div className="grid lg:grid-cols-4 gap-2 sm:gap-3">
              {[
                `${getContent("step_one")}`,
                `${getContent("step_two")}`,
                `${getContent("step_three")}`,
                `${getContent("step_four")}`,
              ].map((step, index) => (
                <div
                  key={index}
                  className="bg-[#e5e5e6] text-black p-2 sm:p-3 rounded-xl font-medium flex items-center gap-2"
                >
                  <span className="font-semibold text-black text-xl sm:text-2xl md:text-4xl">
                    {index + 1}.
                  </span>

                  <p className="text-xs sm:text-sm md:text-base relative lg:top-2 leading-snug break-words">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Operatör Seçimi */}
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-3xl shadow-md my-4 sm:my-5 w-full max-w-4xl">
            <MyCarousel />
          </div>

          {/* Sıkça Sorulan Sorular */}
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-3xl shadow-md my-4 sm:my-5 w-full max-w-4xl">
            <h2 className=" sm:text-base md:text-lg  lg:text-xl font-semibold mb-2 sm:mb-3">
              {getContent("faq_title")}
            </h2>
            <div className="space-y-2 ">
              {faqs.map((item, index: number) => (
                <div key={index} className="w-full">
                  <div
                    className="bg-[#e5e5e6]  rounded-xl p-2 sm:p-3  font-medium flex items-center gap-2 cursor-pointer no-select"
                    onClick={() => toggleQuestion(index)}
                  >
                    <span className="font-bold text-black text-xl sm:text-2xl md:text-4xl">
                      {index + 1}
                    </span>
                    <h2 className="text-xs sm:text-sm md:text-base leading-snug break-words">
                      {item.question}
                    </h2>

                    <span className="ml-auto">
                      {openIndex === index ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </span>
                  </div>
                  <p
                    className={`collapsible-content ${
                      openIndex === index ? "expanded" : ""
                    }`}
                  >
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Telefon */}
      <div className="block md:hidden">
        <div className="flex flex-col items-center p-4 sm:p-6 md:p-10 lg:p-16 no-select">
          {/* Başlık: Bildirim İkonu ve Operatör Bilgisi */}
          <div className="flex items-center justify-between w-full max-w-6xl bg-white p-6 rounded-3xl shadow-md">
            {/* Bildirim İkonu ve Yazı Alanı */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between">
              <div className="w-[60px] h-[60px] flex-shrink-0">
                <Image
                  src={
                    "https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/other-pic/notification.png"
                  }
                  alt="Bildirim"
                  width={60}
                  height={60}
                  className="block"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center w-full text-center md:text-left">
                <h1 className="font-semibold text-lg md:text-xl leading-tight break-words">
                  {getContent("paket_title")}
                </h1>
                <p className="text-sm md:text-base leading-snug break-words">
                  {getContent("mobile_paket_explanation")}
                </p>
              </div>
            </div>
          </div>

          {/* Operatör Resmi*/}
          <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-6xl bg-white p-6 rounded-3xl shadow-md my-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 w-full">
              {operators.map((operator) => (
                <div
                  key={operator.id}
                  className="bg-[#e5e5e6] text-white p-4 rounded-xl mx-1 h-full flex items-center justify-center hover:scale-105 transform transition-transform duration-500 ease-in-out"
                  style={{ minHeight: "120px" }}
                >
                  <Link
                    href={`/kontor-yukleme/${operator.idName}`}
                    className="flex flex-col items-center justify-center w-full h-full gap-2"
                  >
                    <Image
                      src={`https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${operator.imageID}`}
                      alt={`${operator.idName}`}
                      width={128}
                      height={64}
                      className="object-contain"
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
