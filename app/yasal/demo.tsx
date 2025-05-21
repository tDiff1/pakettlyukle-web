"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import React from "react";
import Loading from "../loading";

type Yasal = {
    id: number;
    key: string;
    content: string;
};



const YasalContent = () => {
    const searchParams = useSearchParams();
    const section = searchParams.get("section");
    const [highlighted, setHighlighted] = useState<string | null>(null);
    const [data, setData] = useState<Yasal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/table/yasal")
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
        <div className="container mx-auto p-6">

            {/* Yasal Bilgiler Başlık */}
            <div className="justify-center items-center flex mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center bg-white w-fit p-5 rounded-3xl">{getContent('yasal_title')}</h1>
            </div>

            {/* İptal-iade */}
            <div>
                <div
                    id="iptal-ve-iade"
                    className={clsx(
                        "mb-2 p-3  rounded-2xl transition-all duration-500 w-fit ",
                        highlighted === "iptal-ve-iade" ? "bg-slate-300" : "bg-white"
                    )}
                >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold ">{getContent('iptal_title')}</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium whitespace-pre-line",
                    highlighted === "iptal-ve-iade" ? "bg-slate-300" : "bg-white"
                )}>
                    <p className="mb-3">
                    {getContent('iptal_description')} <br />
                    </p>
                </div>
            </div>

            {/* KVKK */}
            <div>
                <div
                    id="kvkk"
                    className={clsx(
                        "mb-2 p-3  rounded-2xl transition-all duration-500 w-fit",
                        highlighted === "kvkk" ? "bg-slate-300" : "bg-white"
                    )}
                >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">{getContent('kvkk_title')}</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium whitespace-pre-line",
                    highlighted === "kvkk" ? "bg-slate-300" : "bg-white"
                )}>
                    <p className="mb-3">
                        {getContent('kvkk_description')}<br />
                    </p>
                </div>
            </div>

            {/* Gizlilik Politikası */}
            <div>
                <div
                    id="gizlilik-politikasi"
                    className={clsx(
                        "mb-2 p-3  rounded-2xl transition-all duration-500 w-fit ",
                        highlighted === "gizlilik-politikasi" ? "bg-slate-300" : "bg-white"
                    )}
                >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">{getContent('gizlilik_title')}</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium whitespace-pre-line",
                    highlighted === "gizlilik-politikasi" ? "bg-slate-300" : "bg-white"
                )}>
                    <p className="mb-3">
                        {getContent('gizlilik_description')}
                    </p>
                </div>
            </div>

            {/* Kullanıcı Sözleşmesi */}
            <div>
                <div
                    id="kullanici-sozlesmesi"
                    className={clsx(
                        "mb-2 p-3  rounded-2xl transition-all duration-500 w-fit",
                        highlighted === "kullanici-sozlesmesi" ? "bg-slate-300" : "bg-white"
                    )}
                >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">{getContent('kulsoz_title')}</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium whitespace-pre-line",
                    highlighted === "kullanici-sozlesmesi" ? "bg-slate-300" : "bg-white"
                )}>
                    <p className="mb-3">
                        {getContent('kulsoz_description')}
                    </p>

                </div>
            </div>

            {/* Ücretler ve limitler */}
            <div>
                <div
                    id="ucretler-ve-limitler"
                    className={clsx(
                        "mb-2 p-3  rounded-2xl transition-all duration-500 w-fit font-medium",
                        highlighted === "ucretler-ve-limitler" ? "bg-slate-300" : "bg-white"
                    )}
                >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Ücretler ve limitler</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium whitespace-pre-line",
                    highlighted === "ucretler-ve-limitler" ? "bg-slate-300" : "bg-white"
                )}>
                    <p className="mb-3">
                        {getContent('ucli_description')}
                    </p>
                </div>
            </div>
            <div className="mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium bg-white w-fit">
                <p>{getContent('bilgilendirme')}</p>
            </div>

        </div>
    );
};

const Yasal = () => {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <YasalContent />
        </React.Suspense>
    );
};

export default Yasal;
