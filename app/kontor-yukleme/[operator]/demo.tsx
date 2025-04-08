"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { operatorler } from "@/app/tools/operatorler";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Packets = {
    id: number;
    key: string;
    packet_title: string;
    packet_content: string;
    kupur: string;
    heryone_dk: number;
    yd_dk: number;
    heryone_sms: number;
    heryone_int: number;
    price: number;
};

export default function Page() {
    const router = useRouter();
    const params = useParams();
    const [phone, setPhone] = useState(""); // Telefon numarası
    const [isOpen, setIsOpen] = useState(false); // Kutu açık mı?
    const [error, setError] = useState(""); // Hata mesajı
    const selectedOperator = operatorler.find(op => op.idName === params.operator) || operatorler[0] as { idName: string, name: string, imageID?: string };
    const [packet, setData] = useState<Packets[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPacket, setSelectedPacket] = useState<Packets | null>(null); // Seçilen paket

    useEffect(() => {
        fetch("../api/table/packets")
            .then((res) => res.json())
            .then((packets) => {
                setData(packets);
                setIsLoading(false); // Veri yüklendiğinde loading durumunu kapat
            })
            .catch((err) => {
                console.error("Veri alınamadı:", err)
                setIsLoading(false); // Hata olsa bile yüklemeyi kapat
            });
    }, []);

    // Butona tıklanınca çalışacak fonksiyon
    const handleButtonClick = () => {
        if (phone.length < 13) {
            setError("Telefon numarası eksik veya hatalı!");
            setIsOpen(false);
        } else {
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
                                <BreadcrumbLink>{selectedOperator.name}</BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Image
                        src={'/notification.png'}
                        alt="Bildirim"
                        width={60}
                        height={60}
                    />
                    <div className="flex flex-col">
                        <h1 className="font-semibold text-lg md:text-xl">{selectedOperator.name} Paket & TL Kontör Yükle</h1>
                        <p className="text-sm md:text-base">TL ve Paket yüklemek için telefon numarasını giriniz</p>
                    </div>
                </div>
            </div>

            {/* Operatör Resmi ve Operatör Değiştir Butonu */}
            <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-6xl bg-white p-6 rounded-3xl shadow-md my-6">
                {/* Operatör Resmi */}
                {selectedOperator?.imageID ? (
                    <Image
                        src={`/operatorler/${selectedOperator.imageID}`}
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
                            >
                                Operatör Değiştir
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden animate-fade-in">
                            {operatorler.map(op => (
                                <DropdownMenuItem
                                    key={op.idName}
                                    onClick={() => router.push(`/kontor-yukleme/${op.idName}`)}
                                    className="text-gray-700 text-lg px-4 py-2 hover:bg-blue-100 transition-all duration-200 cursor-pointer flex items-center gap-2"
                                >
                                    <Image
                                        src={`/operatorler/${op.imageID}`}
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
                            <p className="text-red-500 font-semibold text-center text-xs md:text-sm">{error}</p>
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
                            <div className="text-center">
                                <p className="text-lg font-semibold">Telefon Numaranız:</p>
                                <p className="text-xl font-bold text-gray-800">+90 {phone}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Açılacak Kutu */}
            {isOpen && (
                <div className="w-full max-w-6xl bg-white rounded-3xl shadow-md my-6">
                    {selectedPacket ? (
                        <div>
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
                                    <h3 className="font-semibold text-2xl text-center text-gray-800">
                                        {selectedPacket.packet_title}
                                    </h3>
                                    <div className="text-center mt-4">
                                        <p className="text-base text-gray-600">{selectedPacket.packet_content}</p>
                                        <p className="text-base text-gray-600">Heryöne {selectedPacket.heryone_dk} Dakika</p>
                                        <p className="text-base text-gray-600">Yurt Dışı {selectedPacket.yd_dk} Dakika</p>
                                        <p className="text-base text-gray-600">Heryöne {selectedPacket.heryone_sms} SMS</p>
                                        <p className="text-base text-gray-600">Heryöne {selectedPacket.heryone_int} MB İnternet</p>
                                        <p className="text-xl font-bold text-gray-800 mt-4">{selectedPacket.price} TL</p>
                                    </div>
                                </div>
                            </div>
                            {selectedPacket && (
                                <div className="mt-6 bg-white p-6 rounded-3xl shadow-lg">
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6">
                                        Ödeme Yöntemleri
                                    </h2>
                                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                                        <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold shadow-md">
                                            Kredi Kartı ile Öde
                                        </button>
                                        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold shadow-md">
                                            Banka Kartı ile Öde
                                        </button>
                                        <button className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold shadow-md">
                                            Mobil Ödeme
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Paket Listesi Görünümü
                        <div>
                            <h1 className="text-center text-2xl sm:text-3xl lg:text-4xl font-bold my-6 mb-10">Paketler</h1>
                            <div className="bg-white p-4 rounded-lg shadow-lg">
                                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                                    {packet
                                        .filter(p => p.key === selectedOperator.idName)
                                        .map(filteredPacket => (
                                            <li
                                                key={filteredPacket.id}
                                                className="p-3 bg-[#e5e5e6] rounded-3xl shadow-sm hover:bg-gray-100 transition cursor-pointer flex flex-col justify-between"
                                                onClick={() => handlePacketSelect(filteredPacket)} // Paket seçimi
                                            >
                                                <h3 className="font-semibold text-lg sm:text-xl lg:text-2xl text-center text-gray-800">
                                                    {filteredPacket.packet_title}
                                                </h3>
                                                <div className="text-center mt-2">
                                                    <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                                                        {filteredPacket.packet_content}
                                                    </p>
                                                </div>
                                                <div className="text-center mt-2">
                                                    <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                                                        Heryöne {filteredPacket.heryone_dk} Dakika
                                                    </p>
                                                    <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                                                        Yurt Dışı {filteredPacket.yd_dk} Dakika
                                                    </p>
                                                    <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                                                        Heryöne {filteredPacket.heryone_sms} SMS
                                                    </p>
                                                    <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                                                        Heryöne {filteredPacket.heryone_int} MB İnternet
                                                    </p>
                                                </div>
                                                <div className="mt-4 flex justify-center items-center text-xl w-full">
                                                    <button className="w-full max-w-[150px] p-3 bg-[#fefeff] hover:bg-[#e5e5e6] text-gray-600 font-bold text-center rounded-3xl">
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
