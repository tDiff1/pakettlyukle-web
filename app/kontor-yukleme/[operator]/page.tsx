"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import CreditCardForm from "@/components/CreditCardForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loading from "../../loading";

type Packets = {
  id: number;
  key: string;
  packet_title: string;
  packet_content: string;
  heryone_dk: number;
  heryone_sms: number;
  heryone_int: number;
  price: number;
  sort_order: number;
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

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const [phone, setPhone] = useState(""); // Telefon numarası
  const [isOpen, setIsOpen] = useState(false); // Kutu açık mı?
  const [error, setError] = useState(""); // Hata mesajı
  const [operators, setOperators] = useState<Operators[]>([]);
  const [isVisible, setIsVisible] = useState(false); // Paketler görünür mü?
  const [isBoxVisible, setIsBoxVisible] = useState(false); // Animasyon için görünürlük durumu
  const [isPacketVisible, setIsPacketVisible] = useState(false);
  const selectedOperator =
    operators.find((op) => op.idName === params.operator) ||
    (operators[0] as { idName: string; name: string; imageID?: string });
  const [packet, setPackets] = useState<Packets[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPacket, setSelectedPacket] = useState<Packets | null>(null); // Seçilen paket

  useEffect(() => {
    Promise.all([
      fetch("/api/table/operators").then((res) => res.json()),
      fetch("/api/table/packets").then((res) => res.json()),
    ])
      .then(([operatorsData, packetsData]) => {
        setOperators(
          operatorsData.filter((op: Operators) => op.aktiflik === 1)
        );
        setPackets(packetsData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Veri alınamadı:", err);
        setIsLoading(false); // Hata olsa bile yüklenmeyi kapat
      });
  }, []);

  useEffect(() => {
    // Paketler kısmını yavaşça görünür yap
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300); // 300ms gecikme

    return () => clearTimeout(timer); // Temizlik
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsBoxVisible(true); // Smooth görünüm için görünür yap
      }, 100); // 100ms gecikme

      return () => clearTimeout(timer); // Temizlik
    } else {
      setIsBoxVisible(false); // Kutu kapandığında görünürlüğü kaldır
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPacket) {
      const timer = setTimeout(() => {
        setIsPacketVisible(true); // Smooth görünüm için görünür yap
      }, 100); // 100ms gecikme

      return () => clearTimeout(timer); // Temizlik
    } else {
      setIsPacketVisible(false); // Paket seçimi kaldırıldığında görünürlüğü kaldır
    }
  }, [selectedPacket]);

  // Butona tıklanınca çalışacak fonksiyon
  const handleButtonClick = async () => {
    if (phone.length < 13) {
      setError("Telefon numarası eksik veya hatalı!");
      setIsOpen(false);
    } else {
      // const cleanPhone = phone.replace(/\s+/g, '');

      // Operatör sorgulaması geçici olarak devre dışı bırakıldı
      /*
            const response = await fetch('/api/operator_sorgu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: cleanPhone }),
            });
            const data = await response.json();
    
            const operatorMap = new Map<number, string>([
                [1, "turkcell"],
                [2, "turk-telekom, bimcell, pttcell"],
                [3, "vodafone"],
                [0, "bilinmeyen"],
            ]);
    
            const detectedOperator = operatorMap.get(Number(data.data));
    
            if (!detectedOperator) {
                setError("Operatör belirlenemedi.");
                setIsOpen(false);
                return;
            }
    
            if (detectedOperator !== params.operator) {
                setError(
                    `Girdiğiniz numara ${detectedOperator.toUpperCase()} operatörüne ait. Lütfen doğru operatörü seçin.`
                );
                setIsOpen(false);
                return;
            }
            */

      setError(""); // Hata mesajını temizle
      setIsOpen(true);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 10); // Maksimum 10 hane

    const formattedValue = value
      .replace(/(\d{3})(\d{1,3})/, "$1 $2") // 3'ten sonra boşluk ekle
      .replace(/(\d{3}) (\d{3})(\d{1,2})/, "$1 $2 $3") // 6'dan sonra boşluk ekle
      .replace(/(\d{3}) (\d{3}) (\d{2})(\d{1,2})/, "$1 $2 $3 $4") // 8'den sonra boşluk ekle
      .trim();

    setPhone(formattedValue);
  };

  const handlePacketSelect = (packet: Packets) => {
    setSelectedPacket(packet); // Seçilen paketi kaydet
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 md:p-10 no-select">
      {/* Logo ve Başlık */}
      {/* Başlık: Bildirim İkonu ve Operatör Bilgisi */}
      <div className="flex items-center justify-between w-full max-w-6xl bg-white p-6 rounded-3xl shadow-md">
        <div className="text-xl hidden md:block">
          <Breadcrumb>
            <BreadcrumbList className="text-xl">
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Kontör Yükleme</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/kontor-yukleme/${selectedOperator.idName}`}
                >
                  {selectedOperator.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Image
            src={
              "https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/other-pic/notification.png"
            }
            alt="Bildirim"
            width={60}
            height={60}
          />
          <div className="flex flex-col">
            <h1 className="font-semibold text-lg md:text-xl">
              {selectedOperator.name} Paket & TL Kontör Yükle
            </h1>
            <p className="text-sm md:text-base">
              TL ve Paket yüklemek için telefon numarasını giriniz
            </p>
          </div>
        </div>
      </div>

      {/* Operatör Resmi ve Operatör Değiştir Butonu */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-6xl bg-white p-6 rounded-3xl shadow-md my-6">
        {/* Operatör Resmi */}
        {selectedOperator?.imageID ? (
          <Image
            src={`https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${selectedOperator.imageID}`}
            alt={selectedOperator.name}
            width={250}
            height={250}
            className="p-6 mb-4  rounded-3xl md:mb-0 bg-[#e5e5e6]"
            priority
          />
        ) : (
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-lg">
            ?
          </div>
        )}

        {/* Operatör Değiş Butonu */}
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-2xl px-6 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 transition shadow-lg focus:outline-none"
                aria-label="Operatör değiştir"
              >
                Operatör Değiştir
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden animate-fade-in">
              {operators.map((op) => (
                <DropdownMenuItem
                  key={op.idName}
                  onClick={() => router.push(`/kontor-yukleme/${op.idName}`)}
                  className="text-gray-700 text-lg px-4 py-2 hover:bg-blue-100 transition-all duration-200 cursor-pointer flex items-center gap-2"
                >
                  <Image
                    src={`https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${op.imageID}`}
                    alt={op.name}
                    width={38}
                    height={38}
                    className="rounded-full scale-125"
                  />
                  {op.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Telefon Girişi ve TL/Paket Yükle Butonları */}
      <div className="flex flex-col items-center w-full max-w-6xl bg-white p-6 rounded-3xl shadow-md">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-4">
            {/* Telefon Numarası Girişi */}
            {!isOpen && (
              <div className="flex items-center gap-2 border border-gray-300 p-3 rounded-2xl shadow-sm">
                <span className="font-semibold">+90</span>
                <input
                  type="tel"
                  placeholder="Telefon numaranızı giriniz"
                  className="w-full p-2 focus:outline-none font-semibold"
                  maxLength={13}
                  value={phone}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Hata Mesajı */}
            {!isOpen && error && (
              <p className="text-red-500 font-semibold text-center text-xs md:text-sm">
                {error}
              </p>
            )}

            {/* Uyarı Metni */}
            {!isOpen && (
              <p className="text-red-500 font-semibold text-center text-xs md:text-sm">
                Yalnızca faturasız hatlar için geçerlidir
              </p>
            )}

            {/* TL Yükle ve Paket Yükle Butonu */}
            {!isOpen && (
              <div className="flex gap-4 justify-center">
                <button
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition font-semibold shadow-md"
                  onClick={handleButtonClick}
                >
                  Paket & TL Yükle
                </button>
              </div>
            )}

            {/* Kullanıcının Telefon Numarası */}
            {isOpen && (
              <div className="flex flex-col items-center gap-2 bg-gray-100 p-6 rounded-2xl shadow-md">
                <p className="text-lg font-semibold text-black">
                  Telefon Numaranız:
                </p>
                <p className="text-2xl font-bold text-black">+90 {phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Açılacak Kutu */}
      {isOpen && (
        <div
          className={`w-full max-w-6xl bg-white rounded-3xl shadow-md my-6 transition-all duration-700 ease-in-out transform ${
            isBoxVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-10 scale-95"
          }`}
        >
          {selectedPacket ? (
            <div
              className={`transition-all duration-700 ease-in-out transform ${
                isPacketVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-10 scale-95"
              }`}
            >
              {/* Seçilen Paket Görünümü */}
              <div className="relative p-4">
                {/* Geri Dön Butonu */}
                <div className="flex justify-start mb-6">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-3xl hover:bg-blue-600 transition"
                    onClick={() => setSelectedPacket(null)} // Geri dön
                  >
                    Geri Dön
                  </button>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-8">
                    Seçilen Paket
                  </h2>
                </div>
                {/* Seçilen Paket İçeriği */}
                <div className="bg-[#e5e5e6] rounded-3xl shadow-lg p-6 flex flex-col items-center">
                  <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-center text-orange-400">
                    {selectedPacket.packet_title}
                  </h3>
                  <div className="text-center mt-4 ">
                    <p className=" lg:text-base text-black font-bold">
                      {selectedPacket.packet_content}
                    </p>
                    {(selectedPacket.heryone_dk !== 0 ||
                      selectedPacket.heryone_sms !== 0 ||
                      selectedPacket.heryone_int !== 0) && (
                      <div className="sm:text-sm lg:text-base text-black font-bold">
                        <p>Heryöne {selectedPacket.heryone_dk} Dakika</p>
                        <p>Heryöne {selectedPacket.heryone_sms} SMS</p>
                        <p>Heryöne {selectedPacket.heryone_int} GB İnternet</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xl font-bold text-black mt-4 w-fit p-1 px-6 bg-orange-300 rounded-2xl">
                    {selectedPacket.price} TL
                  </p>
                </div>
              </div>
              {selectedPacket && (
                <CreditCardForm phone={phone} selectedPacket={selectedPacket} />
              )}
            </div>
          ) : (
            // Paket Listesi Görünümü
            <div>
              <h1 className="text-center text-2xl sm:text-3xl lg:text-4xl font-bold my-6 mb-10">
                Paketler
              </h1>
              <div
                className={`bg-white p-4 rounded-lg shadow-lg transition-opacity duration-700 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {packet
                    .filter((p) => p.key === selectedOperator.idName)
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((filteredPacket) => (
                      <li
                        key={filteredPacket.id}
                        className="p-3 bg-[#e5e5e6] rounded-3xl shadow-sm hover:bg-gray-100 hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer flex flex-col justify-between"
                        onClick={() => handlePacketSelect(filteredPacket)}
                      >
                        <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-center text-orange-400">
                          {filteredPacket.packet_title}
                        </h3>
                        <div className="text-center mt-2">
                          <p className=" lg:text-base text-black font-bold">
                            {filteredPacket.packet_content}
                          </p>
                        </div>
                        <div className="text-center mt-2">
                          {(filteredPacket.heryone_dk !== 0 ||
                            filteredPacket.heryone_sms !== 0 ||
                            filteredPacket.heryone_int !== 0) && (
                            <div className="sm:text-sm lg:text-base text-black font-bold">
                              <p>Heryöne {filteredPacket.heryone_dk} Dakika</p>
                              <p>Heryöne {filteredPacket.heryone_sms} SMS</p>
                              <p>
                                Heryöne {filteredPacket.heryone_int} GB İnternet
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex justify-center items-center text-xl w-full">
                          <button className="w-full max-w-[150px] p-3 bg-orange-300 hover:bg-[#e5e5e6] text-black font-bold text-center rounded-3xl">
                            {filteredPacket.price} TL
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
