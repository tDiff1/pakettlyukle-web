"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CreditCardForm from "@/components/CreditCardForm";
import Loading from "@/app/loading";
import { motion, AnimatePresence } from "framer-motion";
import slugify from "slugify";

type Packet = {
  id: number;
  key: string;
  packet_title: string;
  packet_content: string;
  heryone_dk: number;
  heryone_sms: number;
  heryone_int: number;
  price: number;
};

const PacketDetail = () => {
  const { idName, packetId } = useParams();
  const router = useRouter();
  const [packet, setPacket] = useState<Packet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [phone, setPhone] = useState("");

  const formattedIdName =
    typeof idName === "string"
      ? idName.charAt(0).toUpperCase() + idName.slice(1).toLowerCase()
      : "Operatör";

  const getPacketSlug = (title: string) =>
    slugify(title, { lower: true, strict: true });

  useEffect(() => {
    setLoading(true);
    fetch("/api/table/packets")
      .then((res) => res.json())
      .then((packetsData) => {
        const selectedPacket = packetsData.find(
          (p: Packet) =>
            p.key === idName &&
            getPacketSlug(p.packet_title) === String(packetId).toLowerCase()
        );
        setPacket(selectedPacket || null);
      })
      .catch((err) => console.error("Veri alınamadı:", err))
      .finally(() => setLoading(false));
  }, [idName, packetId]);

  useEffect(() => {
    if (phone.replace(/\s/g, "").length !== 10) {
      setShowCreditCardForm(false);
    }
  }, [phone]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 10);

    const formattedValue = value
      .replace(/(\d{3})(\d{1,3})/, "$1 $2")
      .replace(/(\d{3}) (\d{3})(\d{1,2})/, "$1 $2 $3")
      .replace(/(\d{3}) (\d{3}) (\d{2})(\d{1,2})/, "$1 $2 $3 $4")
      .trim();

    setPhone(formattedValue);
  };

  const handleLoadPacket = () => {
    if (phone.replace(/\s/g, "").length === 10) {
      setShowCreditCardForm(true);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto my-6">
      <div className="w-full bg-white p-6 rounded-3xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center">
            {formattedIdName} - Paket Detayı
          </h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Geri Dön
          </button>
        </div>
        {loading ? (
          <p className="text-center">Yükleniyor...</p>
        ) : !packet ? (
          <p className="text-center">Paket bulunamadı.</p>
        ) : (
          <div className="bg-gradient-to-r from-[#e5e5e6] to-[#f0f0f0] p-6 rounded-xl flex flex-col justify-between min-h-[360px]">
            <div className="flex flex-col gap-4">
              {/* Başlık */}
              <h2 className="text-xl font-bold text-orange-400">
                {packet.packet_title}
              </h2>

              {/* Açıklama (min sabit yükseklik) */}
              <p className="text-black font-bold  min-h-[60px]">
                {packet.packet_content}
              </p>

              {/* DK/SMS/GB Bilgisi (boş da olsa kutu sabit kalsın) */}
              <div className="text-black font-bold  grid grid-cols-2 gap-2 min-h-[64px]">
                <p>Heryöne {packet.heryone_dk || 0} DK</p>
                <p>Heryöne {packet.heryone_sms || 0} SMS</p>
                <p>Heryöne {packet.heryone_int || 0} GB</p>
              </div>

              {/* Fiyat */}
              <p className="font-bold text-black text-lg bg-orange-300 w-fit p-1 px-3 rounded-xl">
                Fiyat: {packet.price} TL
              </p>
            </div>

            {/* Butonlar */}
            <div className="mt-6 flex flex-col gap-4">
              <AnimatePresence>
                {!showPhoneInput && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setShowPhoneInput(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                  >
                    Paketi Yükle
                  </motion.button>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showPhoneInput && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
                      <span className="font-semibold text-gray-800">+90</span>
                      <input
                        type="tel"
                        placeholder="Telefon numaranızı giriniz"
                        className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg font-semibold transition-all"
                        maxLength={13}
                        value={phone}
                        onChange={handleInputChange}
                      />
                    </div>

                    {phone.replace(/\s/g, "").length === 10 && (
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleLoadPacket}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                      >
                        Paketi Yükle
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showCreditCardForm && packet && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CreditCardForm phone={phone} selectedPacket={packet} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PacketDetail;
