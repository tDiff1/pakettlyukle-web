"use client";

import { useState } from "react";
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


export default function Page() {
    const router = useRouter();
    const params = useParams();

    const selectedOperator = operatorler.find(op => op.idName === params.operator) || operatorler[0] as { idName: string, name: string, imageID?: string };

    const [phone, setPhone] = useState("");
    
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

    return (

        <div className="flex flex-col items-center p-4 sm:p-6 md:p-10 no-select">

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
                        priority={true}
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
                        <div className="flex items-center gap-2 border  border-gray-300 p-3 rounded-2xl shadow-sm">
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

                        {/* Uyarı Metni */}
                        <p className="text-red-500 font-semibold text-center text-xs md:text-sm">
                            Yalnızca faturasız hatlar için geçerlidir
                        </p>

                        {/* TL Yükle ve Paket Yükle Butonları */}
                        <div className="flex gap-4 justify-center">
                            <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition font-semibold shadow-md" >
                                Paket & TL Yükle
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
