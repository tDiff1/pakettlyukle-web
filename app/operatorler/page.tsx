"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Loading from "@/app/loading";

type Operators = {
  id: number;
  key: string;
  name: string;
  idName: string;
  imageID: string;
  hover: string;
  aktiflik: number;
};

const Operatörler = () => {
  const [operators, setOperators] = useState<Operators[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/table/operators")
      .then((res) => res.json())
      .then((operatorsData) =>
        setOperators(operatorsData.filter((op: Operators) => op.aktiflik === 1))
      )
      .catch((err) => console.error("Veri alınamadı:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 py-6 md:min-h-[920px]  lg:min-h-[600px]">
      <div className="w-full bg-white p-4 sm:p-6 rounded-3xl shadow-md">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {operators.map((operator) => (
            <Link
              key={operator.id}
              href={`operatorler/${operator.idName}/paketler`}
              className="group"
            >
              <div
                className="bg-[#e5e5e6] p-4 rounded-xl h-full flex items-center justify-center transition-transform duration-300 ease-in-out group-hover:scale-105"
                style={{ minHeight: "140px" }}
              >
                <Image
                  src={`https://9p0znkmu3n4ej0xg.public.blob.vercel-storage.com/pakettlyukle/operatorler/${operator.imageID}`}
                  alt={operator.idName}
                  width={160}
                  height={60}
                  className="object-contain max-h-[60px]"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Operatörler;
