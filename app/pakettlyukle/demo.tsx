"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import React from "react";
import Link from "next/link";


const PakettlyukleContent = () => {
    const searchParams = useSearchParams();
    const section = searchParams.get("section");
    const [highlighted, setHighlighted] = useState<string | null>(null);

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

    return (
        <div className="container mx-auto p-6 ">

            {/* PAKETTLYUKLE Başlık */}
            <div className="justify-center items-center flex mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center bg-white w-fit p-5 rounded-3xl">PAKET TL YÜKLE</h1>
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
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold ">Hakkımızda</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium",
                    highlighted === "hakkimizda" ? "bg-slate-300" : "bg-white"
                )}>
                    <p>
                        Ttelekominikasyon olarak, müşterilerimize en iyi dijital iletişim ve telekomünikasyon hizmetlerini sunmayı amaçlıyoruz.
                        Yenilikçi çözümlerimizle, mobil ve internet dünyasında kullanıcılarımızın ihtiyaçlarını karşılamak için sürekli gelişiyor ve teknolojik yenilikleri takip ediyoruz.
                        Güvenilir altyapımız ve müşteri odaklı hizmet anlayışımızla, sektörde fark yaratmayı hedefliyoruz.
                    </p>
                </div>
            </div>

            {/* İletişim */}
            <div>
                <div
                    id="iletisim"
                    className={clsx(
                        "mb-2 p-3  rounded-2xl transition-all duration-500 w-fit ",
                        highlighted === "iletisim" ? "bg-slate-300" : "bg-white"
                    )}
                >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">İletişim</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium",
                    highlighted === "iletisim" ? "bg-slate-300" : "bg-white"
                )}>
                    <p className="mb-3">
                        Ttelekominikasyon, Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, müşterilerinin kişisel verilerini hukuka uygun bir şekilde işlemektedir. Verilerinizin toplanma amaçları, saklanma süreleri ve üçüncü taraflarla paylaşım ilkelerimiz aşağıdaki gibidir:<br />
                    </p>
                    <p className="mb-2">
                        Müşteri memnuniyeti bizim için en önemli önceliktir. Size en hızlı ve en etkili desteği sunabilmek için birçok iletişim kanalımız mevcuttur.
                        Sorularınızı, önerilerinizi ve taleplerinizi aşağıdaki yöntemlerle bize iletebilirsiniz:<br />
                    </p>
                    <p className="mb-2">
                        -7/24 hizmet veren müşteri destek hattımız: <Link href="tel:+908503095571" className="text-blue-500 hover:underline">+90 850 309 55 71</Link><br />
                        -E-Posta: <a href="mailto:destek@ttelekom.com.tr" className=" text-blue-500 hover:underline">destek@ttelekom.com.tr</a><br />
                        -Canlı Destek: <Link href="https://wa.me/908503095571" target="_blank" rel="noopener noreferrer" className=" text-blue-500 hover:underline">WhatsApp ile mesaj gönder</Link><br />
                    </p>
                    <p>
                        Müşterilerimizin her zaman yanındayız ve en iyi deneyimi sağlamak için çalışıyoruz.
                    </p>
                </div>
            </div>

            {/* E-Fatura */}
            <div>
                <div
                    id="e-fatura"
                    className={clsx(
                        "mb-2 p-3  rounded-2xl transition-all duration-500 w-fit ",
                        highlighted === "e-fatura" ? "bg-slate-300" : "bg-white"
                    )}
                >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">E-Fatura</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium",
                    highlighted === "e-fatura" ? "bg-slate-300" : "bg-white"
                )}>
                    <p>
                        Dijital dönüşümün bir parçası olarak, doğaya duyarlılığımızı artırmak ve işlemleri kolaylaştırmak için e-fatura sistemini destekliyoruz.
                        E-fatura sayesinde kağıt israfını önleyerek çevreye katkıda bulunuyor ve müşterilerimize daha hızlı, güvenilir bir fatura hizmeti sunuyoruz.
                        E-faturalarınızı görüntülemek ve yönetmek için:<br />

                        Online müşteri panelimizden erişebilirsiniz

                        E-posta ile bildirim alabilirsiniz

                        Otomatik ödeme talimatı vererek faturalarınızı kolayca ödeyebilirsiniz

                    </p>
                </div>
            </div>

            <div className="mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium bg-white w-fit">
                <p>Ttelekominikasyon olarak, sizlere en iyi hizmeti sunmak için çalışmaya devam ediyoruz.</p>
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
