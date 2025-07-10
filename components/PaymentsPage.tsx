"use client";
import { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type Payment = {
  id: number;
  musteriNumber?: string;
  musteriNo: string;
  operator: string;
  paket: string;
  paketid: number;
  tutar: number;
  saat: string;
  tarih: string;
  onayDurumu: boolean;
  gonderimDurumu: string;
  createdAt: string;
  clientOrderId?: string;
};

type Packets = {
  id: number;
  key: string;
  packet_title: string;
  packet_content: string;
  heryone_dk: number;
  heryone_sms: number;
  heryone_int: number;
  price: number;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [packet, setPackets] = useState<Packets[]>([]);
  const [expandedId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(
    null
  );
  const [modalStatusOption, setModalStatusOption] = useState<"Gönderildi" | "İade Edildi" | null>(null);


  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedSoundIds = useRef<Set<number>>(new Set());
  const dismissedHighlightIds = useRef<Set<number>>(new Set());

  const fetchPayments = () => {
    fetch("/api/payments")
      .then((res) => res.json())
      .then((data: Payment[]) => {
        const now = new Date().getTime();

        const timestamps = data.map((p) => new Date(p.createdAt).getTime());
        const min = new Date(Math.min(...timestamps));
        const max = new Date(Math.max(...timestamps));
        const format = (d: Date) => d.toISOString().split("T")[0];
        setMinDate(format(min));
        setMaxDate(format(max));
        setStartDate(format(min));
        setEndDate(format(max));

        const newlyCreatedPayments = data.filter((p) => {
          const createdAt = new Date(p.createdAt).getTime();
          const isNew = now - createdAt < 10000;
          const notPlayed = !playedSoundIds.current.has(p.id);
          return isNew && notPlayed;
        });

        if (newlyCreatedPayments.length > 0 && audioRef.current) {
          audioRef.current
            .play()
            .catch((e) => console.error("Ses çalma hatası:", e));
          newlyCreatedPayments.forEach((p) => playedSoundIds.current.add(p.id));
        }

        // Reddedilen ödemeleri logla
        const reddedilenOdemeler = data.filter(
          (p) => !p.onayDurumu && p.gonderimDurumu === "Reddedildi"
        );
        console.log("Reddedilen Ödemeler:", reddedilenOdemeler);

        setPayments(data);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch((err) => console.error("Veri alınamadı:", err));
  };

  const handleExport = () => {
    const filtered = payments.filter((p) => {
      const date = new Date(p.createdAt).getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      return date >= start && date <= end;
    });

    const exportData = filtered.map((p) => ({
      ID: p.id,
      MüşteriNo: p.musteriNo,
      Operatör: p.operator,
      Paket: p.paket,
      Tutar: p.tutar,
      Tarih: p.tarih,
      Saat: p.saat,
      Onay: p.onayDurumu ? "Evet" : "Hayır",
      Gönderim: p.gonderimDurumu,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Odemeler");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `pakettlyukle_odemeler_${startDate}_to_${endDate}.xlsx`);
  };

  useEffect(() => {
    fetchPayments();

    fetch("/api/table/packets")
      .then((res) => res.json())
      .then((data) => setPackets(data))
      .catch((err) => console.error("Veri alınamadı:", err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPayments();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

const handleGonderimGuncelle = async (id: number, durum: string) => {
  const res = await fetch(`/api/payments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gonderimDurumu: durum }),
  });

  if (res.ok) {
    const updated = await res.json();
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, gonderimDurumu: updated.gonderimDurumu } : p
      )
    );
    setShowModal(false);
    setSelectedPaymentId(null);
    setModalStatusOption(null);
  } else {
    console.error("Gönderim durumu güncellenemedi.");
  }
};



  const openModal = (id: number) => {
    setSelectedPaymentId(id);
    setShowModal(true);
  };

  function renderPacketDetails(paketid: number) {
    const packetDetails = packet.find((p) => p.id === paketid);

    if (packetDetails) {
      return (
        <div className="mt-4 bg-gray-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm text-gray-600">
          <p>
            <strong>Paket:</strong> {packetDetails.packet_title}
          </p>
          <p>
            <strong>İçerik:</strong> {packetDetails.packet_content}
          </p>
          {(packetDetails.heryone_dk !== 0 ||
            packetDetails.heryone_sms !== 0 ||
            packetDetails.heryone_int !== 0) && (
            <div>
              <p>
                <strong>Konuşma:</strong> {packetDetails.heryone_dk} DK
              </p>
              <p>
                <strong>SMS:</strong> {packetDetails.heryone_sms} SMS
              </p>
              <p>
                <strong>İnternet:</strong> {packetDetails.heryone_int} GB
              </p>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="mt-4 bg-gray-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm text-gray-600">
          <p>
            Bu paketin detayları için veri tabanında ek alanlara ihtiyacın
            olabilir.
          </p>
        </div>
      );
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
      <audio ref={audioRef} src="/sound/beep.mp3" preload="auto" />

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Ödeme Bildirimleri
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Son güncelleme: {lastUpdated || "Henüz güncellenmedi"}
            </p>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
            <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
              <label htmlFor="start" className="text-xs sm:text-sm">
                Başlangıç:
              </label>
              <input
                type="date"
                id="start"
                value={startDate}
                min={minDate}
                max={maxDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto border rounded px-2 py-1 text-xs sm:text-sm"
              />
              <label htmlFor="end" className="text-xs sm:text-sm">
                Bitiş:
              </label>
              <input
                type="date"
                id="end"
                value={endDate}
                min={minDate}
                max={maxDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto border rounded px-2 py-1 text-xs sm:text-sm"
              />
            </div>
            <button
              onClick={handleExport}
              className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-xs sm:text-sm"
            >
              Excel&apos;e Aktar
            </button>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <p className="text-gray-600 text-sm text-center">
          Henüz ödeme yapılmamış.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {[
            {
              title: "✅ Onaylanan",
              filter: (p: Payment) =>
                p.onayDurumu && p.gonderimDurumu === "Beklemede",
            },
            {
              title: "🕒 Bekleyen",
              filter: (p: Payment) =>
                !p.onayDurumu && p.gonderimDurumu !== "Reddedildi",
            },
            {
              title: "🚚 Gönderilen",
              filter: (p: Payment) =>
                p.onayDurumu && p.gonderimDurumu === "Gönderildi",
            },
            {
              title: "İade Edilen",
              filter: (p: Payment) =>
                p.onayDurumu && p.gonderimDurumu === "İade Edildi",
            },
            {
              title: "❌ Reddedilen",
              filter: (p: Payment) =>
                !p.onayDurumu && p.gonderimDurumu === "Reddedildi",
            },
          ].map(({ title, filter }, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-md">
              <h2
                className={`text-lg font-semibold mb-4 cursor-pointer ${
                  title === "🕒 Bekleyen" || title === "✅ Onaylanan"
                    ? "hover:text-blue-600"
                    : "cursor-default text-gray-500"
                } transition`}
                onClick={async () => {
                  if (title === "🕒 Bekleyen" || title === "✅ Onaylanan") {
                    const updates = payments.filter(filter);
                    for (const p of updates) {
                      const newStatus =
                        title === "🕒 Bekleyen" ? "Gönderildi" : "Beklemede";
                      const res = await fetch(`/api/payments/${p.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ gonderimDurumu: newStatus }),
                      });
                      if (res.ok) {
                        setPayments((prev) =>
                          prev.map((pay) =>
                            pay.id === p.id
                              ? { ...pay, gonderimDurumu: newStatus }
                              : pay
                          )
                        );
                      }
                    }
                  }
                }}
              >
                {title}
              </h2>

              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1">
                <div className="flex gap-3">
                  {payments.filter(filter).length === 0 ? (
                    <p className="text-sm text-gray-400">Hiç ödeme yok.</p>
                  ) : (
                    payments.filter(filter).map((pay) => {
                      const paymentDate = new Date(pay.createdAt);
                      const now = new Date();
                      const isNew =
                        now.getTime() - paymentDate.getTime() < 30000 &&
                        !dismissedHighlightIds.current.has(pay.id);

                      return (
                        <div
                          key={pay.id}
                          className={`min-w-[250px] bg-gray-50 p-3 rounded-lg text-xs sm:text-sm ${
                            isNew ? "bg-yellow-100" : ""
                          }`}
                        >
                          <div className="space-y-1">
                            <p>
                              <strong>Müşteri Adı:</strong> {pay.musteriNumber || "N/A"}
                            </p>
                            <p>
                              <strong>Müşteri No:</strong> {pay.musteriNo}
                            </p>
                            <p>
                              <strong>Operatör:</strong> {pay.operator}
                            </p>
                            <p>
                              <strong>Paket:</strong> {pay.paket}
                            </p>
                            <p>
                              <strong>Tutar:</strong> {pay.tutar} TL
                            </p>
                            <p>
                              <strong>Tarih:</strong> {pay.tarih} - {pay.saat}
                            </p>
                            {pay.onayDurumu && pay.gonderimDurumu && (
                              <p
                                className={`font-medium ${
                                  pay.gonderimDurumu === "Gönderildi"
                                    ? "text-green-600"
                                    : pay.gonderimDurumu === "Reddedildi"
                                    ? "text-red-600"
                                    : "text-orange-600 cursor-pointer hover:underline"
                                }`}
                                onClick={
                                  pay.gonderimDurumu === "Beklemede"
                                    ? () => openModal(pay.id)
                                    : undefined
                                }
                              >
                                {pay.gonderimDurumu}
                              </p>
                            )}
                            {

                            }
                          </div>
                          {expandedId === pay.id &&
                            renderPacketDetails(pay.paketid)}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h3 className="text-lg font-semibold mb-4">Bu işlem için durumu seçin:</h3>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => {
            setModalStatusOption("Gönderildi");
            selectedPaymentId &&
              handleGonderimGuncelle(selectedPaymentId, "Gönderildi");
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Gönderildi
        </button>
        <button
          onClick={() => {
            setModalStatusOption("İade Edildi");
            selectedPaymentId &&
              handleGonderimGuncelle(selectedPaymentId, "İade Edildi");
          }}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          İade Edildi
        </button>
        <button
          onClick={() => {
            setShowModal(false);
            setSelectedPaymentId(null);
            setModalStatusOption(null);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Vazgeç
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
