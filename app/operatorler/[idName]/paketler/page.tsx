"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import slugify from "slugify";
import Loading from "@/app/loading";

type Packet = {
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

type Operator = {
  id: number;
  name: string;
  idName: string;
};

const PacketList = () => {
  const { idName } = useParams();
  const router = useRouter();
  const [packets, setPackets] = useState<Packet[]>([]);
  const [operatorName, setOperatorName] = useState<string>("Operatör");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      // Paketleri al
      fetch("/api/table/packets")
        .then((res) => res.json())
        .then((packetsData) =>
          setPackets(
            packetsData.filter((packet: Packet) => packet.key === idName)
          )
        ),
      // Operatör adını al
      fetch("/api/table/operatorsadd")
        .then((res) => res.json())
        .then((operators: Operator[]) => {
          const operator = operators.find(
            (op: Operator) => op.idName === idName
          );
          setOperatorName(operator?.name || "Operatör");
        }),
    ])
      .catch((err) => console.error("Veri alınamadı:", err))
      .finally(() => setLoading(false));
  }, [idName]);

  if (loading) {
    return <Loading />;
  }

  const getPacketSlug = (title: string) =>
    slugify(title, { lower: true, strict: true });

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto my-6">
      <div className="w-full bg-white p-6 rounded-3xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center">
            {operatorName} Paketleri
          </h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Geri Dön
          </button>
        </div>
        {loading ? (
          <p className="text-center">Yükleniyor...</p>
        ) : packets.length === 0 ? (
          <p className="text-center">Bu operatör için paket bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packets.sort((a, b) => a.sort_order - b.sort_order).map((packet) => (
              <Link
                key={packet.packet_title}
                href={`/operatorler/${idName}/${getPacketSlug(
                  packet.packet_title
                )}`}
                className="bg-[#e5e5e6] p-4 rounded-xl flex flex-col justify-between hover:scale-105 transform transition-transform duration-300 min-h-[250px]"
              >
                {/* Başlık */}
                <h2 className="text-xl font-bold text-orange-400 mb-2">
                  {packet.packet_title}
                </h2>

                {/* Açıklama */}
                <p className="text-sm sm:text-sm lg:text-md text-black font-bold  mb-3">
                  {packet.packet_content}
                </p>

                {/* DK / SMS / GB */}
                {(packet.heryone_dk !== 0 ||
                  packet.heryone_sms !== 0 ||
                  packet.heryone_int !== 0) && (
                  <div className="text-sm sm:text-sm lg:text-md text-black font-bold  mb-2">
                    <p>Heryöne {packet.heryone_dk} DK</p>
                    <p>Heryöne {packet.heryone_sms} SMS</p>
                    <p>Heryöne {packet.heryone_int} GB</p>
                  </div>
                )}

                {/* Fiyat */}
                <p className="font-bold text-black  bg-orange-300 w-fit p-1 rounded-xl px-4 text-sm mt-auto">
                  Fiyat: {packet.price} TL
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PacketList;
