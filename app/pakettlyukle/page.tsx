"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import React from "react";
import Loading from "../loading";

type SiteInfo = {
    id: number;
    key: string;
    content: string;
};

const PakettlyukleContent = () => {
    const searchParams = useSearchParams();
    const section = searchParams.get("section");
    const [highlighted, setHighlighted] = useState<string | null>(null);
    const [data, setData] = useState<SiteInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/table/siteinfo")
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Veri alınamadı:", err)
                setIsLoading(false); // Hata olsa bile yüklenmeyi kapat
            });
    }, []);

    // key'e göre içeriği al
    const getContent = (key: string) => {
        return data.find((item) => item.key === key)?.content || "Yükleniyor...";
    };

    useEffect(() => {
        if (section) {
            const element = document.getElementById(section);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });

                setHighlighted(section);

                setTimeout(() => setHighlighted(null), 1000);
            }
        }
    }, [section]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loading />
            </div>
        );
    }
    return (
        <div className="container mx-auto p-6 ">

            {/* PAKETTLYUKLE Başlık */}
            <div className="justify-center items-center flex mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center bg-white w-fit p-5 rounded-3xl">{getContent('site_title')}</h1>
            </div>

            {/* Hakkımızda */}
            <div>
                <div
                    id="hakkimizda"
                    className={clsx(
                        "mb-2 p-3  rounded-2xl transition-all duration-500 w-fit ",
                        highlighted === "hakkimizda" ? "bg-slate-300" : "bg-white"
                    )}
                >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold ">{getContent('hakkimizda_title')}</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium whitespace-pre-line",
                    highlighted === "hakkimizda" ? "bg-slate-300" : "bg-white"
                )}>
                    <p>
                        {getContent('hakkimizda_description')}
                    </p>
                </div>
            </div>

            {/* İletişim
            <div>
                <div
                    id="iletisim"
                    className={clsx(
                        "mb-2 p-3  rounded-2xl transition-all duration-500 w-fit ",
                        highlighted === "iletisim" ? "bg-slate-300" : "bg-white"
                    )}
                >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">{getContent('iletisim_title')}</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium whitespace-pre-line",
                    highlighted === "iletisim" ? "bg-slate-300" : "bg-white"
                )}>
                    <p className="mb-3">
                        {getContent('iletisim_description')}
                    </p>
                </div>
            </div> */}

            {/* E-Fatura */}
            <div>
                <div
                    id="e-fatura"
                    className={clsx(
                        "mb-2 p-3  rounded-2xl transition-all duration-500 w-fit ",
                        highlighted === "e-fatura" ? "bg-slate-300" : "bg-white"
                    )}
                >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">{getContent('fatura_title')}</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium whitespace-pre-line",
                    highlighted === "e-fatura" ? "bg-slate-300" : "bg-white"
                )}>
                    <p>
                        {getContent('fatura_description')}
                    </p>
                </div>
            </div>

            <div className="mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium bg-white w-fit">
                <p>{getContent('bilgilendirme')}</p>
            </div>

        </div>
    );
};

const Pakettlyukle = () => {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <PakettlyukleContent />
        </React.Suspense>
    );
};

export default Pakettlyukle;
