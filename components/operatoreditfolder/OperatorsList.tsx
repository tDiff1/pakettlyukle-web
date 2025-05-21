"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

type Operators = {
  id: number;
  key: string;
  name: string;
  idName: string;
  imageID: string;
  hover: string;
  CompanyCode: number;
  aktiflik: number; // aktiflik sayı (0 veya 1)
};

const OperatorsList = () => {
  const [data, setData] = useState<Operators[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/table/operators")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Veri alınamadı:", err);
        setLoading(false);
      });
  }, []);

  // --- DÜZELTME BURADA ---
  const activeOperators = data.filter(
    (operator) => Number(operator.aktiflik) === 1
  );
  const inactiveOperators = data.filter(
    (operator) => Number(operator.aktiflik) === 0
  );
  const removedOperators = data.filter(
    (operator) => Number(operator.aktiflik) === 2
  );

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Operatörler Listesi</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Aktif Operatörler</h2>
        {activeOperators.length > 0 ? (
          <ul className="flex flex-wrap gap-4">
            {activeOperators.map((operator) => (
              <li key={operator.id}>
                <div
                  className={`relative group bg-[#e5e5e6] flex flex-row shadow-md w-fit p-10 rounded-xl mx-1 items-center justify-center hover:scale-105 transform transition-transform duration-500 ease-in-out`}
                  style={{ minHeight: "120px" }}
                >
                  {/* Resim */}
                  <div className="relative w-96 h-20 z-10">
                    <Image
                      src={`https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${operator.imageID}`}
                      fill
                      className="object-contain"
                      alt={`${operator.idName}`}
                      priority
                    />
                  </div>

                  {/* Blur ve Buton Katmanı */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/30  opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl z-20"></div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Aktif operatör bulunamadı.</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Pasif Operatörler</h2>
        {inactiveOperators.length > 0 ? (
          <ul className="flex flex-wrap gap-4">
            {inactiveOperators.map((operator) => (
              <li key={operator.id}>
                <div
                  className={`relative group bg-[#e5e5e6] ${operator.hover} flex flex-row shadow-md w-fit p-10 rounded-xl mx-1 items-center justify-center hover:scale-105 transform transition-transform duration-500 ease-in-out`}
                  style={{ minHeight: "120px" }}
                >
                  {/* Resim */}
                  <div className="relative w-96 h-20 z-10">
                    <Image
                      src={`https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${operator.imageID}`}
                      fill
                      className="object-contain"
                      alt={`${operator.idName}`}
                      priority
                    />
                  </div>

                  {/* Blur ve Buton Katmanı */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/30  opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl z-20"></div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Pasif operatör bulunamadı.</p>
        )}
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Çıkarılmış Operatörler</h2>
        {removedOperators.length > 0 ? (
          <ul className="flex flex-wrap gap-4">
            {removedOperators.map((operator) => (
              <li key={operator.id}>
                <div
                  className={`relative group bg-[#e5e5e6] ${operator.hover} flex flex-row shadow-md w-fit p-10 rounded-xl mx-1 items-center justify-center hover:scale-105 transform transition-transform duration-500 ease-in-out`}
                  style={{ minHeight: "120px" }}
                >
                  {/* Resim */}
                  <div className="relative w-96 h-20 z-10">
                    <Image
                      src={`https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${operator.imageID}`}
                      fill
                      className="object-contain"
                      alt={`${operator.idName}`}
                      priority
                    />
                  </div>

                  {/* Blur ve Buton Katmanı */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/30  opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl z-20"></div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Çıkarılmış operatör bulunamadı.</p>
        )}
      </section>
    </div>
  );
};

export default OperatorsList;
