"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import React from "react";


const YasalContent = () => {
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
        <div className="container mx-auto p-6">

            {/* Yasal Bilgiler Başlık */}
            <div className="justify-center items-center flex mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center bg-white w-fit p-5 rounded-3xl">Yasal Bilgiler</h1>
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
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold ">İptal ve İade Koşulları</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium",
                    highlighted === "iptal-ve-iade" ? "bg-slate-300" : "bg-white"
                )}>
                    <p className="mb-3">
                        Ttelekominikasyon olarak, müşteri memnuniyetini ön planda tutuyoruz. Hizmetlerimizden herhangi biriyle ilgili iptal veya iade talebiniz olduğunda, aşağıdaki koşullar geçerlidir:<br />
                    </p>
                    <p>
                        - Abonelik tabanlı hizmetlerde, iptal talepleri belirlenen fatura dönemleri içerisinde yapılmalıdır.<br />
                        - Dijital ürünlerde iade yapılamaz. Ancak, eğer ürün henüz yüklenmemiş ise iade edilebilir.<br />
                        - Fiziksel ürünlerde, cayma hakkı 14 gün içerisinde kullanılabilir ve iade prosedürlerimize uygun olarak işlem yapılmalıdır.
                    </p>
                </div>
            </div>

            {/* KVKK */}
            <div>
                <div
                    id="kvkk"
                    className={clsx(
                        "mb-2 p-3  rounded-2xl transition-all duration-500 w-fit ",
                        highlighted === "kvkk" ? "bg-slate-300" : "bg-white"
                    )}
                >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">KVKK(Kişisel Verileri Koruma Kanunu)</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium",
                    highlighted === "kvkk" ? "bg-slate-300" : "bg-white"
                )}>
                    <p className="mb-3">
                        Ttelekominikasyon, Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, müşterilerinin kişisel verilerini hukuka uygun bir şekilde işlemektedir. Verilerinizin toplanma amaçları, saklanma süreleri ve üçüncü taraflarla paylaşım ilkelerimiz aşağıdaki gibidir:<br />
                    </p>
                    <p>
                        - Verileriniz yalnızca ilgili hizmetlerin sunulması amacıyla işlenmektedir.<br />
                        - Verilerinizi izniniz olmadan üçüncü kişilerle paylaşmayız.<br />
                        - KVK kanununa uygun olarak, verilerinize erişim, düzenleme ve silme hakkına sahipsiniz.</p>
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
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Gizlilik Politikası</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium",
                    highlighted === "gizlilik-politikasi" ? "bg-slate-300" : "bg-white"
                )}>
                    <p className="mb-3">
                        Ttelekominikasyon olarak, müşterilerimizin gizliliğine büyük önem veriyoruz. Gizlilik politikamız aşağıdaki ilkeler çerçevesinde belirlenmiştir:<br />
                    </p>
                    <p>
                        - Toplanan veriler yalnızca belirlenen hizmetler için kullanılır.<br />
                        - Verileriniz güvenli sunucularımızda saklanmakta ve yetkisiz erişimlere karşı korunmaktadır.<br />
                        - Kredi kartı ve ödeme bilgileri gibi hassas verileriniz şifreleme ile korunmaktadır.
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
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Kullanıcı Sözleşmesi</h2>
                </div>
                <div className={clsx(
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium",
                    highlighted === "kullanici-sozlesmesi" ? "bg-slate-300" : "bg-white"
                )}>
                    <p className="mb-3">
                        Ttelekominikasyon hizmetlerini kullanan herkes, aşağıdaki kuralları kabul etmiş sayılır:<br />
                    </p>
                    <p>
                        - Kullanıcılar, hizmetleri yasal ve etik kurallar dahilinde kullanmalıdır.<br />
                        - Hizmetlerin ödeme ve abonelik detayları, işbu sözleşme kapsamında belirtilmiştir.<br />
                        - Hizmetlerin ticari kullanımı, özel izne tabidir ve aksi durumlarda hukuki yaptırımlar uygulanabilir.</p>
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
                    "mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium",
                    highlighted === "ucretler-ve-limitler" ? "bg-slate-300" : "bg-white"
                )}>
                    <p className="mb-3">
                        Ttelekominikasyon hizmetlerinin fiyatlandırması ve kullanım limitleri aşağıdaki gibidir:<br />
                    </p>
                    <p>
                        - Abonelik paketleri ve hizmet ücretleri, dönemsel olarak güncellenebilir.<br />
                        - Kullanım limitleri, seçilen paketlere ve hizmet türüne bağlı olarak değişebilir.<br />
                        - Ekstra kullanım durumlarında aşım ücretleri uygulanabilir ve bunlar abonelik planlarında belirtilir.
                    </p>
                </div>
            </div>
            <div className="mb-8 p-3 text-sm sm:text-md md:text-lg rounded-2xl transition-all duration-500  font-medium bg-white w-fit">
                <p>Bu politikalarla ilgili detaylı bilgi almak için müşteri hizmetlerimizle iletişime geçebilirsiniz.</p>
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
